import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import COLORS from '../constants/colors';

const DataTable = ({ data, onRowPress, category }) => {
  // Debug log for data
  console.log('DataTable received data:', data.slice(0, 2));
  
  const getHeaders = () => {
    switch (category) {
      case 'national':
        return [
          { key: 'permitNumber', label: 'Contract No.', width: 130 },
          { key: 'permitHolder', label: 'Contractor', width: 180 },
          { key: 'classification', label: 'Classification', width: 120 },
          { key: 'type', label: 'Type', width: 120 },
          { key: 'commodity', label: 'Commodity', width: 140 },
          { key: 'area', label: 'Area (ha)', width: 90 },
          { key: 'municipality', label: 'Municipality', width: 120 },
          { key: 'province', label: 'Province', width: 100 },
          { key: 'status', label: 'Status', width: 140 },
        ];
      case 'local':
        return [
          { key: 'permitNumber', label: 'Permit No.', width: 130 },
          { key: 'permitHolder', label: 'Permit Holder', width: 180 },
          { key: 'classification', label: 'Classification', width: 120 },
          { key: 'type', label: 'Type', width: 120 },
          { key: 'commodity', label: 'Commodities', width: 140 },
          { key: 'area', label: 'Area (ha)', width: 90 },
          { key: 'municipality', label: 'Municipality', width: 120 },
          { key: 'province', label: 'Province', width: 100 },
          { key: 'status', label: 'Status', width: 120 },
        ];
      case 'hotspots':
        return [
          { key: 'permitNumber', label: 'Complaint No.', width: 140 },
          { key: 'permitHolder', label: 'Subject', width: 200 },
          { key: 'classification', label: 'Nature of Report', width: 150 },
          { key: 'commodity', label: 'Commodity', width: 140 },
          { key: 'municipality', label: 'Municipality', width: 120 },
          { key: 'province', label: 'Province', width: 100 },
          { key: 'status', label: 'Actions Taken', width: 160 },
        ];
      default:
        return [
          { key: 'permitNumber', label: 'Permit No.', width: 130 },
          { key: 'permitHolder', label: 'Permit Holder', width: 180 },
          { key: 'commodity', label: 'Commodity', width: 140 },
          { key: 'municipality', label: 'Municipality', width: 120 },
          { key: 'province', label: 'Province', width: 100 },
          { key: 'status', label: 'Status', width: 140 },
        ];
    }
  };

  const headers = getHeaders();

  const renderCell = (item, header) => {
    let cellValue = item[header.key];
    
    // Debug log for status field
    if (header.key === 'status') {
      console.log('Status cell value:', cellValue, 'for item:', item.permitNumber || item.id);
    }
    
    // Don't truncate status field, but truncate other long text
    if (typeof cellValue === 'string' && cellValue.length > 20 && header.key !== 'status') {
      cellValue = cellValue.substring(0, 17) + '...';
    }

    // Special handling for status field
    if (header.key === 'status') {
      const statusValue = cellValue || 'Unknown';
      
      // Determine status color
      let statusColor = '#999'; // Default gray for Unknown
      if (statusValue) {
        if (statusValue.toLowerCase().includes('operating') || 
            statusValue.toLowerCase().includes('approved')) {
          statusColor = '#4caf50'; // Green for active/operating
        } else if (statusValue.toLowerCase().includes('expired') || 
                   statusValue.toLowerCase().includes('denied')) {
          statusColor = '#f44336'; // Red for expired/denied
        } else if (statusValue.toLowerCase().includes('pending') || 
                   statusValue.toLowerCase().includes('evaluation')) {
          statusColor = '#ff9800'; // Orange for pending/under evaluation
        } else {
          statusColor = COLORS.primary; // Default to primary color
        }
      }
      
      return (
        <View key={header.key} style={[styles.cell, { width: header.width }]}>
          <Text style={[styles.cellText, { color: statusColor, fontWeight: '600' }]} numberOfLines={3}>
            {statusValue}
          </Text>
        </View>
      );
    }
    
    // Regular fields
    return (
      <View key={header.key} style={[styles.cell, { width: header.width }]}>
        <Text style={styles.cellText} numberOfLines={2}>
          {cellValue || '-'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            {headers.map((header) => (
              <View key={header.key} style={[styles.headerCell, { width: header.width }]}>
                <Text style={styles.headerText} numberOfLines={2}>
                  {header.label}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Data Rows */}
          {data.map((item, index) => (
            <TouchableOpacity
              key={item.id + index}
              style={[
                styles.dataRow,
                index % 2 === 0 ? styles.evenRow : styles.oddRow
              ]}
              onPress={() => onRowPress && onRowPress(item)}
            >
              {headers.map((header) => renderCell(item, header))}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    minHeight: 50,
  },
  headerCell: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
  },
  headerText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    minHeight: 45,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  evenRow: {
    backgroundColor: COLORS.white,
  },
  oddRow: {
    backgroundColor: COLORS.background,
  },
  cell: {
    padding: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  cellText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    textAlign: 'left',
    lineHeight: 14,
  },
});

export default DataTable;
