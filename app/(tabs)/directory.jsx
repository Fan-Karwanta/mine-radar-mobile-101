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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import SearchFilter from '../../components/SearchFilter';
import DataTable from '../../components/DataTable';
import CategoryCard from '../../components/CategoryCard';
import directoryService from '../../services/directoryService';

// Directory categories
const categories = [
  {
    id: 'national',
    label: 'Directory of National',
    description: 'National mining agreements and permits',
    icon: 'business-outline',
    color: COLORS.primary
  },
  {
    id: 'local',
    label: 'Directory of Local',
    description: 'Local quarry permits and applications',
    icon: 'location-outline',
    color: '#2196F3'
  },
  {
    id: 'hotspots',
    label: 'Directory of Hotspots',
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    classifications: [],
    types: [],
    statuses: []
  });

  useEffect(() => {
    fetchDirectoryData(1, false);
  }, [selectedCategory, searchQuery, selectedProvince, selectedStatus, selectedClassification, selectedType]);

  useEffect(() => {
    if (selectedCategory) {
      fetchFilterOptions();
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchDirectoryData = async (page = 1, append = false) => {
    if (!selectedCategory) return;
    
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const params = {
        page,
        limit: 20,
        search: searchQuery || undefined,
        province: selectedProvince !== 'all' ? selectedProvince : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        classification: selectedClassification !== 'all' ? selectedClassification : undefined,
        type: selectedType !== 'all' ? selectedType : undefined
      };

      let response;
      switch (selectedCategory.id) {
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
          response = { success: false, data: [] };
      }

      if (response.success) {
        if (append && page > 1) {
          setDirectoryData(prev => [...prev, ...(response.data || [])]);
        } else {
          setDirectoryData(response.data || []);
        }
        setPagination({
          currentPage: response.pagination?.currentPage || page,
          totalPages: response.pagination?.totalPages || 1,
          totalRecords: response.pagination?.totalRecords || response.data?.length || 0,
          hasNext: response.pagination?.hasNext || false,
          hasPrev: response.pagination?.hasPrev || false
        });
      } else {
        if (!append) setDirectoryData([]);
        Alert.alert('Error', 'Failed to fetch directory data');
      }
    } catch (error) {
      console.error('Error fetching directory data:', error);
      setDirectoryData([]);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await directoryService.getDirectoryStats();
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
    await fetchDirectoryData(1, false);
    await fetchStats();
    setRefreshing(false);
  };

  const loadMoreData = async () => {
    if (!loadingMore && pagination.hasNext && pagination.currentPage < pagination.totalPages) {
      console.log('Loading more data - Current page:', pagination.currentPage, 'Total pages:', pagination.totalPages);
      await fetchDirectoryData(pagination.currentPage + 1, true);
    }
  };

  const handleRowPress = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    setSearchQuery('');
    setSelectedProvince('all');
    setSelectedStatus('all');
    setSelectedClassification('all');
    setSelectedType('all');
    // Reset filter options when category changes
    setFilterOptions({
      classifications: [],
      types: [],
      statuses: []
    });
  };

  const formatRecordForDisplay = (record) => {
    // Transform database record to display format based on category
    switch (selectedCategory?.id) {
      case 'national':
        return {
          id: record._id,
          permitNumber: record.contractNumber,
          permitHolder: record.contractor,
          commodity: record.commodity,
          area: record.area,
          barangay: record.barangay,
          municipality: record.municipality,
          province: record.province,
          status: record.status,
          classification: record.classification || 'N/A',
          type: record.type || 'N/A',
          proponent: record.proponent,
          contactNumber: record.contactNumber,
          operator: record.operator,
          dateFiled: record.dateFiled,
          dateApproved: record.approvalDate,
          renewalDate: record.renewalDate,
          expirationDate: record.expirationDate,
          sourceOfRawMaterials: record.sourceOfRawMaterials,
          googleMapLink: record.googleMapLink
        };
      case 'local':
        return {
          id: record._id,
          permitNumber: record.permitNumber,
          permitHolder: record.permitHolder,
          commodity: record.commodities,
          area: record.area,
          barangay: record.barangays,
          municipality: record.municipality,
          province: record.province,
          status: record.status,
          classification: record.classification || 'N/A',
          type: record.type || 'N/A',
          dateFiled: record.dateFiled,
          dateApproved: record.dateApproved,
          dateExpiry: record.dateOfExpiry,
          numberOfRenewal: record.numberOfRenewal,
          dateOfFirstIssuance: record.dateOfFirstIssuance,
          googleMapLink: record.googleMapLink
        };
      case 'hotspots':
        return {
          id: record._id,
          permitNumber: record.complaintNumber,
          permitHolder: record.subject,
          commodity: record.typeOfCommodity,
          area: 'N/A',
          barangay: record.barangay,
          municipality: record.municipality,
          province: record.province,
          status: record.actionsTaken,
          classification: record.natureOfReportedIllegalAct || 'N/A',
          type: record.typeOfCommodity || 'N/A',
          sitio: record.sitio,
          longitude: record.longitude,
          latitude: record.latitude,
          details: record.details,
          lawsViolated: record.lawsViolated,
          numberOfCDOIssued: record.numberOfCDOIssued,
          remarks: record.remarks,
          dateApproved: record.dateOfActionTaken,
          dateExpiry: record.dateIssued,
          googleMapLink: record.googleMapLink
        };
      default:
        return record;
    }
  };

  const getDisplayData = () => {
    return directoryData.map(formatRecordForDisplay);
  };

  const DetailModal = () => (
    <Modal visible={showDetailModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <View style={styles.detailModalHeader}>
            <Text style={styles.detailModalTitle}>Permit Details</Text>
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
                <Text style={[styles.detailValue, styles.statusText]}>{selectedRecord.status}</Text>
              </View>

              {/* National Directory specific fields */}
              {selectedCategory?.id === 'national' && (
                <>
                  {selectedRecord.proponent && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>PROPONENT:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.proponent}</Text>
                    </View>
                  )}
                  {selectedRecord.operator && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>OPERATOR:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.operator}</Text>
                    </View>
                  )}
                  {selectedRecord.contactNumber && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>CONTACT NUMBER:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.contactNumber}</Text>
                    </View>
                  )}
                  {selectedRecord.dateFiled && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE FILED:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateFiled}</Text>
                    </View>
                  )}
                  {selectedRecord.dateApproved && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>APPROVAL DATE:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateApproved}</Text>
                    </View>
                  )}
                  {selectedRecord.renewalDate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>RENEWAL DATE:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.renewalDate}</Text>
                    </View>
                  )}
                  {selectedRecord.expirationDate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>EXPIRATION DATE:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.expirationDate}</Text>
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
                  {selectedRecord.dateFiled && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE FILED:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateFiled}</Text>
                    </View>
                  )}
                  {selectedRecord.dateApproved && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE APPROVED:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateApproved}</Text>
                    </View>
                  )}
                  {selectedRecord.dateExpiry && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE OF EXPIRY:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateExpiry}</Text>
                    </View>
                  )}
                  {selectedRecord.numberOfRenewal !== undefined && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>NO. OF RENEWAL:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.numberOfRenewal}</Text>
                    </View>
                  )}
                  {selectedRecord.dateOfFirstIssuance && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE OF FIRST ISSUANCE:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateOfFirstIssuance}</Text>
                    </View>
                  )}
                </>
              )}

              {/* Hotspots Directory specific fields */}
              {selectedCategory?.id === 'hotspots' && (
                <>
                  {selectedRecord.sitio && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>SITIO:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.sitio}</Text>
                    </View>
                  )}
                  {selectedRecord.details && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DETAILS:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.details}</Text>
                    </View>
                  )}
                  {selectedRecord.lawsViolated && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>LAWS VIOLATED:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.lawsViolated}</Text>
                    </View>
                  )}
                  {selectedRecord.numberOfCDOIssued && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>NO. OF CDO ISSUED:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.numberOfCDOIssued}</Text>
                    </View>
                  )}
                  {selectedRecord.remarks && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>REMARKS:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.remarks}</Text>
                    </View>
                  )}
                  {selectedRecord.longitude && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>LONGITUDE:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.longitude}</Text>
                    </View>
                  )}
                  {selectedRecord.latitude && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>LATITUDE:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.latitude}</Text>
                    </View>
                  )}
                  {selectedRecord.dateApproved && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE OF ACTION TAKEN:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateApproved}</Text>
                    </View>
                  )}
                  {selectedRecord.dateExpiry && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DATE ISSUED:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.dateExpiry}</Text>
                    </View>
                  )}
                </>
              )}

              {selectedRecord.googleMapLink && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>GOOGLE MAP LINK:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.googleMapLink || 'Not available'}</Text>
                </View>
              )}
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
            <Text style={styles.categoryModalTitle}>MGB CALABARZON Database</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.categorySubtitle}>
            Easy access to MGB CALABARZON database of:
          </Text>
          
          {stats && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Database Statistics:</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>National: {stats.totals?.national || 0}</Text>
                <Text style={styles.statsLabel}>Local: {stats.totals?.local || 0}</Text>
                <Text style={styles.statsLabel}>Hotspots: {stats.totals?.hotspots || 0}</Text>
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
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Directory</Text>
          <TouchableOpacity 
            style={styles.categoryButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Ionicons name="grid-outline" size={20} color={COLORS.primary} />
            <Text style={styles.categoryButtonText}>Categories</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {selectedCategory ? selectedCategory.label : 'Mining permits and applications database'}
        </Text>
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
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>
                  {selectedCategory?.id === 'hotspots' ? 'ILLEGAL ACT TYPE:' : 'CLASSIFICATION:'}
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedClassification}
                    onValueChange={setSelectedClassification}
                    style={styles.picker}
                    dropdownIconColor={COLORS.primary}
                  >
                    <Picker.Item 
                      label={selectedCategory?.id === 'hotspots' ? 'All Illegal Act Types' : 'All Classifications'} 
                      value="all" 
                      style={styles.pickerItem} 
                    />
                    {filterOptions.classifications.map((classification) => (
                      <Picker.Item 
                        key={classification} 
                        label={classification} 
                        value={classification} 
                        style={styles.pickerItem}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>
                  {selectedCategory?.id === 'hotspots' ? 'COMMODITY TYPE:' : 'TYPE:'}
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedType}
                    onValueChange={setSelectedType}
                    style={styles.picker}
                    dropdownIconColor={COLORS.primary}
                  >
                    <Picker.Item 
                      label={selectedCategory?.id === 'hotspots' ? 'All Commodity Types' : 'All Types'} 
                      value="all" 
                      style={styles.pickerItem} 
                    />
                    {filterOptions.types.map((type) => (
                      <Picker.Item 
                        key={type} 
                        label={type} 
                        value={type} 
                        style={styles.pickerItem}
                      />
                    ))}
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
                  {selectedCategory?.id === 'hotspots' ? 'ACTION STATUS:' : 'STATUS:'}
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedStatus}
                    onValueChange={setSelectedStatus}
                    style={styles.picker}
                    dropdownIconColor={COLORS.primary}
                  >
                    <Picker.Item 
                      label={selectedCategory?.id === 'hotspots' ? 'All Action Status' : 'All Status'} 
                      value="all" 
                      style={styles.pickerItem} 
                    />
                    {selectedCategory?.id === 'hotspots' ? (
                      filterOptions.statuses.map((status) => (
                        <Picker.Item 
                          key={status} 
                          label={status} 
                          value={status} 
                          style={styles.pickerItem}
                        />
                      ))
                    ) : (
                      <>
                        <Picker.Item label="Operating" value="Operating" />
                        <Picker.Item label="Non-operating" value="Non-operating" />
                        <Picker.Item label="Suspended" value="Suspended" />
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
        <Text style={styles.resultsText}>
          {pagination.totalRecords} records found
        </Text>
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
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const paddingToBottom = 50;
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
              
              if (isCloseToBottom && !loadingMore && pagination.hasNext) {
                loadMoreData();
              }
            }}
            scrollEventThrottle={400}
          >
            <DataTable
              data={getDisplayData()}
              onRowPress={handleRowPress}
              category={selectedCategory?.id}
            />
            {loadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadMoreText}>Loading more...</Text>
              </View>
            )}
            {pagination.totalRecords > 0 && !pagination.hasNext && pagination.currentPage >= pagination.totalPages && (
              <View style={styles.endContainer}>
                <Text style={styles.endText}>End of results ({pagination.totalRecords} total)</Text>
              </View>
            )}
            {pagination.totalRecords > 20 && pagination.hasNext && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreData}>
                <Text style={styles.loadMoreButtonText}>Load More Records</Text>
              </TouchableOpacity>
            )}
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
    fontSize: 24,
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
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  },
  categoryModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  categorySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  detailModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
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
});
