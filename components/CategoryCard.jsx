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
      case 'national':
        return 'business-outline';
      case 'local':
        return 'location-outline';
      case 'hotspots':
        return 'warning-outline';
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

  const getCategoryColor = (categoryId) => {
    switch (categoryId) {
      case 'national':
        return '#2563EB'; // Blue
      case 'local':
        return '#10B981'; // Green
      case 'hotspots':
        return '#EF4444'; // Red
      default:
        return COLORS.primary;
    }
  };

  const iconColor = isSelected ? COLORS.white : getCategoryColor(category.id);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${getCategoryColor(category.id)}15` }]}>
        <Ionicons
          name={getIconName(category.id)}
          size={24}
          color={iconColor}
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
          styles.description,
          isSelected && styles.selectedDescription
        ]}>
          {category.description}
        </Text>
      </View>
      <View style={styles.rightContainer}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isSelected ? COLORS.white : COLORS.textSecondary}
        />
      </View>
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
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  selectedContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  selectedTitle: {
    color: COLORS.white,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '400',
  },
  selectedDescription: {
    color: 'rgba(255,255,255,0.9)',
  },
  rightContainer: {
    marginLeft: 8,
    padding: 4,
  },
});

export default CategoryCard;
