import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import reportService from './reportService';

class AsyncStorageDraftService {
  constructor() {
    this.isOnline = true;
    this.setupNetworkListener();
  }

  // Network status monitoring
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected && state.isInternetReachable;
    });
  }

  getNetworkStatus() {
    return { isOnline: this.isOnline };
  }

  // AsyncStorage keys
  getStorageKeys() {
    return {
      DRAFTS: '@report_drafts',
      SYNC_STATUS: '@draft_sync_status'
    };
  }

  // Save draft (offline-only for drafts, online only for submissions)
  async saveDraft(draftData) {
    try {
      console.log('💾 Saving draft offline only...', { online: this.isOnline });
      
      // Always save drafts offline - they should only go online when submitted
      return await this.saveOfflineDraft(draftData);

    } catch (error) {
      console.error('❌ Error saving draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save draft (hybrid online/offline) - for backward compatibility
  async saveDraftHybrid(draftData) {
    try {
      console.log('💾 Saving draft...', { online: this.isOnline });

      // Try online first if available
      if (this.isOnline) {
        try {
          const onlineResult = await reportService.saveDraft(draftData);
          if (onlineResult.success) {
            console.log('✅ Draft saved online successfully');
            return onlineResult;
          }
        } catch (error) {
          console.log('⚠️ Online save failed, falling back to offline:', error.message);
        }
      }

      // Fallback to offline storage
      return await this.saveOfflineDraft(draftData);

    } catch (error) {
      console.error('❌ Error saving draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save draft offline to AsyncStorage
  async saveOfflineDraft(draftData) {
    try {
      const draftsKey = this.getStorageKeys().DRAFTS;
      const existingDrafts = await this.getOfflineDrafts();
      
      const newDraft = {
        ...draftData,
        id: `offline_draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOffline: true,
        needsSync: true
      };

      const updatedDrafts = [...existingDrafts, newDraft];
      await AsyncStorage.setItem(draftsKey, JSON.stringify(updatedDrafts));

      console.log('✅ Draft saved offline:', newDraft.id);
      return {
        success: true,
        data: newDraft,
        isOffline: true
      };

    } catch (error) {
      console.error('❌ Error saving offline draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update draft (offline-only for drafts)
  async updateDraft(draftId, updatedData) {
    try {
      console.log('📝 Updating draft offline only...', { draftId, online: this.isOnline });

      // Always update drafts offline - they should only go online when submitted
      return await this.updateOfflineDraft(draftId, updatedData);

    } catch (error) {
      console.error('❌ Error updating draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update draft (hybrid online/offline) - for backward compatibility
  async updateDraftHybrid(draftId, updatedData) {
    try {
      console.log('📝 Updating draft...', { draftId, online: this.isOnline });

      // Check if it's an offline draft
      const isOfflineDraft = draftId.startsWith('offline_draft_');

      if (!isOfflineDraft && this.isOnline) {
        // Try online update for online drafts
        try {
          const onlineResult = await reportService.updateDraft(draftId, updatedData);
          if (onlineResult.success) {
            console.log('✅ Draft updated online successfully');
            return onlineResult;
          }
        } catch (error) {
          console.log('⚠️ Online update failed, falling back to offline:', error.message);
        }
      }

      // Fallback to offline update
      return await this.updateOfflineDraft(draftId, updatedData);

    } catch (error) {
      console.error('❌ Error updating draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update draft offline
  async updateOfflineDraft(draftId, updatedData) {
    try {
      const draftsKey = this.getStorageKeys().DRAFTS;
      const existingDrafts = await this.getOfflineDrafts();
      
      const draftIndex = existingDrafts.findIndex(draft => draft.id === draftId);
      
      if (draftIndex === -1) {
        return {
          success: false,
          error: 'Draft not found'
        };
      }

      existingDrafts[draftIndex] = {
        ...existingDrafts[draftIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(),
        needsSync: true
      };

      await AsyncStorage.setItem(draftsKey, JSON.stringify(existingDrafts));

      console.log('✅ Draft updated offline:', draftId);
      return {
        success: true,
        data: existingDrafts[draftIndex],
        isOffline: true
      };

    } catch (error) {
      console.error('❌ Error updating offline draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all drafts (offline-only since drafts are now offline-only)
  async getDrafts(userId) {
    try {
      // Get offline drafts only (since all drafts are now offline)
      const offlineDrafts = await this.getOfflineDrafts(userId);
      
      console.log(`📋 Retrieved ${offlineDrafts.length} drafts (0 online, ${offlineDrafts.length} offline)`);
      
      return {
        success: true,
        data: offlineDrafts
      };

    } catch (error) {
      console.error('❌ Error getting drafts:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Get all drafts (hybrid online/offline) - for backward compatibility
  async getDraftsHybrid(userId) {
    try {
      let onlineDrafts = [];
      let offlineDrafts = [];

      // Get online drafts if available
      if (this.isOnline) {
        try {
          const onlineResult = await reportService.getUserReports(userId);
          if (onlineResult.success && onlineResult.data) {
            onlineDrafts = onlineResult.data.filter(report => report.status === 'draft');
          }
        } catch (error) {
          console.log('⚠️ Failed to fetch online drafts:', error.message);
        }
      }

      // Get offline drafts
      offlineDrafts = await this.getOfflineDrafts(userId);

      // Combine and return all drafts
      const allDrafts = [...onlineDrafts, ...offlineDrafts];
      
      console.log(`📋 Retrieved ${allDrafts.length} drafts (${onlineDrafts.length} online, ${offlineDrafts.length} offline)`);
      
      return {
        success: true,
        data: allDrafts
      };

    } catch (error) {
      console.error('❌ Error getting drafts:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Get offline drafts only
  async getOfflineDrafts(userId = null) {
    try {
      const draftsKey = this.getStorageKeys().DRAFTS;
      const storedDrafts = await AsyncStorage.getItem(draftsKey);
      
      if (!storedDrafts) {
        return [];
      }

      let drafts = JSON.parse(storedDrafts);
      
      // Filter by user if specified
      if (userId) {
        drafts = drafts.filter(draft => draft.reporterId === userId);
      }

      return drafts;

    } catch (error) {
      console.error('❌ Error getting offline drafts:', error);
      return [];
    }
  }

  // Delete draft (hybrid online/offline)
  async deleteDraft(draftId) {
    try {
      console.log('🗑️ Deleting draft...', { draftId, online: this.isOnline });

      const isOfflineDraft = draftId.startsWith('offline_draft_');

      if (!isOfflineDraft && this.isOnline) {
        // Try online delete for online drafts
        try {
          const onlineResult = await reportService.deleteDraft(draftId);
          if (onlineResult.success) {
            console.log('✅ Draft deleted online successfully');
            return onlineResult;
          }
        } catch (error) {
          console.log('⚠️ Online delete failed, trying offline:', error.message);
        }
      }

      // Delete from offline storage
      return await this.deleteOfflineDraft(draftId);

    } catch (error) {
      console.error('❌ Error deleting draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete offline draft
  async deleteOfflineDraft(draftId) {
    try {
      const draftsKey = this.getStorageKeys().DRAFTS;
      const existingDrafts = await this.getOfflineDrafts();
      
      const filteredDrafts = existingDrafts.filter(draft => draft.id !== draftId);
      await AsyncStorage.setItem(draftsKey, JSON.stringify(filteredDrafts));

      console.log('✅ Draft deleted offline:', draftId);
      return { success: true };

    } catch (error) {
      console.error('❌ Error deleting offline draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sync offline drafts to server
  async syncOfflineDrafts() {
    try {
      if (!this.isOnline) {
        return {
          success: false,
          error: 'No internet connection'
        };
      }

      const offlineDrafts = await this.getOfflineDrafts();
      const unsyncedDrafts = offlineDrafts.filter(draft => draft.needsSync);

      if (unsyncedDrafts.length === 0) {
        return {
          success: true,
          message: 'No drafts to sync'
        };
      }

      console.log(`🔄 Syncing ${unsyncedDrafts.length} offline drafts...`);

      let syncedCount = 0;
      let failedCount = 0;

      for (const draft of unsyncedDrafts) {
        try {
          // Remove offline-specific fields before syncing
          const { id, isOffline, needsSync, ...draftToSync } = draft;
          
          const result = await reportService.saveDraft(draftToSync);
          
          if (result.success) {
            // Mark as synced and remove from offline storage
            await this.deleteOfflineDraft(draft.id);
            syncedCount++;
            console.log(`✅ Synced draft: ${draft.id}`);
          } else {
            failedCount++;
            console.log(`❌ Failed to sync draft: ${draft.id}`, result.error);
          }
        } catch (error) {
          failedCount++;
          console.log(`❌ Error syncing draft: ${draft.id}`, error.message);
        }
      }

      return {
        success: true,
        syncedCount,
        failedCount,
        message: `Synced ${syncedCount} drafts, ${failedCount} failed`
      };

    } catch (error) {
      console.error('❌ Error syncing offline drafts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get unsynced drafts count
  async getUnsyncedCount() {
    try {
      const offlineDrafts = await this.getOfflineDrafts();
      return offlineDrafts.filter(draft => draft.needsSync).length;
    } catch (error) {
      console.error('❌ Error getting unsynced count:', error);
      return 0;
    }
  }

  // Clear all offline drafts
  async clearOfflineDrafts() {
    try {
      const draftsKey = this.getStorageKeys().DRAFTS;
      await AsyncStorage.removeItem(draftsKey);
      console.log('✅ All offline drafts cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing offline drafts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new AsyncStorageDraftService();
