import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  Picker,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';

const violationCategories = [
  {
    id: 'illegal_mining',
    english: 'Illegal Mining',
    filipino: 'Ilegal na Pagmimina',
    description: 'Unauthorized mining operations'
  },
  {
    id: 'illegal_transport',
    english: 'Illegal Mineral Transportation',
    filipino: 'Ilegal na Transportasyon ng Mineral',
    description: 'Unauthorized transport of minerals'
  },
  {
    id: 'illegal_processing',
    english: 'Illegal Mineral Processing',
    filipino: 'Ilegal na Pagpoproseso ng Mineral',
    description: 'Unauthorized mineral processing activities'
  },
  {
    id: 'illegal_trading',
    english: 'Illegal Mineral Trading',
    filipino: 'Ilegal na Kalakalan ng Mineral',
    description: 'Unauthorized mineral trading activities'
  },
  {
    id: 'illegal_exploration',
    english: 'Illegal Exploration',
    filipino: 'Ilegal na Eksplorasyon',
    description: 'Unauthorized mineral exploration'
  },
  {
    id: 'illegal_smallscale',
    english: 'Illegal Small-Scale Mining of Gold',
    filipino: 'Ilegal na Maliitang Pagmimina ng Ginto',
    description: 'Unauthorized small-scale gold mining'
  }
];

const mockReports = [
  {
    id: 'RPT-001',
    category: 'illegal_mining',
    location: 'Brgy. San Jose, Rodriguez, Rizal',
    dateReported: '2024-01-15',
    status: 'Under Investigation',
    submittedBy: 'Inspector Juan Dela Cruz',
  },
  {
    id: 'RPT-002',
    category: 'illegal_transport',
    location: 'Brgy. Pinagbayanan, Masinloc, Cavite',
    dateReported: '2024-01-20',
    status: 'Resolved',
    submittedBy: 'Inspector Maria Santos',
  },
];

