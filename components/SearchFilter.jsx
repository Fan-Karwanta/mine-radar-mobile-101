import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const SearchFilter = ({ 
  searchQuery, 
  onSearchChange, 
  selectedType, 
  selectedProvince, 
  selectedCommodity,
  onTypeChange, 
  onProvinceChange, 
  onCommodityChange,
  typeOptions,
  provinceOptions,
  commodityOptions 
}) => {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showCommodityModal, setShowCommodityModal] = useState(false);

  const FilterModal = ({ visible, onClose, options, selectedValue, onSelect, title }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  selectedValue === item.id && styles.selectedOption
                ]}
                onPress={() => {
                  onSelect(item.id);
                  onClose();
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedValue === item.id && styles.selectedOptionText
                ]}>
                  {item.label}
                </Text>
                {selectedValue === item.id && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search permits, holders, commodities..."
          placeholderTextColor={COLORS.placeholderText}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowTypeModal(true)}
        >
          <Text style={styles.filterButtonText}>
            Type: {typeOptions.find(t => t.id === selectedType)?.label || 'All'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowProvinceModal(true)}
        >
          <Text style={styles.filterButtonText}>
            Province: {provinceOptions.find(p => p.id === selectedProvince)?.label || 'All'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowCommodityModal(true)}
        >
          <Text style={styles.filterButtonText}>
            Commodity: {commodityOptions.find(c => c.id === selectedCommodity)?.label || 'All'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Filter Modals */}
      <FilterModal
        visible={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        options={typeOptions}
        selectedValue={selectedType}
        onSelect={onTypeChange}
        title="Select Permit Type"
      />

      <FilterModal
        visible={showProvinceModal}
        onClose={() => setShowProvinceModal(false)}
        options={provinceOptions}
        selectedValue={selectedProvince}
        onSelect={onProvinceChange}
        title="Select Province"
      />

      <FilterModal
        visible={showCommodityModal}
        onClose={() => setShowCommodityModal(false)}
        options={commodityOptions}
        selectedValue={selectedCommodity}
        onSelect={onCommodityChange}
        title="Select Commodity"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
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
    height: 40,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedOption: {
    backgroundColor: COLORS.background,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default SearchFilter;
