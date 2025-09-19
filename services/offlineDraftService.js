import NetInfo from '@react-native-community/netinfo';
import sqliteService from './sqliteService';
import reportService from './reportService';

class OfflineDraftService {
  constructor() {
    this.isOnline = true;
    this.initNetworkListener();
  }

  // Initialize network connectivity listener
  async initNetworkListener() {
    try {
      // Check initial network state
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected && netInfo.isInternetReachable;
      
      // Listen for network changes
      NetInfo.addEventListener(state => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected && state.isInternetReachable;
        
        if (!wasOnline && this.isOnline) {
          console.log('📶 Network restored - syncing offline drafts...');
          this.syncOfflineDrafts();
        } else if (wasOnline && !this.isOnline) {
          console.log('📵 Network lost - switching to offline mode');
        }
      });
    } catch (error) {
      console.error('❌ Error initializing network listener:', error);
      this.isOnline = false; // Default to offline if we can't detect
    }
  }

  // Get current network status
  async getNetworkStatus() {
    try {
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected && netInfo.isInternetReachable;
      return {
        isOnline: this.isOnline,
        connectionType: netInfo.type,
        isInternetReachable: netInfo.isInternetReachable
      };
    } catch (error) {
      console.error('❌ Error checking network status:', error);
      return { isOnline: false, connectionType: 'none', isInternetReachable: false };
    }
  }

  // Save draft (automatically chooses online or offline)
  async saveDraft(draftData) {
    try {
      const networkStatus = await this.getNetworkStatus();
      
      if (networkStatus.isOnline) {
        console.log('📶 Online - saving draft to MongoDB...');
        try {
          // Try to save online first
          const result = await reportService.saveDraft(draftData);
          if (result.success) {
            console.log('✅ Draft saved online successfully');
            return { success: true, isOffline: false, data: result.data };
          } else {
            throw new Error(result.message || 'Online save failed');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online save failed, falling back to offline:', onlineError.message);
          // Fall back to offline save
          return await this.saveOfflineDraft(draftData);
        }
      } else {
        console.log('📵 Offline - saving draft locally...');
        return await this.saveOfflineDraft(draftData);
      }
    } catch (error) {
      console.error('❌ Error in saveDraft:', error);
      return { success: false, error: error.message };
    }
  }

  // Update draft (automatically chooses online or offline)
  async updateDraft(draftId, draftData) {
    try {
      const networkStatus = await this.getNetworkStatus();
      
      // Check if this is an offline draft
      const isOfflineDraft = draftId.startsWith('OFFLINE_DRAFT_');
      
      if (networkStatus.isOnline && !isOfflineDraft) {
        console.log('📶 Online - updating draft in MongoDB...');
        try {
          const result = await reportService.updateDraft(draftId, draftData);
          if (result.success) {
            console.log('✅ Draft updated online successfully');
            return { success: true, isOffline: false, data: result.data };
          } else {
            throw new Error(result.message || 'Online update failed');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online update failed, falling back to offline:', onlineError.message);
          // Fall back to offline update
          return await this.updateOfflineDraft(draftId, draftData);
        }
      } else {
        console.log('📵 Offline or offline draft - updating locally...');
        return await this.updateOfflineDraft(draftId, draftData);
      }
    } catch (error) {
      console.error('❌ Error in updateDraft:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all drafts (combines online and offline)
  async getAllDrafts(reporterId) {
    try {
      const networkStatus = await this.getNetworkStatus();
      let onlineDrafts = [];
      let offlineDrafts = [];

      // Always get offline drafts
      const offlineResult = await sqliteService.getOfflineDrafts(reporterId);
      if (offlineResult.success) {
        offlineDrafts = offlineResult.data;
      }

      // Try to get online drafts if connected
      if (networkStatus.isOnline) {
        try {
          const onlineResult = await reportService.getUserDrafts(reporterId, 1, 100);
          if (onlineResult.success) {
            onlineDrafts = onlineResult.data.map(draft => ({
              ...draft,
              isOffline: false
            }));
          }
        } catch (onlineError) {
          console.warn('⚠️ Failed to fetch online drafts:', onlineError.message);
        }
      }

      // Combine and deduplicate drafts
      const allDrafts = [...offlineDrafts, ...onlineDrafts];
      
      // Sort by updated date (most recent first)
      allDrafts.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      });

      console.log(`📋 Retrieved ${offlineDrafts.length} offline + ${onlineDrafts.length} online = ${allDrafts.length} total drafts`);
      
      return {
        success: true,
        data: allDrafts,
        offlineCount: offlineDrafts.length,
        onlineCount: onlineDrafts.length,
        networkStatus: networkStatus
      };
    } catch (error) {
      console.error('❌ Error getting all drafts:', error);
      return { success: false, data: [] };
    }
  }

  // Delete draft (handles both online and offline)
  async deleteDraft(draftId) {
    try {
      const networkStatus = await this.getNetworkStatus();
      const isOfflineDraft = draftId.startsWith('OFFLINE_DRAFT_');

      if (isOfflineDraft) {
        // Always delete offline drafts locally
        return await sqliteService.deleteOfflineDraft(draftId);
      } else if (networkStatus.isOnline) {
        // Try to delete online draft
        try {
          const result = await reportService.deleteDraft(draftId);
          if (result.success) {
            console.log('✅ Draft deleted online successfully');
            return { success: true };
          } else {
            throw new Error(result.message || 'Online delete failed');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online delete failed:', onlineError.message);
          return { success: false, error: onlineError.message };
        }
      } else {
        return { success: false, error: 'Cannot delete online draft while offline' };
      }
    } catch (error) {
      console.error('❌ Error deleting draft:', error);
      return { success: false, error: error.message };
    }
  }

  // Private methods for offline operations
  async saveOfflineDraft(draftData) {
    try {
      const result = await sqliteService.saveOfflineDraft(draftData);
      if (result.success) {
        console.log('✅ Draft saved offline successfully');
        return { success: true, isOffline: true, draftId: result.draftId };
      } else {
        throw new Error(result.error || 'Offline save failed');
      }
    } catch (error) {
      console.error('❌ Error saving offline draft:', error);
      return { success: false, error: error.message };
    }
  }

  async updateOfflineDraft(draftId, draftData) {
    try {
      const result = await sqliteService.updateOfflineDraft(draftId, draftData);
      if (result.success) {
        console.log('✅ Draft updated offline successfully');
        return { success: true, isOffline: true };
      } else {
        throw new Error(result.error || 'Offline update failed');
      }
    } catch (error) {
      console.error('❌ Error updating offline draft:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync offline drafts to MongoDB when online
  async syncOfflineDrafts(reporterId) {
    try {
      const networkStatus = await this.getNetworkStatus();
      if (!networkStatus.isOnline) {
        console.log('📵 Cannot sync - device is offline');
        return { success: false, error: 'Device is offline' };
      }

      const unsyncedDrafts = await sqliteService.getUnsyncedDrafts(reporterId);
      if (unsyncedDrafts.length === 0) {
        console.log('✅ No drafts to sync');
        return { success: true, syncedCount: 0 };
      }

      console.log(`🔄 Syncing ${unsyncedDrafts.length} offline drafts...`);
      let syncedCount = 0;
      let failedCount = 0;

      for (const draft of unsyncedDrafts) {
        try {
          // Prepare draft data for MongoDB
          const draftData = {
            type: draft.reportType,
            reporterId: draft.reporterId,
            language: draft.language,
            gpsLocation: draft.gpsLocation,
            location: draft.location,
            incidentDate: draft.incidentDate,
            incidentTime: draft.incidentTime,
            projectInfo: draft.projectInfo,
            commodity: draft.commodity,
            siteStatus: draft.siteStatus,
            operatorInfo: draft.operatorInfo,
            additionalInfo: draft.additionalInfo,
            ...draft.formData,
            attachments: draft.attachments
          };

          // Save to MongoDB
          const result = await reportService.saveDraft(draftData);
          if (result.success) {
            // Mark as synced in SQLite
            await sqliteService.markDraftAsSynced(draft.draftId, result.data?._id);
            syncedCount++;
            console.log(`✅ Synced draft ${draft.draftId}`);
          } else {
            failedCount++;
            console.error(`❌ Failed to sync draft ${draft.draftId}:`, result.message);
          }
        } catch (syncError) {
          failedCount++;
          console.error(`❌ Error syncing draft ${draft.draftId}:`, syncError.message);
        }
      }

      console.log(`🔄 Sync complete: ${syncedCount} synced, ${failedCount} failed`);
      return { 
        success: true, 
        syncedCount, 
        failedCount, 
        totalProcessed: unsyncedDrafts.length 
      };
    } catch (error) {
      console.error('❌ Error syncing offline drafts:', error);
      return { success: false, error: error.message };
    }
  }

  // Get sync status for UI
  async getSyncStatus(reporterId) {
    try {
      const unsyncedDrafts = await sqliteService.getUnsyncedDrafts(reporterId);
      const networkStatus = await this.getNetworkStatus();
      
      return {
        unsyncedCount: unsyncedDrafts.length,
        canSync: networkStatus.isOnline && unsyncedDrafts.length > 0,
        networkStatus: networkStatus
      };
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      return { unsyncedCount: 0, canSync: false, networkStatus: { isOnline: false } };
    }
  }

  // Clear all offline data
  async clearOfflineData() {
    try {
      const result = await sqliteService.clearAllOfflineDrafts();
      if (result.success) {
        console.log('🗑️ All offline drafts cleared');
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to clear offline data');
      }
    } catch (error) {
      console.error('❌ Error clearing offline data:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new OfflineDraftService();
