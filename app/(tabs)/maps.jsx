import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

// Mock mining site coordinates
const miningSites = [
  {
    id: 'QP-REG-004-C',
    permitHolder: 'Northern Essentials',
    commodity: 'Basalt',
    area: '4.9541',
    location: 'San Jose, Rodriguez, Rizal',
    coordinates: { latitude: 14.7203, longitude: 121.1327 },
    status: 'Active',
  },
  {
    id: 'QP-REG-006',
    permitHolder: 'Blue River Minerals',
    commodity: 'Basalt',
    area: '5.0000',
    location: 'San Jose, Rodriguez, Rizal',
    coordinates: { latitude: 14.7150, longitude: 121.1280 },
    status: 'Active',
  },
  {
    id: 'QP No. 002-C-2021',
    permitHolder: 'JB Construction Corporation',
    commodity: 'Quarry Materials',
    area: '4.3393',
    location: 'Brgy. Pinagbayanan II, Masinloc, Cavite',
    coordinates: { latitude: 14.3320, longitude: 120.7350 },
    status: 'Commercial Operation',
  },
  {
    id: 'QP No. 002-C-2022',
    permitHolder: 'ACG Quarrying Services',
    commodity: 'Filling Materials',
    area: '5',
    location: 'Brgy. Sapang I, Ternate, Cavite',
    coordinates: { latitude: 14.2890, longitude: 120.7120 },
    status: 'Commercial Operation',
  },
];

export default function Maps() {
  const [selectedSite, setSelectedSite] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleSitePress = (site) => {
    setSelectedSite(site);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return COLORS.primary;
      case 'Commercial Operation':
        return '#2196F3';
      case 'Under Investigation':
        return '#FF9800';
      default:
        return COLORS.textSecondary;
    }
  };

  const SiteDetailModal = () => (
    <Modal visible={showDetailModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mining Site Details</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {selectedSite && (
            <ScrollView style={styles.detailContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Site Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Permit No:</Text>
                  <Text style={styles.detailValue}>{selectedSite.id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Permit Holder:</Text>
                  <Text style={styles.detailValue}>{selectedSite.permitHolder}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Commodity:</Text>
                  <Text style={styles.detailValue}>{selectedSite.commodity}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Area:</Text>
                  <Text style={styles.detailValue}>{selectedSite.area} hectares</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>{selectedSite.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Coordinates:</Text>
                  <Text style={styles.detailValue}>
                    {selectedSite.coordinates.latitude.toFixed(4)}, {selectedSite.coordinates.longitude.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedSite.status) }]}>
                    <Text style={styles.statusText}>{selectedSite.status}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => Alert.alert('Directions', 'Opening directions in maps app (Coming Soon)')}
              >
                <Ionicons name="navigate-outline" size={20} color={COLORS.white} />
                <Text style={styles.directionsText}>Get Directions</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const SiteCard = ({ site }) => (
    <TouchableOpacity
      style={styles.siteCard}
      onPress={() => handleSitePress(site)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{site.permitHolder}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.status) }]}>
            <Text style={styles.statusText}>{site.status}</Text>
          </View>
        </View>
        <Ionicons name="location" size={20} color={COLORS.primary} />
      </View>
      
      <View style={styles.cardInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="document-text-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{site.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{site.commodity}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{site.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="resize-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{site.area} hectares</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Maps</Text>
        <Text style={styles.headerSubtitle}>Mining sites and locations</Text>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={80} color={COLORS.textSecondary} />
          <Text style={styles.mapPlaceholderTitle}>Interactive Map</Text>
          <Text style={styles.mapPlaceholderSubtitle}>
            Google Maps integration coming soon
          </Text>
          <Text style={styles.mapPlaceholderDescription}>
            Will display mining sites with interactive markers
          </Text>
        </View>
        
        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="layers-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="locate-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="filter-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sites List */}
      <View style={styles.sitesContainer}>
        <View style={styles.sitesHeader}>
          <Text style={styles.sitesTitle}>Mining Sites ({miningSites.length})</Text>
          <TouchableOpacity style={styles.listViewButton}>
            <Ionicons name="list-outline" size={20} color={COLORS.primary} />
            <Text style={styles.listViewText}>List View</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.sitesList}
          showsVerticalScrollIndicator={false}
        >
          {miningSites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Active</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>Commercial</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Under Review</Text>
          </View>
        </View>
      </View>

      {/* Site Detail Modal */}
      <SiteDetailModal />
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
  mapContainer: {
    height: 250,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  mapPlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  mapPlaceholderSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  mapPlaceholderDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mapControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sitesContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sitesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sitesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  listViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listViewText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sitesList: {
    flex: 1,
  },
  siteCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  legend: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
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
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  directionsText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
});
