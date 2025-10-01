import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import SearchFilter from '../../components/SearchFilter';
import DataTable from '../../components/DataTable';
import CategoryCard from '../../components/CategoryCard';
import directoryService from '../../services/directoryService';
import asyncStorageOfflineService from '../../services/asyncStorageOfflineService';

// Directory categories
const categories = [
  {
    id: 'national',
    label: 'National',
    description: 'National mining agreements and permits',
    icon: 'business-outline',
    color: COLORS.primary
  },
  {
    id: 'local',
    label: 'Local',
    description: 'Local quarry permits and applications',
    icon: 'location-outline',
    color: '#2196F3'
  },
  {
    id: 'hotspots',
    label: 'Hotspots',
    description: 'Illegal mining incident reports',
    icon: 'warning-outline',
    color: '#FF5722'
  }
];

export default function Directory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedClassification, setSelectedClassification] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]); // Default to national
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [directoryData, setDirectoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNext: false,
    hasPrev: false
  });
  // Simplified pagination state
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 20; // Show 20 items at a time
  const [stats, setStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    classifications: [],
    types: [],
    statuses: ['Operating', 'Non-operating', 'Suspended', 'Expired', 'Cancelled', 'Care and Maintenance', 'Unknown']
  });
  
  // Offline functionality state
  const [isOnline, setIsOnline] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    national: 0,
    local: 0,
    hotspots: 0,
    overall: 0
  });
  const [offlineDataStatus, setOfflineDataStatus] = useState({
    isDownloaded: false,
    storageInfo: { total: 0 },
    lastUpdate: null
  });
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    fetchDirectoryData(1, false);
  }, [selectedCategory, searchQuery, selectedProvince, selectedStatus, selectedClassification, selectedType]);
  
  // Ensure filter options are loaded when category changes
  useEffect(() => {
    if (selectedCategory) {
      console.log('Loading filter options for category:', selectedCategory.id);
      fetchFilterOptions();
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchStats();
    checkOfflineDataStatus();
    checkNetworkStatus();
  }, []);

  // Check network status and offline data availability
  const checkNetworkStatus = async () => {
    const networkStatus = asyncStorageOfflineService.getNetworkStatus();
    setIsOnline(networkStatus.isOnline);
  };

  const checkOfflineDataStatus = async () => {
    try {
      const status = await asyncStorageOfflineService.getDownloadStatus();
      if (status.success) {
        setOfflineDataStatus(status.data);
      }
    } catch (error) {
      console.error('Error checking offline data status:', error);
    }
  };

  // Load more data - works for both online and offline
  const loadMoreData = async () => {
    if (loadingMore || !pagination.hasNext) return;
    
    setLoadingMore(true);
    console.log('Loading more data - Current page:', pagination.currentPage, 'Total pages:', pagination.totalPages);
    
    try {
      const params = {
        page: pagination.currentPage + 1,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        province: selectedProvince !== 'all' ? selectedProvince : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        classification: selectedClassification !== 'all' ? selectedClassification : undefined,
        type: selectedType !== 'all' ? selectedType : undefined
      };

      const response = await asyncStorageOfflineService.getDirectoryData(selectedCategory.id, params);

      if (response.success) {
        // Append new data to existing data
        const newData = [...directoryData, ...response.data];
        setDirectoryData(newData);
        setPagination(response.pagination);
      } else {
        Alert.alert('Error', response.error || 'Failed to load more data');
      }
    } catch (error) {
      console.error('Error loading more data:', error);
      Alert.alert('Error', 'An error occurred while loading more data');
    } finally {
      setLoadingMore(false);
    }
  };

  // Fetch directory data with consistent pagination
  const fetchDirectoryData = async (resetData = false) => {
    if (resetData) {
      setDirectoryData([]);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }

    setLoading(true);

    try {
      const params = {
        page: resetData ? 1 : pagination.currentPage,
        limit: ITEMS_PER_PAGE, // Always use pagination for performance
        search: searchQuery,
        province: selectedProvince !== 'all' ? selectedProvince : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        classification: selectedClassification !== 'all' ? selectedClassification : undefined,
        type: selectedType !== 'all' ? selectedType : undefined
      };

      const response = await asyncStorageOfflineService.getDirectoryData(selectedCategory.id, params);

      if (response.success) {
        const newData = resetData ? response.data : directoryData;
        setDirectoryData(newData);
        setPagination(response.pagination);
      } else {
        Alert.alert('Error', response.error || 'Failed to fetch directory data');
      }
    } catch (error) {
      console.error('Error fetching directory data:', error);
      Alert.alert('Error', 'An error occurred while fetching data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await asyncStorageOfflineService.getDirectoryStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFilterOptions = async () => {
    if (!selectedCategory) return;
    
    try {
      let response;
      switch (selectedCategory.id) {
        case 'national':
          response = await directoryService.getDirectoryNational({ limit: 1000 });
          break;
        case 'local':
          response = await directoryService.getDirectoryLocal({ limit: 1000 });
          break;
        case 'hotspots':
          response = await directoryService.getDirectoryHotspots({ limit: 1000 });
          break;
        default:
          return;
      }

      if (response.success && response.data) {
        const data = response.data;
        let classifications = [];
        let types = [];
        let statuses = [];

        if (selectedCategory.id === 'hotspots') {
          // For hotspots, use natureOfReportedIllegalAct for classification and typeOfCommodity for type
          classifications = [...new Set(data.map(item => item.natureOfReportedIllegalAct).filter(Boolean))];
          types = [...new Set(data.map(item => item.typeOfCommodity).filter(Boolean))];
          statuses = [...new Set(data.map(item => item.actionsTaken).filter(Boolean))];
        } else {
          // For national and local, use classification and type fields directly
          classifications = [...new Set(data.map(item => item.classification).filter(Boolean))];
          types = [...new Set(data.map(item => item.type).filter(Boolean))];
          statuses = [...new Set(data.map(item => item.status).filter(Boolean))];
        }

        // Add common status values if they don't exist
        const commonStatuses = ['Operating', 'Non-operating', 'Suspended', 'Expired', 'Cancelled', 'Care and Maintenance', 'Unknown'];
        
        commonStatuses.forEach(status => {
          if (!statuses.includes(status)) {
            statuses.push(status);
          }
        });
        
        console.log('Filter options - statuses:', statuses);
        setFilterOptions({
          classifications: classifications.sort(),
          types: types.sort(),
          statuses: statuses.sort()
        });
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDirectoryData(true);
    await fetchStats();
    setRefreshing(false);
  };


  const handleRowPress = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleCategorySelect = (category) => {
    console.log('Changing category to:', category?.id);
    setSelectedCategory(category);
    setShowCategoryModal(false);
    setSearchQuery('');
    setSelectedProvince('all');
    setSelectedStatus('all');
    setSelectedClassification('all');
    setSelectedType('all');
    
    // Reset and initialize filter options when category changes
    setFilterOptions({
      classifications: [],
      types: [],
      statuses: ['Operating', 'Non-operating', 'Suspended', 'Expired', 'Cancelled', 'Care and Maintenance', 'Unknown']
    });
  };

  // Download all directory data for offline use
  const handleDownloadData = async () => {
    if (!isOnline) {
      Alert.alert('No Internet', 'Please connect to the internet to download data.');
      return;
    }

    // Reset progress before starting
    setDownloadProgress({
      national: 0,
      local: 0,
      hotspots: 0,
      overall: 0
    });

    setIsDownloading(true);
    setShowDownloadModal(true);

    try {
      const result = await asyncStorageOfflineService.downloadAllDirectoryData((progress) => {
        setDownloadProgress(progress);
      });

      setIsDownloading(false);
      setShowDownloadModal(false);

      if (result.success) {
        // Wait a bit for AsyncStorage operations to complete, then refresh status and data
        setTimeout(async () => {
          await checkOfflineDataStatus();
          await fetchDirectoryData(true); // Refresh the current view
        }, 500);
        
        const downloadDetails = result.downloadDetails || {};
        const duplicateDetails = result.duplicateDetails || {};
        const totalDownloaded = (downloadDetails.national || 0) + (downloadDetails.local || 0) + (downloadDetails.hotspots || 0);
        
        // Get actual AsyncStorage counts for verification
        const actualStats = result.stats || {};
        const actualTotal = actualStats.total || 0;
        
        // Build duplicate information message (for reporting only - all records are saved)
        let duplicateMessage = '';
        if (duplicateDetails.total > 0) {
          duplicateMessage = `\n\n🔄 Duplicate MongoDB IDs Found: ${duplicateDetails.total} records\n• National: ${duplicateDetails.national || 0} duplicate IDs\n• Local: ${duplicateDetails.local || 0} duplicate IDs\n• Hotspots: ${duplicateDetails.hotspots || 0} duplicate IDs\n\n💾 ALL ${totalDownloaded} records saved to AsyncStorage\n(including ${duplicateDetails.total} with duplicate MongoDB IDs)`;
        }
        
        Alert.alert(
          'Download Complete!',
          `National: ${downloadDetails.national || 0}\nLocal: ${downloadDetails.local || 0}\nHotspots: ${downloadDetails.hotspots || 0}\n\nAll ${totalDownloaded} records were saved offline!`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert('Download Failed', result.error || 'Failed to download data');
      }
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      setShowDownloadModal(false);
      Alert.alert('Download Error', 'An error occurred while downloading data');
    }
  };

  // Clear offline data
  const handleClearOfflineData = async () => {
    Alert.alert(
      'Clear Offline Data',
      'Are you sure you want to clear all offline data? This will free up storage space but you will need internet to view directory data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await asyncStorageOfflineService.clearOfflineData();
              if (result.success) {
                Alert.alert('Success', 'Offline data cleared successfully');
                await checkOfflineDataStatus();
              } else {
                Alert.alert('Error', result.error || 'Failed to clear offline data');
              }
            } catch (error) {
              console.error('Error clearing offline data:', error);
              Alert.alert('Error', 'An error occurred while clearing offline data');
            }
          }
        }
      ]
    );
  };

  // Hard refresh offline data
  const handleHardRefreshOfflineData = async () => {
    Alert.alert(
      'Refresh Offline Data',
      'This will clear current offline data and download fresh data from the server. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          onPress: async () => {
            try {
              setIsDownloading(true);
              setShowDownloadModal(true);
              const result = await asyncStorageOfflineService.hardRefreshOfflineData((progress) => {
                setDownloadProgress(progress);
              });
              
              if (result.success) {
                Alert.alert('Success', 'Offline data refreshed successfully! All data is now up to date.');
                await checkOfflineDataStatus();
                // Refresh current view
                await fetchDirectoryData(true);
                await fetchStats();
              } else {
                Alert.alert('Error', result.error || 'Failed to refresh offline data');
              }
            } catch (error) {
              console.error('Error refreshing offline data:', error);
              Alert.alert('Error', 'An error occurred while refreshing offline data');
            } finally {
              setIsDownloading(false);
              setShowDownloadModal(false);
              setDownloadProgress({ national: 0, local: 0, hotspots: 0, overall: 0 });
            }
          }
        }
      ]
    );
  };

  // Helper function to determine status color
  const getStatusColor = (status) => {
    if (!status) return '#999'; // Default gray for Unknown
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('operating') || statusLower.includes('approved')) {
      return '#4caf50'; // Green for active/operating
    } else if (statusLower.includes('expired') || statusLower.includes('denied')) {
      return '#f44336'; // Red for expired/denied
    } else if (statusLower.includes('pending') || statusLower.includes('evaluation')) {
      return '#ff9800'; // Orange for pending/under evaluation
    } else {
      return COLORS.primary; // Default to primary color
    }
  };
  
  const formatRecordForDisplay = (record) => {
    // Transform database record to display format based on category
    switch (selectedCategory?.id) {
      case 'national':
        return {
          id: record._id,
          permitNumber: record.contractNumber || 'N/A',
          permitHolder: record.contractor || 'N/A',
          commodity: record.commodity || 'N/A',
          area: record.area || 'N/A',
          barangay: record.barangay || 'N/A',
          municipality: record.municipality || 'N/A',
          province: record.province || 'N/A',
          status: record.status || 'Unknown',
          classification: record.classification || 'N/A',
          type: record.type || 'N/A',
          proponent: record.proponent || '',
          contactNumber: record.contactNumber || '',
          operator: record.operator || '',
          dateFiled: record.dateFiled || '',
          dateApproved: record.approvalDate || '',
          renewalDate: record.renewalDate || '',
          expirationDate: record.expirationDate || '',
          sourceOfRawMaterials: record.sourceOfRawMaterials || '',
          googleMapLink: record.googleMapLink || ''
        };
      case 'local':
        return {
          id: record._id,
          permitNumber: record.permitNumber || 'N/A',
          permitHolder: record.permitHolder || 'N/A',
          commodity: record.commodities || 'N/A',
          area: record.area || 'N/A',
          barangay: record.barangays || 'N/A',
          municipality: record.municipality || 'N/A',
          province: record.province || 'N/A',
          status: record.status || 'Unknown',
          classification: record.classification || 'N/A',
          type: record.type || 'N/A',
          // Ensure all date fields are properly mapped
          dateOfFirstIssuance: record.dateOfFirstIssuance || '',
          dateFiled: record.dateFiled || '',
          dateApproved: record.dateApproved || '',
          dateExpiry: record.dateOfExpiry || '',
          numberOfRenewal: record.numberOfRenewal || 0,
          googleMapLink: record.googleMapLink || ''
        };
      case 'hotspots':
        return {
          id: record._id,
          permitNumber: record.complaintNumber || 'N/A',
          permitHolder: record.subject || 'N/A',
          commodity: record.typeOfCommodity || 'N/A',
          area: 'N/A',
          barangay: record.barangay || 'N/A',
          municipality: record.municipality || 'N/A',
          province: record.province || 'N/A',
          status: record.actionsTaken || 'Unknown',
          classification: record.natureOfReportedIllegalAct || 'N/A',
          // Hotspots specific fields
          sitio: record.sitio || '',
          longitude: record.longitude || '',
          latitude: record.latitude || '',
          details: record.details || '',
          lawsViolated: record.lawsViolated || '',
          numberOfCDOIssued: record.numberOfCDOIssued || 0,
          remarks: record.remarks || '',
          dateOfActionTaken: record.dateOfActionTaken || '',
          dateIssued: record.dateIssued || '',
          googleMapLink: record.googleMapLink || '',
          natureOfReportedIllegalAct: record.natureOfReportedIllegalAct || '',
          actionsTaken: record.actionsTaken || ''
        };
      default:
        return record;
    }
  };

  const getDisplayData = () => {
    // Use consistent pagination for both online and offline
    return directoryData.map(formatRecordForDisplay);
  };

  const DetailModal = () => (
    <Modal visible={showDetailModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <View style={styles.detailModalHeader}>
            <Text style={styles.detailModalTitle}>Basic Information</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {selectedRecord && (
            <ScrollView style={styles.detailContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{selectedCategory?.id === 'hotspots' ? 'COMPLAINT NO:' : 'PERMIT NO:'}</Text>
                <Text style={styles.detailValue}>{selectedRecord.permitNumber}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{selectedCategory?.id === 'hotspots' ? 'SUBJECT:' : 'PERMIT HOLDER:'}</Text>
                <Text style={styles.detailValue}>{selectedRecord.permitHolder}</Text>
              </View>

              {selectedRecord.classification && selectedRecord.classification !== 'N/A' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>CLASSIFICATION:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.classification}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>TYPE:</Text>
                <Text style={styles.detailValue}>{selectedRecord.type}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>COMMODITY:</Text>
                <Text style={styles.detailValue}>{selectedRecord.commodity}</Text>
              </View>
              
              {selectedRecord.area !== 'N/A' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>AREA:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.area} {selectedCategory?.id === 'national' ? 'hectares' : ''}</Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>LOCATION:</Text>
                <Text style={styles.detailValue}>
                  {selectedRecord.barangay}, {selectedRecord.municipality}, {selectedRecord.province}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>STATUS:</Text>
                <Text 
                  style={[
                    styles.detailValue, 
                    styles.statusText,
                    { 
                      color: getStatusColor(selectedRecord.status),
                      fontWeight: '600'
                    }
                  ]}
                >
                  {selectedRecord.status || 'Status Not Available'}
                </Text>
              </View>

              {/* Google Map Link for national category - Local has its own implementation */}
              {selectedCategory?.id === 'national' && selectedRecord.googleMapLink && selectedRecord.googleMapLink.trim() !== '' && selectedRecord.googleMapLink !== 'N/A' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>GOOGLE MAP LINK:</Text>
                  <TouchableOpacity onPress={async () => {
                    try {
                      let url = selectedRecord.googleMapLink;
                      
                      // Ensure URL has proper protocol
                      if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = `https://${url}`;
                      }
                      
                      // Check if URL can be opened
                      const canOpen = await Linking.canOpenURL(url);
                      if (canOpen) {
                        await Linking.openURL(url);
                      } else {
                        Alert.alert('Error', 'Cannot open this link');
                      }
                    } catch (error) {
                      console.error('Error opening Google Maps:', error);
                      Alert.alert('Error', 'Failed to open Google Maps link');
                    }
                  }}>
                    <Text style={[styles.detailValue, { color: COLORS.primary, textDecorationLine: 'underline' }]}>View Location</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* National Directory specific fields */}
              {selectedCategory?.id === 'national' && (
                <>
                  {selectedRecord.dateFiled && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE FILED:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateFiled}</Text>
                    </View>
                  )}
                  {selectedRecord.dateApproved && selectedRecord.dateApproved.trim() !== '' && selectedRecord.dateApproved !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>APPROVAL DATE:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateApproved}</Text>
                    </View>
                  )}
                  {selectedRecord.renewalDate && selectedRecord.renewalDate.trim() !== '' && selectedRecord.renewalDate !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>RENEWAL DATE:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.renewalDate}</Text>
                    </View>
                  )}
                  {selectedRecord.expirationDate && selectedRecord.expirationDate.trim() !== '' && selectedRecord.expirationDate !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>EXPIRATION DATE:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.expirationDate}</Text>
                    </View>
                  )}
                  {selectedRecord.proponent && selectedRecord.proponent.trim() !== '' && selectedRecord.proponent !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>PROPONENT:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.proponent}</Text>
                    </View>
                  )}
                  {selectedRecord.operator && selectedRecord.operator.trim() !== '' && selectedRecord.operator !== 'N/A' && selectedRecord.operator !== '--' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>OPERATOR:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.operator}</Text>
                    </View>
                  )}
                  {selectedRecord.contactNumber && selectedRecord.contactNumber.trim() !== '' && selectedRecord.contactNumber !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>CONTACT NUMBER:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.contactNumber}</Text>
                    </View>
                  )}
                  {selectedRecord.sourceOfRawMaterials && selectedRecord.sourceOfRawMaterials !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>SOURCE OF RAW MATERIALS:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.sourceOfRawMaterials}</Text>
                    </View>
                  )}
                </>
              )}

              {/* Local Directory specific fields */}
              {selectedCategory?.id === 'local' && (
                <>
                  {/* Date of First Issuance - Top priority */}
                  {selectedRecord.dateOfFirstIssuance && selectedRecord.dateOfFirstIssuance.trim() !== '' && selectedRecord.dateOfFirstIssuance !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE OF FIRST ISSUANCE:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateOfFirstIssuance}</Text>
                    </View>
                  )}
                  {/* Date Filed */}
                  {selectedRecord.dateFiled && selectedRecord.dateFiled.trim() !== '' && selectedRecord.dateFiled !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE FILED:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateFiled}</Text>
                    </View>
                  )}
                  {/* Date Approved */}
                  {selectedRecord.dateApproved && selectedRecord.dateApproved.trim() !== '' && selectedRecord.dateApproved !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE APPROVED:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateApproved}</Text>
                    </View>
                  )}
                  {/* Date of Expiry */}
                  {selectedRecord.dateExpiry && selectedRecord.dateExpiry.trim() !== '' && selectedRecord.dateExpiry !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE OF EXPIRY:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateExpiry}</Text>
                    </View>
                  )}
                  {/* Number of Renewal */}
                  {selectedRecord.numberOfRenewal !== undefined && selectedRecord.numberOfRenewal !== null && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>NO. OF RENEWAL:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.numberOfRenewal.toString()}</Text>
                    </View>
                  )}
                  {/* Google Map Link - Added for local directory */}
                  {selectedRecord.googleMapLink && selectedRecord.googleMapLink.trim() !== '' && selectedRecord.googleMapLink !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>GOOGLE MAP LINK:</Text>
                      <TouchableOpacity onPress={async () => {
                        try {
                          let url = selectedRecord.googleMapLink;
                          
                          // Ensure URL has proper protocol
                          if (!url.startsWith('http://') && !url.startsWith('https://')) {
                            url = `https://${url}`;
                          }
                          
                          // Check if URL can be opened
                          const canOpen = await Linking.canOpenURL(url);
                          if (canOpen) {
                            await Linking.openURL(url);
                          } else {
                            Alert.alert('Error', 'Cannot open this link');
                          }
                        } catch (error) {
                          console.error('Error opening Google Maps:', error);
                          Alert.alert('Error', 'Failed to open Google Maps link');
                        }
                      }}>
                        <Text style={[styles.detailValue, { color: COLORS.primary, textDecorationLine: 'underline' }]}>View Location</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {/* Hotspots Directory specific fields */}
              {selectedCategory?.id === 'hotspots' && (
                <>
                  {/* Coordinates */}
                  {selectedRecord.longitude && selectedRecord.longitude.toString().trim() !== '' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>LONGITUDE:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.longitude)}</Text>
                    </View>
                  )}
                  {selectedRecord.latitude && selectedRecord.latitude.toString().trim() !== '' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>LATITUDE:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.latitude)}</Text>
                    </View>
                  )}
                  
                  {/* Nature of Reported Illegal Act */}
                  {selectedRecord.natureOfReportedIllegalAct && selectedRecord.natureOfReportedIllegalAct.trim() !== '' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>NATURE OF REPORTED ILLEGAL ACT:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.natureOfReportedIllegalAct)}</Text>
                    </View>
                  )}
                  
                  {/* Actions Taken */}
                  {selectedRecord.actionsTaken && selectedRecord.actionsTaken.trim() !== '' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ACTIONS TAKEN:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.actionsTaken)}</Text>
                    </View>
                  )}
                  
                  {/* Date of Action Taken */}
                  {selectedRecord.dateOfActionTaken && selectedRecord.dateOfActionTaken.trim() !== '' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE OF ACTION TAKEN:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.dateOfActionTaken)}</Text>
                    </View>
                  )}
                  
                  {/* No. of CDO Issued */}
                  {selectedRecord.numberOfCDOIssued !== undefined && selectedRecord.numberOfCDOIssued !== null && selectedRecord.numberOfCDOIssued !== 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>NO. OF CDO ISSUED:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.numberOfCDOIssued)}</Text>
                    </View>
                  )}
                  
                  {/* Date Issued */}
                  {selectedRecord.dateIssued && selectedRecord.dateIssued.trim() !== '' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE ISSUED:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.dateIssued)}</Text>
                    </View>
                  )}
                  
                  {/* Google Map Link for hotspots */}
                  {selectedRecord.googleMapLink && selectedRecord.googleMapLink.trim() !== '' && selectedRecord.googleMapLink !== 'N/A' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>GOOGLE MAP LINK:</Text>
                      <TouchableOpacity onPress={async () => {
                        try {
                          let url = selectedRecord.googleMapLink;
                          
                          // Ensure URL has proper protocol
                          if (!url.startsWith('http://') && !url.startsWith('https://')) {
                            url = `https://${url}`;
                          }
                          
                          // Check if URL can be opened
                          const canOpen = await Linking.canOpenURL(url);
                          if (canOpen) {
                            await Linking.openURL(url);
                          } else {
                            Alert.alert('Error', 'Cannot open this link');
                          }
                        } catch (error) {
                          console.error('Error opening Google Maps:', error);
                          Alert.alert('Error', 'Failed to open Google Maps link');
                        }
                      }}>
                        <Text style={[styles.detailValue, { color: COLORS.primary, textDecorationLine: 'underline' }]}>View Location</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Additional fields */}
                  {selectedRecord.sitio && selectedRecord.sitio.trim() !== '' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>SITIO:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.sitio)}</Text>
                    </View>
                  )}
                  {selectedRecord.details && selectedRecord.details.trim() !== '' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DETAILS:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.details)}</Text>
                    </View>
                  )}
                  {selectedRecord.lawsViolated && selectedRecord.lawsViolated.trim() !== '' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>LAWS VIOLATED:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.lawsViolated)}</Text>
                    </View>
                  )}
                  {selectedRecord.remarks && selectedRecord.remarks.trim() !== '' && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>REMARKS:</Text>
                      <Text style={styles.detailValue}>{String(selectedRecord.remarks)}</Text>
                    </View>
                  )}
                </>
              )}

              {/* Google Map Link is now handled in each specific section */}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const CategoryModal = () => (
    <Modal visible={showCategoryModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.categoryModalContent}>
          <View style={styles.categoryModalHeader}>
            <View style={styles.categoryModalHeaderContent}>
              <View style={styles.categoryModalIconContainer}>
                <Ionicons name="grid-outline" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.categoryModalTitleContainer}>
                <Text style={styles.categoryModalTitle}>Database</Text>
                <Text style={styles.categoryModalSubtitle}>Select a category</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={styles.categoryModalCloseButton}
              >
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {stats && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Database Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: '#2563EB15' }]}>
                  <Text style={[styles.statNumber, { color: '#2563EB' }]}>{stats.totals?.national || 0}</Text>
                  <Text style={styles.statLabel}>National</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#10B98115' }]}>
                  <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.totals?.local || 0}</Text>
                  <Text style={styles.statLabel}>Local</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#EF444415' }]}>
                  <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.totals?.hotspots || 0}</Text>
                  <Text style={styles.statLabel}>Hotspots</Text>
                </View>
              </View>
            </View>
          )}

          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={handleCategorySelect}
                isSelected={selectedCategory?.id === item.id}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoryListContainer}
          />
        </View>
      </View>
    </Modal>
  );

  const DownloadProgressModal = () => (
    <Modal 
      visible={showDownloadModal} 
      transparent 
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.downloadModalContent}>
          <View style={styles.downloadModalHeader}>
            <View style={styles.downloadIconContainer}>
              <Ionicons name="cloud-download" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.downloadModalTitle}>Downloading Directory Data</Text>
            <Text style={styles.downloadModalSubtitle}>
              Downloading all directory data for offline use...
            </Text>
          </View>
          
          <View style={styles.downloadProgressContainer}>
            {/* Overall Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
                <Text style={styles.progressPercentage}>{Math.round(downloadProgress.overall)}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${downloadProgress.overall}%` }]} />
              </View>
            </View>

            {/* Individual Category Progress */}
            <View style={styles.categoryProgressContainer}>
              <Text style={styles.categoriesTitle}>Categories</Text>
              
              <View style={styles.categoryProgress}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <Ionicons name="business" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.categoryLabel}>National</Text>
                  </View>
                  <Text style={styles.categoryPercentage}>{Math.round(downloadProgress.national)}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${downloadProgress.national}%` }]} />
                </View>
              </View>

              <View style={styles.categoryProgress}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <Ionicons name="location" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.categoryLabel}>Local</Text>
                  </View>
                  <Text style={styles.categoryPercentage}>{Math.round(downloadProgress.local)}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${downloadProgress.local}%` }]} />
                </View>
              </View>

              <View style={styles.categoryProgress}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <Ionicons name="warning" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.categoryLabel}>Hotspots</Text>
                  </View>
                  <Text style={styles.categoryPercentage}>{Math.round(downloadProgress.hotspots)}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${downloadProgress.hotspots}%` }]} />
                </View>
              </View>
            </View>

            {/* Loading indicator */}
            {isDownloading && (
              <View style={styles.loadingSection}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>
                  {downloadProgress.overall >= 100 ? 'Finalizing download...' : 'Please wait while we download the data...'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            
            {/* Network Status Indicator */}
            <View style={[styles.statusIndicator, { backgroundColor: isOnline ? '#4CAF50' : '#FF5722' }]}>
              <Ionicons 
                name={isOnline ? "wifi" : "wifi-off"} 
                size={12} 
                color="white" 
              />
              <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="grid-outline" size={20} color={COLORS.primary} />
              <Text style={styles.categoryButtonText}>Categories</Text>
            </TouchableOpacity>
            
            {/* Download Button */}
            <TouchableOpacity 
              style={[styles.downloadButton, { opacity: isDownloading ? 0.6 : 1 }]}
              onPress={handleDownloadData}
              disabled={isDownloading || !isOnline}
            >
              <Ionicons 
                name={offlineDataStatus.isDownloaded ? "cloud-done" : "cloud-download"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.downloadButtonText}>
                {offlineDataStatus.isDownloaded ? 'Downloaded' : 'Download'}
              </Text>
            </TouchableOpacity>
            
            {/* Debug button 
            <TouchableOpacity 
              style={[styles.debugButton]}
              onPress={() => {
                console.log('Current filter options:', filterOptions);
                console.log('Selected status:', selectedStatus);
                console.log('Selected category:', selectedCategory?.id);
                
                // Force refresh filter options
                fetchFilterOptions();
                
                // Force refresh data
                fetchDirectoryData(true);
              }}
            >
              <Ionicons 
                name="bug" 
                size={20} 
                color="#ff6b6b" 
              />
              <Text style={styles.debugButtonText}>Debug</Text>
            </TouchableOpacity> */}
          </View>
        </View>
        
        <View style={styles.headerSubtitleContainer}>
          <Text style={styles.headerSubtitle}>
            {selectedCategory ? selectedCategory.label : 'Mining permits and applications database'}
          </Text>
          
          
          {/* Offline Data Status */}
          {offlineDataStatus.isDownloaded && (
            <View style={styles.offlineStatus}>
              <Ionicons name="download" size={14} color={COLORS.textSecondary} />
              <Text style={styles.offlineStatusText}>
                {offlineDataStatus.storageInfo.total} records available offline
              </Text>
              <TouchableOpacity onPress={handleClearOfflineData}>
                <Text style={styles.clearDataText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search records..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
          <TouchableOpacity 
            style={styles.filterToggle}
            onPress={() => setFiltersCollapsed(!filtersCollapsed)}
          >
            <Ionicons 
              name={filtersCollapsed ? "chevron-down" : "chevron-up"} 
              size={20} 
              color={COLORS.primary} 
            />
            <Text style={styles.filterToggleText}>Filters</Text>
          </TouchableOpacity>
        </View>
        
        {!filtersCollapsed && (
          <>
            <View style={styles.filterRow}>
              {/* For National and Local: TYPE comes first, for Hotspots: NATURE OF REPORT comes first */}
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>
                  {selectedCategory?.id === 'hotspots' ? 'NATURE OF REPORT:' : 'TYPE:'}
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCategory?.id === 'hotspots' ? selectedClassification : selectedType}
                    onValueChange={selectedCategory?.id === 'hotspots' ? setSelectedClassification : setSelectedType}
                    style={styles.picker}
                    dropdownIconColor={COLORS.primary}
                  >
                    <Picker.Item 
                      label={selectedCategory?.id === 'hotspots' ? 'All Nature of Reports' : 'All Types'} 
                      value="all" 
                      style={styles.pickerItem} 
                    />
                    {selectedCategory?.id === 'hotspots' ? 
                      filterOptions.classifications.map((classification) => (
                        <Picker.Item 
                          key={classification} 
                          label={classification} 
                          value={classification} 
                          style={styles.pickerItem}
                        />
                      )) :
                      filterOptions.types.map((type) => (
                        <Picker.Item 
                          key={type} 
                          label={type} 
                          value={type} 
                          style={styles.pickerItem}
                        />
                      ))
                    }
                  </Picker>
                </View>
              </View>
              
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>
                  {selectedCategory?.id === 'hotspots' ? 'COMMODITY:' : 'COMMODITY:'}
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCategory?.id === 'hotspots' ? selectedType : selectedClassification}
                    onValueChange={selectedCategory?.id === 'hotspots' ? setSelectedType : setSelectedClassification}
                    style={styles.picker}
                    dropdownIconColor={COLORS.primary}
                  >
                    <Picker.Item 
                      label="All Commodities" 
                      value="all" 
                      style={styles.pickerItem} 
                    />
                    {selectedCategory?.id === 'hotspots' ? 
                      filterOptions.types.map((type) => (
                        <Picker.Item 
                          key={type} 
                          label={type} 
                          value={type} 
                          style={styles.pickerItem}
                        />
                      )) :
                      filterOptions.classifications.map((classification) => (
                        <Picker.Item 
                          key={classification} 
                          label={classification} 
                          value={classification} 
                          style={styles.pickerItem}
                        />
                      ))
                    }
                  </Picker>
                </View>
              </View>
            </View>
            
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>PROVINCE:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedProvince}
                    onValueChange={setSelectedProvince}
                    style={styles.picker}
                    dropdownIconColor={COLORS.primary}
                  >
                    <Picker.Item label="All Provinces" value="all" style={styles.pickerItem} />
                    <Picker.Item label="Batangas" value="Batangas" />
                    <Picker.Item label="Cavite" value="Cavite" />
                    <Picker.Item label="Laguna" value="Laguna" />
                    <Picker.Item label="Quezon" value="Quezon" />
                    <Picker.Item label="Rizal" value="Rizal" />
                  </Picker>
                </View>
              </View>
              
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>
                  {selectedCategory?.id === 'hotspots' ? 'ACTIONS TAKEN:' : 'STATUS:'}
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedStatus}
                    onValueChange={(value) => {
                      console.log('Selected status:', value);
                      setSelectedStatus(value);
                    }}
                    style={styles.picker}
                    dropdownIconColor={COLORS.primary}
                  >
                    <Picker.Item 
                      label={selectedCategory?.id === 'hotspots' ? 'All Actions Taken' : 'All Status'} 
                      value="all" 
                      style={styles.pickerItem} 
                    />
                    {filterOptions.statuses.length > 0 ? (
                      filterOptions.statuses.map((status) => (
                        <Picker.Item 
                          key={status} 
                          label={status} 
                          value={status} 
                          style={styles.pickerItem}
                        />
                      ))
                    ) : (
                      // Default status options if none are loaded
                      <>
                        <Picker.Item label="Operating" value="Operating" style={styles.pickerItem} />
                        <Picker.Item label="Non-operating" value="Non-operating" style={styles.pickerItem} />
                        <Picker.Item label="Suspended" value="Suspended" style={styles.pickerItem} />
                        <Picker.Item label="Expired" value="Expired" style={styles.pickerItem} />
                        <Picker.Item label="Cancelled" value="Cancelled" style={styles.pickerItem} />
                        <Picker.Item label="Care and Maintenance" value="Care and Maintenance" style={styles.pickerItem} />
                        <Picker.Item label="Unknown" value="Unknown" style={styles.pickerItem} />
                      </>
                    )}
                  </Picker>
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsLeft}>
          <Text style={styles.resultsText}>
            {pagination.totalRecords} records found
          </Text>
          {!isOnline && offlineDataStatus.isDownloaded && (
            <Text style={styles.offlineIndicator}>
              • Showing offline data
            </Text>
          )}
        </View>
        {(searchQuery || selectedProvince !== 'all' || selectedStatus !== 'all' || selectedClassification !== 'all' || selectedType !== 'all') && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setSelectedProvince('all');
              setSelectedStatus('all');
              setSelectedClassification('all');
              setSelectedType('all');
            }}
          >
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Data Table */}
      <View style={styles.tableContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading directory data...</Text>
          </View>
        ) : getDisplayData().length > 0 ? (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            scrollEventThrottle={400}
          >
            <DataTable
              data={getDisplayData()}
              onRowPress={handleRowPress}
              category={selectedCategory?.id}
            />
            
            {/* Loading indicator */}
            {loadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadMoreText}>Loading more records...</Text>
              </View>
            )}
            
            {/* Load More Button or End Message */}
            {pagination.hasNext ? (
              <TouchableOpacity 
                style={styles.loadMoreButton} 
                onPress={loadMoreData}
                disabled={loadingMore}
              >
                <Text style={styles.loadMoreButtonText}>
                  Load More Records ({directoryData.length} of {pagination.totalRecords})
                </Text>
              </TouchableOpacity>
            ) : pagination.totalRecords > 0 ? (
              <View style={styles.endContainer}>
                <Text style={styles.endText}>
                  All {pagination.totalRecords} records loaded
                </Text>
              </View>
            ) : null}
          </ScrollView>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.emptyScrollContainer}
          >
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={60} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No records found</Text>
              <Text style={styles.emptySubtext}>
                {selectedCategory ? `No ${selectedCategory.label.toLowerCase()} records match your criteria` : 'Try adjusting your search criteria'}
              </Text>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Modals */}
      <CategoryModal />
      <DetailModal />
      <DownloadProgressModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultsLeft: {
    flex: 1,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  offlineIndicator: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  tableContainer: {
    flex: 1,
    margin: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  categoryModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    padding: 0,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  categoryModalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  categoryModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  categoryModalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryModalTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  categoryModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  categoryModalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  categoryModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginLeft: 16,
  },
  statsContainer: {
    padding: 24,
    backgroundColor: COLORS.white,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryListContainer: {
    padding: 16,
    paddingTop: 0,
  },
  detailModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '85%',
    marginBottom: 20,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  detailContent: {
    padding: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  statusText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
    minWidth: 120,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  pickerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  picker: {
    height: 50,
    color: COLORS.textPrimary,
    fontSize: 11,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyScrollContainer: {
    flexGrow: 1,
  },
  statsContainer: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  endContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  endText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  pickerItem: {
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  loadMoreButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    marginLeft: 8,
  },
  filterToggleText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  // Offline functionality styles
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  refreshButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  debugButtonText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerSubtitleContainer: {
    marginTop: 8,
  },
  offlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  offlineStatusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  clearDataText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Download Progress Modal styles
  downloadModalContent: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  downloadModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  downloadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  downloadModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  downloadModalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  downloadProgressContainer: {
    gap: 24,
  },
  progressSection: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  categoryProgressContainer: {
    gap: 16,
  },
  categoryProgress: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
});
