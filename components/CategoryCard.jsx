import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const CategoryCard = ({ category, onPress, isSelected }) => {
  const getIconName = (categoryId) => {
    switch (categoryId) {
      case 'mining_rights':
        return 'document-text-outline';
      case 'mining_applications':
        return 'document-outline';
      case 'special_permits':
        return 'shield-checkmark-outline';
      case 'special_applications':
        return 'shield-outline';
      case 'investigation_records':
        return 'search-outline';
      default:
        return 'folder-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={() => onPress(category)}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getIconName(category.id)}
          size={24}
          color={isSelected ? COLORS.white : COLORS.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[
          styles.title,
          isSelected && styles.selectedTitle
        ]}>
          {category.label}
        </Text>
        <Text style={[
          styles.count,
          isSelected && styles.selectedCount
        ]}>
          {category.count} entries
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={isSelected ? COLORS.white : COLORS.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  selectedTitle: {
    color: COLORS.white,
  },
  count: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedCount: {
    color: 'rgba(255,255,255,0.8)',
  },
});

export default CategoryCard;
