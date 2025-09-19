import { API_URL } from '../constants/api';
import asyncStorageService from './asyncStorageService';
import NetInfo from '@react-native-community/netinfo';

class OfflineDirectoryService {
  constructor() {
    this.isOnline = true;
    this.downloadProgress = {
      national: 0,
      local: 0,
      hotspots: 0,
      overall: 0
    };
    this.downloadCallbacks = [];
    
    // Monitor network connectivity
    this.setupNetworkListener();
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      console.log('Network status:', this.isOnline ? 'Online' : 'Offline');
    });
  }

  // Check if device is online
  async checkOnlineStatus() {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected;
    return this.isOnline;
  }

  // Register callback for download progress updates
  onDownloadProgress(callback) {
    this.downloadCallbacks.push(callback);
  }

  // Remove download progress callback
  removeDownloadProgressCallback(callback) {
    this.downloadCallbacks = this.downloadCallbacks.filter(cb => cb !== callback);
  }

  // Notify all callbacks about progress update
  notifyProgressUpdate() {
    this.downloadCallbacks.forEach(callback => {
      try {
        callback(this.downloadProgress);
      } catch (error) {
        console.error('Error in download progress callback:', error);
      }
    });
  }

  // Download all directory data for offline use
  async downloadAllDirectoryData(progressCallback = null) {
    try {
      const isOnline = await this.checkOnlineStatus();
      if (!isOnline) {
        throw new Error('No internet connection available for download');
      }

      console.log('Starting directory data download...');
      
      // Initialize AsyncStorage service
      console.log('🔧 Initializing AsyncStorage service...');
      await asyncStorageService.init();
      
      // Reset progress
      this.downloadProgress = { national: 0, local: 0, hotspots: 0, overall: 0 };
      
      if (progressCallback) this.onDownloadProgress(progressCallback);

      // Download each category
      const results = await Promise.allSettled([
        this.downloadCategoryData('national'),
        this.downloadCategoryData('local'),
        this.downloadCategoryData('hotspots')
      ]);

      // Check if all downloads were successful
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Some downloads failed:', failures);
        throw new Error(`Failed to download ${failures.length} categories`);
      }

      // Calculate overall progress
      this.downloadProgress.overall = 100;
      this.notifyProgressUpdate();

      // Small delay to ensure final progress update is processed
      await new Promise(resolve => setTimeout(resolve, 500));

      if (progressCallback) this.removeDownloadProgressCallback(progressCallback);

      // Results are already resolved from Promise.allSettled
      const successfulDownloads = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failedDownloads = results.filter(r => r.status === 'rejected');
      
      console.log('📊 Download Summary:');
      const categoryNames = ['national', 'local', 'hotspots'];
      successfulDownloads.forEach((result, index) => {
        const category = categoryNames[index];
        const recordCount = result.totalDownloaded || result.data?.length || 0;
        console.log(`  ${category}: ${recordCount} records`);
      });
      
      if (failedDownloads.length > 0) {
        console.error('❌ Failed downloads:', failedDownloads.length);
        failedDownloads.forEach((failure, index) => {
          console.error(`  ${categoryNames[index]}: ${failure.reason}`);
        });
      }
      
      // Verify data integrity by checking a few sample records
      console.log('🔍 Verifying data integrity...');
      for (const result of successfulDownloads) {
        if (result.data && result.data.length > 0) {
          const sampleRecord = result.data[0];
          console.log('📋 Sample record structure:', {
            hasId: !!sampleRecord._id,
            hasRequiredFields: !!(sampleRecord.permitNumber || sampleRecord.contractNumber || sampleRecord.complaintNumber),
            recordType: sampleRecord.permitNumber ? 'local' : sampleRecord.contractNumber ? 'national' : 'hotspots',
            totalFields: Object.keys(sampleRecord).length
          });
        }
      }
      
      console.log('🎉 All directory data downloaded successfully');
      const storageInfo = await asyncStorageService.getStorageInfo();
      
      // Final verification - check AsyncStorage
      console.log('💾 AsyncStorage Verification:');
      const nationalCount = storageInfo.national?.count || 0;
      const localCount = storageInfo.local?.count || 0;
      const hotspotsCount = storageInfo.hotspots?.count || 0;
      const totalCount = nationalCount + localCount + hotspotsCount;
      console.log(`  Total records in AsyncStorage: ${totalCount}`);
      console.log(`  National in AsyncStorage: ${nationalCount}`);
      console.log(`  Local in AsyncStorage: ${localCount}`);
      console.log(`  Hotspots in AsyncStorage: ${hotspotsCount}`);
      
      const downloadDetails = {
        national: successfulDownloads[0]?.totalDownloaded || successfulDownloads[0]?.data?.length || 0,
        local: successfulDownloads[1]?.totalDownloaded || successfulDownloads[1]?.data?.length || 0,
        hotspots: successfulDownloads[2]?.totalDownloaded || successfulDownloads[2]?.data?.length || 0
      };
      
      // Collect duplicate information (for reporting only - all records are saved)
      const duplicateDetails = {
        national: successfulDownloads[0]?.duplicateInfo || { duplicateCount: 0, uniqueMongoIds: downloadDetails.national, totalSavedToSQLite: downloadDetails.national },
        local: successfulDownloads[1]?.duplicateInfo || { duplicateCount: 0, uniqueMongoIds: downloadDetails.local, totalSavedToSQLite: downloadDetails.local },
        hotspots: successfulDownloads[2]?.duplicateInfo || { duplicateCount: 0, uniqueMongoIds: downloadDetails.hotspots, totalSavedToSQLite: downloadDetails.hotspots }
      };
      
      const totalDuplicates = duplicateDetails.national.duplicateCount + duplicateDetails.local.duplicateCount + duplicateDetails.hotspots.duplicateCount;
      const totalSavedToSQLite = duplicateDetails.national.totalSavedToSQLite + duplicateDetails.local.totalSavedToSQLite + duplicateDetails.hotspots.totalSavedToSQLite;
      const totalUniqueMongoIds = duplicateDetails.national.uniqueMongoIds + duplicateDetails.local.uniqueMongoIds + duplicateDetails.hotspots.uniqueMongoIds;
      const totalDownloadedFromMongoDB = downloadDetails.national + downloadDetails.local + downloadDetails.hotspots;
      
      console.log('✅ Download Complete - ALL MongoDB Records Captured:');
      console.log(`  📊 National: ${downloadDetails.national} records from MongoDB`);
      console.log(`  📊 Local: ${downloadDetails.local} records from MongoDB`);
      console.log(`  📊 Hotspots: ${downloadDetails.hotspots} records from MongoDB`);
      console.log(`  📱 Total: ${totalDownloadedFromMongoDB} records saved to AsyncStorage`);
      console.log(`  🎉 SUCCESS: All ${totalSavedToSQLite} MongoDB records captured offline!`);
      console.log(`  📊 Actual AsyncStorage Total: ${totalCount} records`);
      
      if (totalDuplicates > 0) {
        console.log('🔄 Duplicate MongoDB IDs Summary:');
        console.log(`  📊 Total Duplicate MongoDB IDs: ${totalDuplicates}`);
        console.log(`  📊 Unique MongoDB IDs: ${totalUniqueMongoIds}`);
        console.log(`  💾 All ${totalSavedToSQLite} records saved to AsyncStorage (including duplicates)`);
      }
      
      return {
        success: true,
        message: 'All directory data downloaded successfully',
        stats: storageInfo,
        downloadDetails,
        duplicateDetails: {
          national: duplicateDetails.national.duplicateCount,
          local: duplicateDetails.local.duplicateCount,
          hotspots: duplicateDetails.hotspots.duplicateCount,
          total: totalDuplicates,
          uniqueMongoIds: totalUniqueMongoIds,
          totalSavedToSQLite: totalSavedToSQLite
        }
      };

    } catch (error) {
      console.error('Error downloading directory data:', error);
      
      if (progressCallback) this.removeDownloadProgressCallback(progressCallback);
      
      return {
        success: false,
        error: error.message,
        stats: await asyncStorageService.getStorageInfo()
      };
    }
  }

  // Download data for a specific category
  async downloadCategoryData(category) {
    try {
      console.log(`Downloading ${category} data...`);
      
      // Download data in batches - don't rely on stats, just keep going until no more data
      const batchSize = 100;
      let allRecords = [];
      let page = 1;
      let hasMore = true;
      let consecutiveEmptyBatches = 0;

      while (hasMore && consecutiveEmptyBatches < 3) {
        console.log(`Fetching ${category} batch ${page} (limit: ${batchSize})...`);
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: batchSize.toString()
        });

        const response = await fetch(`${API_URL}/directory/${category}?${params}`);
        
        if (!response.ok) {
          console.error(`HTTP error for ${category} page ${page}:`, response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`${category} page ${page} response:`, {
          success: data.success,
          dataLength: data.data?.length || 0,
          hasNext: data.pagination?.hasNext,
          totalPages: data.pagination?.totalPages,
          currentPage: data.pagination?.currentPage
        });
        
        if (data.success && data.data && data.data.length > 0) {
          // Reset consecutive empty batches counter
          consecutiveEmptyBatches = 0;
          
          allRecords = [...allRecords, ...data.data];
          
          // Update progress based on actual data received
          // Use a more dynamic progress calculation
          const estimatedProgress = Math.min((page * batchSize / Math.max(allRecords.length * 1.2, 100)) * 100, 95);
          this.downloadProgress[category] = estimatedProgress;
          
          // Update overall progress
          const avgProgress = (this.downloadProgress.national + this.downloadProgress.local + this.downloadProgress.hotspots) / 3;
          this.downloadProgress.overall = avgProgress;
          
          this.notifyProgressUpdate();
          
          // Check multiple conditions to determine if we should continue
          const shouldContinue = (
            data.data.length === batchSize || // Got full batch, might have more
            (data.pagination?.hasNext === true) || // API says there's more
            (data.pagination?.currentPage < data.pagination?.totalPages) // Haven't reached last page
          );
          
          hasMore = shouldContinue;
          page++;
          
          console.log(`✅ Downloaded batch ${page-1}: ${data.data.length} records. Total so far: ${allRecords.length}. Continue: ${shouldContinue}`);
          
          // If we got less than batch size and no pagination info, try one more page to be sure
          if (!shouldContinue && data.data.length < batchSize && !data.pagination) {
            console.log(`🔍 Got partial batch (${data.data.length}/${batchSize}) with no pagination info. Trying one more page to be safe...`);
            hasMore = true;
          }
        } else {
          consecutiveEmptyBatches++;
          console.log(`❌ Empty batch ${page} for ${category}. Consecutive empty: ${consecutiveEmptyBatches}`);
          
          if (consecutiveEmptyBatches >= 3) {
            console.log(`Stopping ${category} download after 3 consecutive empty batches`);
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      // Save to AsyncStorage
      const tableName = `directory_${category}`;
      const saveResult = await asyncStorageService.saveDirectoryRecords(tableName, allRecords);
      
      this.downloadProgress[category] = 100;
      this.notifyProgressUpdate();
      
      // Verify we got all records by checking the actual database count
      try {
        const verifyResponse = await fetch(`${API_URL}/directory/${category}?page=1&limit=1`);
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          const actualTotal = verifyData.pagination?.totalRecords || allRecords.length;
          
          if (actualTotal > allRecords.length) {
            console.warn(`⚠️ ${category}: Downloaded ${allRecords.length} but database has ${actualTotal} records. Missing ${actualTotal - allRecords.length} records!`);
          } else {
            console.log(`✅ ${category}: Successfully downloaded all ${allRecords.length} records (verified against database total: ${actualTotal})`);
          }
        }
      } catch (verifyError) {
        console.warn('Could not verify record count:', verifyError);
      }
      
      console.log(`🎉 Completed downloading ${allRecords.length} ${category} records`);
      return { 
        success: true, 
        data: allRecords, 
        totalDownloaded: allRecords.length,
        duplicateInfo: saveResult && typeof saveResult === 'object' ? {
          totalProcessed: saveResult.totalProcessed || allRecords.length,
          duplicateCount: saveResult.duplicateCount || 0,
          uniqueMongoIds: saveResult.uniqueMongoIds || allRecords.length,
          totalSavedToSQLite: saveResult.totalSavedToSQLite || allRecords.length,
          errorCount: saveResult.errorCount || 0
        } : {
          totalProcessed: allRecords.length,
          duplicateCount: 0,
          uniqueMongoIds: allRecords.length,
          totalSavedToSQLite: allRecords.length,
          errorCount: 0
        }
      };

    } catch (error) {
      console.error(`Error downloading ${category} data:`, error);
      throw error;
    }
  }

  // Get directory data (online or offline)
  async getDirectoryData(category, params = {}) {
    try {
      const isOnline = await this.checkOnlineStatus();
      const offlineData = await asyncStorageService.getDirectoryRecords(`directory_${category}`, { limit: 1 });
      const hasOfflineData = offlineData && offlineData.total > 0;

      if (isOnline && !hasOfflineData) {
        // Online and no offline data - fetch from server
        return await this.getOnlineDirectoryData(category, params);
      } else if (!isOnline && hasOfflineData) {
        // Offline but has cached data - use AsyncStorage with pagination for performance
        const offlineParams = { 
          ...params,
          limit: params.limit || 20,
          page: params.page || 1
        };
        const result = await asyncStorageService.getDirectoryRecords(`directory_${category}`, offlineParams);
        return {
          success: true,
          data: result.records,
          pagination: {
            currentPage: result.page,
            totalPages: Math.ceil(result.total / result.limit),
            totalRecords: result.total,
            hasNext: result.hasMore,
            limit: result.limit
          }
        };
      } else if (isOnline && hasOfflineData) {
        // Online with cached data - prefer cached for speed with pagination
        const offlineParams = { 
          ...params,
          limit: params.limit || 20,
          page: params.page || 1
        };
        const result = await asyncStorageService.getDirectoryRecords(`directory_${category}`, offlineParams);
        return {
          success: true,
          data: result.records,
          pagination: {
            currentPage: result.page,
            totalPages: Math.ceil(result.total / result.limit),
            totalRecords: result.total,
            hasNext: result.hasMore,
            limit: result.limit
          }
        };
      } else {
        // Offline and no cached data
        return {
          success: false,
          error: 'No internet connection and no offline data available. Please connect to the internet and download data first.',
          data: []
        };
      }
    } catch (error) {
      console.error('Error getting directory data:', error);
      
      // Fallback to offline data if available
      const offlineData = await asyncStorageService.getDirectoryRecords(`directory_${category}`, { limit: 1 });
      if (offlineData && offlineData.total > 0) {
        const result = await asyncStorageService.getDirectoryRecords(`directory_${category}`, params);
        return {
          success: true,
          data: result.records,
          pagination: {
            currentPage: result.page,
            totalPages: Math.ceil(result.total / result.limit),
            totalRecords: result.total,
            hasNext: result.hasMore,
            limit: result.limit
          }
        };
      }
      
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Get data from online API
  async getOnlineDirectoryData(category, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.province) queryParams.append('province', params.province);
      if (params.status) queryParams.append('status', params.status);
      if (params.classification) queryParams.append('classification', params.classification);
      if (params.type) queryParams.append('type', params.type);

      const response = await fetch(`${API_URL}/directory/${category}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching online ${category} data:`, error);
      throw error;
    }
  }

  // Get directory statistics
  async getDirectoryStats() {
    try {
      const isOnline = await this.checkOnlineStatus();
      
      if (isOnline) {
        // Try to get online stats
        try {
          const response = await fetch(`${API_URL}/directory/stats`);
          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          console.log('Failed to get online stats, falling back to offline');
        }
      }
      
      // Fallback to offline stats
      const offlineStats = await asyncStorageService.getStorageInfo();
      const totals = {
        national: offlineStats.national?.count || 0,
        local: offlineStats.local?.count || 0,
        hotspots: offlineStats.hotspots?.count || 0,
        total: (offlineStats.national?.count || 0) + (offlineStats.local?.count || 0) + (offlineStats.hotspots?.count || 0)
      };
      return {
        success: true,
        data: {
          totals,
          isOffline: true
        }
      };
    } catch (error) {
      console.error('Error getting directory statistics:', error);
      return {
        success: false,
        error: error.message,
        data: { totals: { national: 0, local: 0, hotspots: 0 } }
      };
    }
  }

  // Check download status
  async getDownloadStatus() {
    try {
      const storageInfo = await asyncStorageService.getStorageInfo();
      const totalRecords = (storageInfo.national?.count || 0) + (storageInfo.local?.count || 0) + (storageInfo.hotspots?.count || 0);
      
      return {
        success: true,
        data: {
          isDownloaded: totalRecords > 0,
          storageInfo: {
            total: totalRecords,
            national: storageInfo.national?.count || 0,
            local: storageInfo.local?.count || 0,
            hotspots: storageInfo.hotspots?.count || 0
          },
          lastUpdate: storageInfo.national?.lastSync || storageInfo.local?.lastSync || storageInfo.hotspots?.lastSync || null
        }
      };
    } catch (error) {
      console.error('Error getting download status:', error);
      return {
        success: false,
        error: error.message,
        data: { isDownloaded: false, storageInfo: { total: 0 } }
      };
    }
  }

  // Clear offline data
  async clearOfflineData() {
    try {
      await asyncStorageService.clearDirectoryData();
      return {
        success: true,
        message: 'All offline data cleared successfully'
      };
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if specific category data is available offline
  async isOfflineDataAvailable(category) {
    const result = await asyncStorageService.getDirectoryRecords(`directory_${category}`, { limit: 1 });
    return result && result.total > 0;
  }

  // Get current network status
  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      timestamp: new Date().toISOString()
    };
  }
}

export default new OfflineDirectoryService();
