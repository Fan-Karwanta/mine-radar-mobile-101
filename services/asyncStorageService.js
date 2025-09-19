import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageService {
  constructor() {
    this.isInitialized = false;
    this.storageKeys = {
      USER_AUTH: 'user_auth',
      DIRECTORY_NATIONAL: 'directory_national',
      DIRECTORY_LOCAL: 'directory_local', 
      DIRECTORY_HOTSPOTS: 'directory_hotspots',
      SYNC_STATUS: 'sync_status',
      REPORT_DRAFTS: 'report_drafts',
      OFFLINE_STORAGE_INFO: 'offline_storage_info'
    };
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Initialize storage info if it doesn't exist
      const storageInfo = await this.getStorageInfo();
      if (!storageInfo) {
        await this.setStorageInfo({
          national: { count: 0, lastSync: null },
          local: { count: 0, lastSync: null },
          hotspots: { count: 0, lastSync: null },
          drafts: { count: 0, lastSync: null }
        });
      }
      
      this.isInitialized = true;
      console.log('AsyncStorage service initialized successfully');
    } catch (error) {
      console.error('AsyncStorage initialization error:', error);
      throw error;
    }
  }

  // Generic storage methods
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  }

  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  // User Authentication Methods
  async saveUserAuth(userData) {
    try {
      await this.init();
      const authData = {
        ...userData,
        isLoggedIn: true,
        lastLogin: new Date().toISOString()
      };
      await this.setItem(this.storageKeys.USER_AUTH, authData);
      console.log('User auth saved to AsyncStorage');
      return true;
    } catch (error) {
      console.error('Error saving user auth:', error);
      return false;
    }
  }

  async getUserAuth() {
    try {
      await this.init();
      const authData = await this.getItem(this.storageKeys.USER_AUTH);
      return authData && authData.isLoggedIn ? authData : null;
    } catch (error) {
      console.error('Error getting user auth:', error);
      return null;
    }
  }

  async clearUserAuth() {
    try {
      await this.removeItem(this.storageKeys.USER_AUTH);
      console.log('User auth cleared from AsyncStorage');
    } catch (error) {
      console.error('Error clearing user auth:', error);
    }
  }

  // Directory Data Methods
  async saveDirectoryRecords(tableName, records) {
    try {
      await this.init();
      
      const storageKey = this.getStorageKeyForTable(tableName);
      if (!storageKey) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      // Get existing records to avoid duplicates
      const existingRecords = await this.getItem(storageKey) || [];
      const existingIds = new Set(existingRecords.map(record => record._id));
      
      // Filter out duplicates
      const newRecords = records.filter(record => !existingIds.has(record._id));
      const allRecords = [...existingRecords, ...newRecords];
      
      // Save records
      await this.setItem(storageKey, allRecords);
      
      // Update storage info
      await this.updateStorageInfo(tableName, allRecords.length);
      
      console.log(`Saved ${newRecords.length} new records to ${tableName} (${records.length - newRecords.length} duplicates ignored)`);
      
      return {
        saved: newRecords.length,
        duplicates: records.length - newRecords.length,
        total: allRecords.length
      };
    } catch (error) {
      console.error(`Error saving directory records to ${tableName}:`, error);
      throw error;
    }
  }

  async getDirectoryRecords(tableName, params = {}) {
    try {
      await this.init();
      
      const storageKey = this.getStorageKeyForTable(tableName);
      if (!storageKey) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      let records = await this.getItem(storageKey) || [];
      
      // Apply search filter
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        records = records.filter(record => 
          (record.company_name && record.company_name.toLowerCase().includes(searchLower)) ||
          (record.permit_number && record.permit_number.toLowerCase().includes(searchLower)) ||
          (record.location && record.location.toLowerCase().includes(searchLower)) ||
          (record.commodity && record.commodity.toLowerCase().includes(searchLower))
        );
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const offset = (page - 1) * limit;
      
      const total = records.length;
      const paginatedRecords = records.slice(offset, offset + limit);
      
      return {
        records: paginatedRecords,
        total,
        page,
        limit,
        hasMore: offset + limit < total
      };
    } catch (error) {
      console.error(`Error getting directory records from ${tableName}:`, error);
      throw error;
    }
  }

  async clearDirectoryData(tableName = null) {
    try {
      await this.init();
      
      if (tableName) {
        // Clear specific table
        const storageKey = this.getStorageKeyForTable(tableName);
        if (storageKey) {
          await this.removeItem(storageKey);
          await this.updateStorageInfo(tableName, 0);
        }
      } else {
        // Clear all directory data
        await this.removeItem(this.storageKeys.DIRECTORY_NATIONAL);
        await this.removeItem(this.storageKeys.DIRECTORY_LOCAL);
        await this.removeItem(this.storageKeys.DIRECTORY_HOTSPOTS);
        
        // Reset storage info
        await this.setStorageInfo({
          national: { count: 0, lastSync: null },
          local: { count: 0, lastSync: null },
          hotspots: { count: 0, lastSync: null },
          drafts: { count: 0, lastSync: null }
        });
      }
      
      console.log(`Directory data cleared: ${tableName || 'all'}`);
    } catch (error) {
      console.error('Error clearing directory data:', error);
      throw error;
    }
  }

  // Draft Methods
  async saveDraft(draftData) {
    try {
      await this.init();
      
      const drafts = await this.getItem(this.storageKeys.REPORT_DRAFTS) || [];
      const draftId = draftData.id || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const draft = {
        ...draftData,
        id: draftId,
        createdAt: draftData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        needsSync: true,
        isSynced: false
      };

      // Check if draft exists
      const existingIndex = drafts.findIndex(d => d.id === draftId);
      
      if (existingIndex >= 0) {
        // Update existing draft
        drafts[existingIndex] = draft;
      } else {
        // Add new draft
        drafts.push(draft);
      }
      
      await this.setItem(this.storageKeys.REPORT_DRAFTS, drafts);
      await this.updateStorageInfo('drafts', drafts.length);
      
      console.log(`Draft saved: ${draftId}`);
      return draft;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  async getDrafts(reporterId) {
    try {
      await this.init();
      
      const drafts = await this.getItem(this.storageKeys.REPORT_DRAFTS) || [];
      const userDrafts = drafts.filter(draft => draft.reporterId === reporterId);
      
      // Sort by updatedAt descending
      userDrafts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      return userDrafts;
    } catch (error) {
      console.error('Error getting drafts:', error);
      return [];
    }
  }

  async deleteDraft(draftId) {
    try {
      await this.init();
      
      const drafts = await this.getItem(this.storageKeys.REPORT_DRAFTS) || [];
      const filteredDrafts = drafts.filter(draft => draft.id !== draftId);
      
      await this.setItem(this.storageKeys.REPORT_DRAFTS, filteredDrafts);
      await this.updateStorageInfo('drafts', filteredDrafts.length);
      
      console.log(`Draft deleted: ${draftId}`);
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  }

  async getUnsyncedDrafts() {
    try {
      await this.init();
      
      const drafts = await this.getItem(this.storageKeys.REPORT_DRAFTS) || [];
      return drafts.filter(draft => draft.needsSync && !draft.isSynced);
    } catch (error) {
      console.error('Error getting unsynced drafts:', error);
      return [];
    }
  }

  async markDraftAsSynced(draftId) {
    try {
      await this.init();
      
      const drafts = await this.getItem(this.storageKeys.REPORT_DRAFTS) || [];
      const draftIndex = drafts.findIndex(draft => draft.id === draftId);
      
      if (draftIndex >= 0) {
        drafts[draftIndex].isSynced = true;
        drafts[draftIndex].needsSync = false;
        drafts[draftIndex].syncedAt = new Date().toISOString();
        
        await this.setItem(this.storageKeys.REPORT_DRAFTS, drafts);
        console.log(`Draft marked as synced: ${draftId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking draft as synced:', error);
      return false;
    }
  }

  // Storage Info Methods
  async getStorageInfo() {
    return await this.getItem(this.storageKeys.OFFLINE_STORAGE_INFO);
  }

  async setStorageInfo(info) {
    await this.setItem(this.storageKeys.OFFLINE_STORAGE_INFO, info);
  }

  async updateStorageInfo(category, count) {
    try {
      const info = await this.getStorageInfo() || {};
      info[category] = {
        count,
        lastSync: new Date().toISOString()
      };
      await this.setStorageInfo(info);
    } catch (error) {
      console.error('Error updating storage info:', error);
    }
  }

  // Sync Status Methods
  async getSyncStatus(tableName) {
    try {
      await this.init();
      
      const syncStatus = await this.getItem(this.storageKeys.SYNC_STATUS) || {};
      return syncStatus[tableName] || {
        lastSync: null,
        totalRecords: 0,
        downloadedRecords: 0,
        isComplete: false
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  }

  async updateSyncStatus(tableName, totalRecords, downloadedRecords) {
    try {
      await this.init();
      
      const syncStatus = await this.getItem(this.storageKeys.SYNC_STATUS) || {};
      syncStatus[tableName] = {
        lastSync: new Date().toISOString(),
        totalRecords,
        downloadedRecords,
        isComplete: downloadedRecords >= totalRecords
      };
      
      await this.setItem(this.storageKeys.SYNC_STATUS, syncStatus);
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }

  // Helper Methods
  getStorageKeyForTable(tableName) {
    const keyMap = {
      'directory_national': this.storageKeys.DIRECTORY_NATIONAL,
      'directory_local': this.storageKeys.DIRECTORY_LOCAL,
      'directory_hotspots': this.storageKeys.DIRECTORY_HOTSPOTS
    };
    return keyMap[tableName];
  }

  // Clear all data (for logout)
  async clearAllData() {
    try {
      await this.clearUserAuth();
      await this.clearDirectoryData();
      await this.removeItem(this.storageKeys.REPORT_DRAFTS);
      await this.removeItem(this.storageKeys.SYNC_STATUS);
      await this.removeItem(this.storageKeys.OFFLINE_STORAGE_INFO);
      
      console.log('All AsyncStorage data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Get storage size info
  async getStorageSize() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => 
        Object.values(this.storageKeys).includes(key)
      );
      
      let totalSize = 0;
      const details = {};
      
      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        const size = value ? new Blob([value]).size : 0;
        totalSize += size;
        details[key] = {
          size,
          sizeFormatted: this.formatBytes(size)
        };
      }
      
      return {
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        details
      };
    } catch (error) {
      console.error('Error getting storage size:', error);
      return null;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new AsyncStorageService();