export default function Reports() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState(mockReports);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showMyReports, setShowMyReports] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [language, setLanguage] = useState('english');
  const [expandedCard, setExpandedCard] = useState(null);
  
  // Form state for Illegal Mining checklist
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    location: '',
    date: '',
    time: '',
    hasSignboard: null, // null, true, false
    projectName: '',
    commodity: '',
    siteStatus: 'Operating',
    activities: {
      extraction: false,
      disposition: false,
      processing: false
    },
    extractionEquipment: [],
    dispositionEquipment: [],
    processingEquipment: [],
    operatorName: '',
    operatorAddress: '',
    operatorDetermination: '',
    additionalInfo: ''
  });

  // Optimized form update functions to prevent unnecessary re-renders
  const updateFormData = useCallback((field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  }, []);

  const updateNestedFormData = useCallback((parentField, childField, value) => {
    setFormData(prevData => ({
      ...prevData,
      [parentField]: {
        ...prevData[parentField],
        [childField]: value
      }
    }));
  }, []);
  
  // Check if user has reporting permissions (not public user)
  const canReport = user?.role !== 'public';

  const handleCategorySelect = (category) => {
    if (!canReport) {
      Alert.alert(
        'Access Restricted',
        'Reporting feature is disabled for Public Users. Please contact MGB CALABARZON for assistance.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedCategory(category);
    setShowCategoryModal(false);
    setShowChecklistModal(true);
  };

  const handleSubmitReport = () => {
    Alert.alert(
      'Submit Report',
      'Submit this report directly to MGB CALABARZON?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            Alert.alert('Success', 'Report submitted to MGB CALABARZON successfully!');
            setShowChecklistModal(false);
            setSelectedCategory(null);
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Investigation':
        return '#FF9800';
      case 'Resolved':
        return COLORS.primary;
      case 'Pending Review':
        return '#2196F3';
      default:
        return COLORS.textSecondary;
    }
  };

  const CategoryCard = ({ category, index }) => {
    const title = language === 'english' ? category.english : category.filipino;
    return (
      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => handleCategorySelect(category)}
      >
        <Text style={styles.categoryButtonText}>{index + 1}. {title}</Text>
      </TouchableOpacity>
    );
  };

  const ReportCard = ({ item, index }) => {
    const category = violationCategories.find(cat => cat.id === item.category);
    const categoryTitle = category ? (language === 'english' ? category.english : category.filipino) : 'Unknown Category';
    
    return (
      <View style={styles.reportCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{categoryTitle}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{item.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{item.dateReported}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{item.submittedBy}</Text>
          </View>
        </View>
      </View>
    );
  };

  const CategorySelectionModal = () => (
    <Modal visible={showCategoryModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.categoryModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {/* Language Toggle */}
          <View style={styles.languageToggle}>
            <TouchableOpacity
              style={[styles.languageButton, language === 'english' && styles.activeLanguage]}
              onPress={() => setLanguage('english')}
            >
              <Text style={[styles.languageText, language === 'english' && styles.activeLanguageText]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, language === 'filipino' && styles.activeLanguage]}
              onPress={() => setLanguage('filipino')}
            >
              <Text style={[styles.languageText, language === 'filipino' && styles.activeLanguageText]}>Filipino</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.newReportLabel}>New Report:</Text>
          
          <ScrollView style={styles.categoriesContainer}>
            {violationCategories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </ScrollView>

          {!canReport && (
            <View style={styles.restrictionNotice}>
              <Ionicons name="information-circle" size={20} color="#FF5722" />
              <Text style={styles.restrictionText}>
                Reporting Feature is disabled for Public Users.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const IllegalMiningChecklist = useMemo(() => (
    <ScrollView style={styles.checklistContent}>
      {/* GPS Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>GPS Location:</Text>
        <View style={styles.gpsRow}>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>Latitude:</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={formData.latitude}
              onChangeText={(text) => updateFormData('latitude', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>Longitude:</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={formData.longitude}
              onChangeText={(text) => updateFormData('longitude', text)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.getLocationButton}>
          <Text style={styles.getLocationText}>Get Coordinates from Google Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>Location:</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder="Sitio/Barangay/Municipality/City/Province"
          value={formData.location}
          onChangeText={(text) => updateFormData('location', text)}
        />
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateInput}>
            <Text style={styles.sectionLabel}>Date:</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="mm/dd/yyyy"
              value={formData.date}
              onChangeText={(text) => updateFormData('date', text)}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.sectionLabel}>Time:</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="07:30 AM"
              value={formData.time}
              onChangeText={(text) => updateFormData('time', text)}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.usePhoneButton}>
          <Text style={styles.usePhoneText}>Use phone's time and date</Text>
        </TouchableOpacity>
      </View>

      {/* Project Information Board */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>Is there a Project Information Board on Site? (check one box)</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateFormData('hasSignboard', false)}
          >
            <View style={[styles.checkbox, formData.hasSignboard === false && styles.checkedBox]} />
            <Text style={styles.checkboxText}>No signboard observed</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateFormData('hasSignboard', null)}
          >
            <View style={[styles.checkbox, formData.hasSignboard === null && styles.checkedBox]} />
            <Text style={styles.checkboxText}>Not determined</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateFormData('hasSignboard', true)}
          >
            <View style={[styles.checkbox, formData.hasSignboard === true && styles.checkedBox]} />
            <Text style={styles.checkboxText}>If yes, please indicate the name of the project:</Text>
          </TouchableOpacity>
        </View>
        {formData.hasSignboard === true && (
          <TextInput 
            style={styles.textInput}
            placeholder="Project name"
            value={formData.projectName}
            onChangeText={(text) => updateFormData('projectName', text)}
          />
        )}
      </View>

      {/* Commodity */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>Commodity:</Text>
        <TextInput 
          style={styles.textInput}
          placeholder="Sand and Gravel/Filling Materials/Construction Aggregates/Rocks/Sand/Boulders/Base Course/Common Soil/Limestone/Silica/Others"
          value={formData.commodity}
          onChangeText={(text) => updateFormData('commodity', text)}
          multiline
        />
      </View>

      {/* Site Status */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>Site Status during Verification: (dropdown box)</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => {
              Alert.alert(
                'Site Status',
                'Select site status',
                [
                  { text: 'Operating', onPress: () => updateFormData('siteStatus', 'Operating') },
                  { text: 'Non-operating', onPress: () => updateFormData('siteStatus', 'Non-operating') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.dropdownText}>{formData.siteStatus}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Operating Status Activities */}
      {formData.siteStatus === 'Operating' && (
        <View style={styles.operatingSection}>
          <Text style={styles.operatingNote}>(If operating status, this checklist will appear)</Text>
          
          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>Activities observed in the area: (check all that apply)</Text>
            <View style={styles.activitiesContainer}>
              <TouchableOpacity 
                style={styles.activityRow}
                onPress={() => updateNestedFormData('activities', 'extraction', !formData.activities.extraction)}
              >
                <View style={[styles.checkbox, formData.activities.extraction && styles.checkedBox]} />
                <Text style={styles.activityText}>Extraction</Text>
                <Text style={styles.equipmentText}>Backhoe/Mini Backhoe/Excavator/Shovel/Front-end Loader/</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.activityRow}
                onPress={() => updateNestedFormData('activities', 'disposition', !formData.activities.disposition)}
              >
                <View style={[styles.checkbox, formData.activities.disposition && styles.checkedBox]} />
                <Text style={styles.activityText}>Disposition/Transportation</Text>
                <Text style={styles.equipmentText}>Dump truck/Mini dump truck/Jeep/others</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.activityRow}
                onPress={() => updateNestedFormData('activities', 'processing', !formData.activities.processing)}
              >
                <View style={[styles.checkbox, formData.activities.processing && styles.checkedBox]} />
                <Text style={styles.activityText}>Mineral Processing</Text>
                <Text style={styles.equipmentText}>Crushing Plant/Mobile Crusher/Sand Washing</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Operator Information */}
          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>Name of Operator/s:</Text>
            <TextInput 
              style={styles.textInput}
              value={formData.operatorName}
              onChangeText={(text) => updateFormData('operatorName', text)}
            />
          </View>

          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>Address of Operator/s:</Text>
            <TextInput 
              style={styles.textInput}
              value={formData.operatorAddress}
              onChangeText={(text) => updateFormData('operatorAddress', text)}
            />
          </View>

          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>How did you determine the operator/s in the area?</Text>
            <TextInput 
              style={[styles.textInput, styles.textArea]}
              multiline
              value={formData.operatorDetermination}
              onChangeText={(text) => updateFormData('operatorDetermination', text)}
            />
          </View>
        </View>
      )}

      {/* Additional Information */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>Additional Information:</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={formData.additionalInfo}
          onChangeText={(text) => updateFormData('additionalInfo', text)}
        />
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>Attach photo/s (Preferably geotagged)</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadText}>Upload image from gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton}>
            <Text style={styles.cameraText}>Use phone camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Certification Statement */}
      <View style={styles.certificationSection}>
        <Text style={styles.certificationTitle}>Certification Statement:</Text>
        <Text style={styles.certificationText}>
          By submitting this report, I certify that the information contained herein is true, complete, and accurate to the best of my knowledge. I affirm that the observations, interviews, and documentation reflected in this report were conducted in good faith and without bias.
        </Text>
        <Text style={styles.certificationText}>
          I understand that this report will be used for official verification, possible legal action, and agency decision-making. I also acknowledge my responsibility to uphold the integrity and objectivity expected of my role as a Deputy Environment and Natural Resources Officer.
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitToMGBButton} onPress={handleSubmitReport}>
        <Text style={styles.submitToMGBText}>Submit to MGB CALABARZON</Text>
      </TouchableOpacity>
    </ScrollView>
  ), [formData, updateFormData, updateNestedFormData]);

  const ChecklistModal = useMemo(() => (
    <Modal visible={showChecklistModal} transparent animationType="none">
      <View style={styles.modalOverlay}>
        <View style={styles.checklistModalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowChecklistModal(false)}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedCategory && (language === 'english' ? selectedCategory.english : selectedCategory.filipino)} Checklist
            </Text>
            <TouchableOpacity onPress={() => Alert.alert('Profile', 'User profile options')}>
              <Ionicons name="person-circle-outline" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {selectedCategory?.id === 'illegal_mining' ? IllegalMiningChecklist : (
            <ScrollView style={styles.checklistContent}>
              <Text style={styles.placeholderText}>
                Checklist for {selectedCategory?.english} will be implemented here.
              </Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  ), [showChecklistModal, selectedCategory, language, IllegalMiningChecklist]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSubtitle}>Mining violations and incidents</Text>
      </View>

      {/* Header Buttons */}
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={[styles.headerButton, showMyReports && styles.activeHeaderButton]}
          onPress={() => setShowMyReports(!showMyReports)}
        >
          <Text style={[styles.headerButtonText, showMyReports && styles.activeHeaderButtonText]}>My Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <ReportCard item={item} index={index} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No reports yet</Text>
            <Text style={styles.emptySubtext}>Create a new report using the categories below</Text>
          </View>
        }
      />

      {/* New Report Button */}
      <TouchableOpacity
        style={styles.newReportButton}
        onPress={() => setShowCategoryModal(true)}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={styles.newReportButtonText}>New Report</Text>
      </TouchableOpacity>

      {/* Modals */}
      <CategorySelectionModal />
      {ChecklistModal}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  headerButtons: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
  },
  activeHeaderButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  headerButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeHeaderButtonText: {
    color: COLORS.white,
  },
  listContainer: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  cardInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  newReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newReportButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    height: '70%',
  },
  checklistModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '95%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeLanguage: {
    backgroundColor: COLORS.primary,
  },
  languageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeLanguageText: {
    color: COLORS.white,
  },
  newReportLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  categoriesContainer: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryButton: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  restrictionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    margin: 20,
    borderRadius: 8,
    gap: 8,
  },
  restrictionText: {
    fontSize: 12,
    color: '#FF5722',
    flex: 1,
  },
  checklistContent: {
    padding: 20,
  },
  checklistSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  locationRow: {
    gap: 8,
  },
  coordinateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coordinateLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    width: 80,
    fontWeight: '600',
  },
  coordinateField: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginLeft: 8,
    minHeight: 48,
    backgroundColor: COLORS.white,
  },
  getLocationButton: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  getLocationText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  dateInput: {
    flex: 1,
  },
  timeInput: {
    flex: 1,
  },
  gpsRow: {
    gap: 12,
    marginBottom: 12,
  },
  dateTimeSection: {
    marginBottom: 20,
  },
  usePhoneButton: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  usePhoneText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
    textAlign: 'center',
  },
  checkboxContainer: {
    gap: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 4,
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 2,
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dropdownContainer: {
    marginTop: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  operatingSection: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  operatingNote: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  activitiesContainer: {
    gap: 12,
  },
  activityRow: {
    flexDirection: 'column',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 24,
    marginBottom: 4,
  },
  equipmentText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 24,
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  violationCode: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  photoSection: {
    gap: 8,
  },
  photoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  cameraButton: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  cameraText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  certificationSection: {
    backgroundColor: '#FFF9C4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  certificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  certificationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  submitToMGBButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitToMGBText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBackground,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  locationSection: {
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  detailContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
});
