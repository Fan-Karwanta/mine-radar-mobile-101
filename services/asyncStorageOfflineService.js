import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import directoryService from './directoryService';

class AsyncStorageOfflineService {
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
      DIRECTORY_NATIONAL: '@directory_national',
      DIRECTORY_LOCAL: '@directory_local', 
      DIRECTORY_HOTSPOTS: '@directory_hotspots',
      DIRECTORY_STATS: '@directory_stats',
      DOWNLOAD_STATUS: '@download_status',
      DRAFTS: '@report_drafts',
      AUTH_DATA: '@auth_data'
    };
  }

  // Download all directory data for offline use
  async downloadAllDirectoryData(progressCallback) {
    try {
      console.log('🚀 Starting AsyncStorage-based directory download...');
      
      const downloadDetails = {};
      const duplicateDetails = { total: 0, national: 0, local: 0, hotspots: 0 };
      let overallProgress = 0;

      // Download each category
      const categories = ['national', 'local', 'hotspots'];
      
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        console.log(`📥 Downloading ${category} data...`);
        
        const result = await this.downloadCategoryData(category, (progress) => {
          const categoryProgress = {
            national: category === 'national' ? progress : (i > 0 ? 100 : 0),
            local: category === 'local' ? progress : (i > 1 ? 100 : 0),
            hotspots: category === 'hotspots' ? progress : (i > 2 ? 100 : 0),
            overall: ((i * 100) + progress) / 3
          };
          
          if (progressCallback) {
            progressCallback(categoryProgress);
          }
        });

        if (result.success) {
          downloadDetails[category] = result.totalRecords;
          duplicateDetails[category] = result.duplicates || 0;
          duplicateDetails.total += result.duplicates || 0;
        }
      }

      // Update download status
      const downloadStatus = {
        isDownloaded: true,
        lastUpdate: new Date().toISOString(),
        storageInfo: {
          total: (downloadDetails.national || 0) + (downloadDetails.local || 0) + (downloadDetails.hotspots || 0)
        }
      };

      await AsyncStorage.setItem(this.getStorageKeys().DOWNLOAD_STATUS, JSON.stringify(downloadStatus));

      // Final progress update
      if (progressCallback) {
        progressCallback({
          national: 100,
          local: 100,
          hotspots: 100,
          overall: 100
        });
      }

      console.log('✅ AsyncStorage download complete!', downloadDetails);

      return {
        success: true,
        downloadDetails,
        duplicateDetails,
        stats: downloadStatus.storageInfo
      };

    } catch (error) {
      console.error('❌ AsyncStorage download failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Download data for a specific category
  async downloadCategoryData(category, progressCallback) {
    try {
      const storageKey = this.getStorageKeys()[`DIRECTORY_${category.toUpperCase()}`];
      let allRecords = [];
      let page = 1;
      let hasMore = true;
      let totalRecords = 0;
      let duplicates = 0;
      const seenIds = new Set();

      while (hasMore) {
        let response;
        
        // Fetch data from API
        switch (category) {
          case 'national':
            response = await directoryService.getDirectoryNational({ page, limit: 100 });
            break;
          case 'local':
            response = await directoryService.getDirectoryLocal({ page, limit: 100 });
            break;
          case 'hotspots':
            response = await directoryService.getDirectoryHotspots({ page, limit: 100 });
            break;
          default:
            throw new Error(`Unknown category: ${category}`);
        }

        if (response.success && response.data && response.data.length > 0) {
          // Check for duplicates and add unique records
          for (const record of response.data) {
            if (seenIds.has(record._id)) {
              duplicates++;
              console.log(`🔄 Duplicate ${category} ID found: ${record._id}`);
            } else {
              seenIds.add(record._id);
              allRecords.push(record);
            }
          }

          totalRecords += response.data.length;
          hasMore = response.pagination?.hasNext || false;
          page++;

          // Update progress
          const progress = hasMore ? Math.min((page - 1) * 10, 90) : 100;
          if (progressCallback) {
            progressCallback(progress);
          }

        } else {
          hasMore = false;
        }
      }

      // Save all records to AsyncStorage
      await AsyncStorage.setItem(storageKey, JSON.stringify(allRecords));
      
      console.log(`✅ ${category}: ${allRecords.length} unique records saved (${duplicates} duplicates ignored)`);

      return {
        success: true,
        totalRecords,
        uniqueRecords: allRecords.length,
        duplicates
      };

    } catch (error) {
      console.error(`❌ Error downloading ${category} data:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get directory data (online or offline)
  async getDirectoryData(category, params = {}) {
    try {
      // Try online first if available
      if (this.isOnline) {
        try {
          let response;
          switch (category) {
            case 'national':
              response = await directoryService.getDirectoryNational(params);
              break;
            case 'local':
              response = await directoryService.getDirectoryLocal(params);
              break;
            case 'hotspots':
              response = await directoryService.getDirectoryHotspots(params);
              break;
            default:
              throw new Error(`Unknown category: ${category}`);
          }
          
          if (response.success) {
            return response;
          }
        } catch (error) {
          console.log('Online request failed, falling back to offline data:', error.message);
        }
      }

      // Fallback to offline data
      return await this.getOfflineDirectoryData(category, params);

    } catch (error) {
      console.error('Error getting directory data:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false }
      };
    }
  }

  // Get offline directory data with pagination
  async getOfflineDirectoryData(category, params = {}) {
    try {
      const storageKey = this.getStorageKeys()[`DIRECTORY_${category.toUpperCase()}`];
      const storedData = await AsyncStorage.getItem(storageKey);
      
      if (!storedData) {
        return {
          success: false,
          error: 'No offline data available. Please download data first.',
          data: [],
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false }
        };
      }

      let allRecords = JSON.parse(storedData);
      
      // Apply search filter
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        allRecords = allRecords.filter(record => {
          const searchableFields = [
            record.contractNumber, record.permitNumber, record.complaintNumber,
            record.contractor, record.permitHolder, record.subject,
            record.commodity, record.commodities, record.typeOfCommodity,
            record.municipality, record.province, record.barangay
          ];
          
          return searchableFields.some(field => 
            field && field.toString().toLowerCase().includes(searchTerm)
          );
        });
      }

      // Apply other filters
      if (params.province && params.province !== 'all') {
        allRecords = allRecords.filter(record => record.province === params.province);
      }

      if (params.status && params.status !== 'all') {
        allRecords = allRecords.filter(record => {
          if (category === 'hotspots') {
            return record.actionsTaken === params.status;
          }
          return record.status === params.status;
        });
      }

      if (params.classification && params.classification !== 'all') {
        allRecords = allRecords.filter(record => {
          if (category === 'hotspots') {
            return record.natureOfReportedIllegalAct === params.classification;
          }
          return record.classification === params.classification;
        });
      }

      if (params.type && params.type !== 'all') {
        allRecords = allRecords.filter(record => {
          if (category === 'hotspots') {
            return record.typeOfCommodity === params.type;
          }
          return record.type === params.type;
        });
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = allRecords.slice(startIndex, endIndex);

      const totalRecords = allRecords.length;
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        success: true,
        data: paginatedData,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('Error getting offline directory data:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false }
      };
    }
  }

  // Get directory statistics
  async getDirectoryStats() {
    try {
      // Try online first
      if (this.isOnline) {
        try {
          const response = await directoryService.getDirectoryStats();
          if (response.success) {
            // Cache the stats
            await AsyncStorage.setItem(this.getStorageKeys().DIRECTORY_STATS, JSON.stringify(response.data));
            return response;
          }
        } catch (error) {
          console.log('Online stats request failed, using cached data');
        }
      }

      // Fallback to cached stats or calculate from offline data
      const cachedStats = await AsyncStorage.getItem(this.getStorageKeys().DIRECTORY_STATS);
      if (cachedStats) {
        return {
          success: true,
          data: JSON.parse(cachedStats)
        };
      }

      // Calculate stats from offline data
      const keys = this.getStorageKeys();
      const nationalData = await AsyncStorage.getItem(keys.DIRECTORY_NATIONAL);
      const localData = await AsyncStorage.getItem(keys.DIRECTORY_LOCAL);
      const hotspotsData = await AsyncStorage.getItem(keys.DIRECTORY_HOTSPOTS);

      const stats = {
        totals: {
          national: nationalData ? JSON.parse(nationalData).length : 0,
          local: localData ? JSON.parse(localData).length : 0,
          hotspots: hotspotsData ? JSON.parse(hotspotsData).length : 0
        }
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Error getting directory stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get download status
  async getDownloadStatus() {
    try {
      const statusData = await AsyncStorage.getItem(this.getStorageKeys().DOWNLOAD_STATUS);
      
      if (statusData) {
        return {
          success: true,
          data: JSON.parse(statusData)
        };
      }

      return {
        success: true,
        data: {
          isDownloaded: false,
          storageInfo: { total: 0 },
          lastUpdate: null
        }
      };

    } catch (error) {
      console.error('Error getting download status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clear offline data
  async clearOfflineData() {
    try {
      const keys = this.getStorageKeys();
      await AsyncStorage.multiRemove([
        keys.DIRECTORY_NATIONAL,
        keys.DIRECTORY_LOCAL,
        keys.DIRECTORY_HOTSPOTS,
        keys.DIRECTORY_STATS,
        keys.DOWNLOAD_STATUS
      ]);

      console.log('✅ Offline directory data cleared');
      return { success: true };

    } catch (error) {
      console.error('Error clearing offline data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Draft management methods
  async saveDraft(draftData) {
    try {
      const draftsKey = this.getStorageKeys().DRAFTS;
      const existingDrafts = await this.getDrafts();
      
      const newDraft = {
        ...draftData,
        id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOffline: !this.isOnline
      };

      const updatedDrafts = [...existingDrafts, newDraft];
      await AsyncStorage.setItem(draftsKey, JSON.stringify(updatedDrafts));

      console.log('✅ Draft saved to AsyncStorage:', newDraft.id);
      return {
        success: true,
        data: newDraft
      };

    } catch (error) {
      console.error('Error saving draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getDrafts(userId = null) {
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
      console.error('Error getting drafts:', error);
      return [];
    }
  }

  async updateDraft(draftId, updatedData) {
    try {
      const draftsKey = this.getStorageKeys().DRAFTS;
      const existingDrafts = await this.getDrafts();
      
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
        updatedAt: new Date().toISOString()
      };

      await AsyncStorage.setItem(draftsKey, JSON.stringify(existingDrafts));

      console.log('✅ Draft updated in AsyncStorage:', draftId);
      return {
        success: true,
        data: existingDrafts[draftIndex]
      };

    } catch (error) {
      console.error('Error updating draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteDraft(draftId) {
    try {
      const draftsKey = this.getStorageKeys().DRAFTS;
      const existingDrafts = await this.getDrafts();
      
      const filteredDrafts = existingDrafts.filter(draft => draft.id !== draftId);
      await AsyncStorage.setItem(draftsKey, JSON.stringify(filteredDrafts));

      console.log('✅ Draft deleted from AsyncStorage:', draftId);
      return { success: true };

    } catch (error) {
      console.error('Error deleting draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Authentication persistence
  async saveAuthData(authData) {
    try {
      await AsyncStorage.setItem(this.getStorageKeys().AUTH_DATA, JSON.stringify(authData));
      return { success: true };
    } catch (error) {
      console.error('Error saving auth data:', error);
      return { success: false, error: error.message };
    }
  }

  async getAuthData() {
    try {
      const authData = await AsyncStorage.getItem(this.getStorageKeys().AUTH_DATA);
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.error('Error getting auth data:', error);
      return null;
    }
  }

  async clearAuthData() {
    try {
      await AsyncStorage.removeItem(this.getStorageKeys().AUTH_DATA);
      return { success: true };
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new AsyncStorageOfflineService();
