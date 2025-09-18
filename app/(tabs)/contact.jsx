import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

export default function Contact() {
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmitFeedback = () => {
    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Mock submission
    Alert.alert('Success', 'Thank you for your feedback! We will get back to you soon.');
    setFeedbackForm({ name: '', email: '', message: '' });
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (url) => {
    Linking.openURL(url);
  };

  const ContactCard = ({ icon, title, subtitle, onPress, actionIcon = "chevron-forward" }) => (
    <TouchableOpacity style={styles.contactCard} onPress={onPress}>
      <View style={styles.contactIconContainer}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name={actionIcon} size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const InfoCard = ({ title, children }) => (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contact</Text>
        <Text style={styles.headerSubtitle}>Get in touch with MGB CALABARZON</Text>
      </View>

      {/* Office Information */}
      <InfoCard title="Office Information">
        <ContactCard
          icon="business-outline"
          title="MGB CALABARZON Regional Office"
          subtitle="Mines and Geosciences Bureau"
          onPress={() => {}}
          actionIcon="information-circle-outline"
        />
        
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
          <View style={styles.addressText}>
            <Text style={styles.addressLine}>2nd Floor, DENR Building</Text>
            <Text style={styles.addressLine}>Brgy. Diezmo, Cabuyao City</Text>
            <Text style={styles.addressLine}>Laguna 4025, Philippines</Text>
          </View>
        </View>
      </InfoCard>

      {/* Contact Details */}
      <InfoCard title="Contact Details">
        <ContactCard
          icon="call-outline"
          title="Phone"
          subtitle="+63 (49) 834-4074"
          onPress={() => handleCall('+6349834407')}
          actionIcon="call"
        />
        
        <ContactCard
          icon="mail-outline"
          title="Email"
          subtitle="mgb4a@mgb.gov.ph"
          onPress={() => handleEmail('mgb4a@mgb.gov.ph')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="globe-outline"
          title="Website"
          subtitle="www.mgb.gov.ph"
          onPress={() => handleWebsite('https://www.mgb.gov.ph')}
          actionIcon="open-outline"
        />
      </InfoCard>

      {/* Office Hours */}
      <InfoCard title="Office Hours">
        <View style={styles.hoursContainer}>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Monday - Friday</Text>
            <Text style={styles.hoursTime}>8:00 AM - 5:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Saturday - Sunday</Text>
            <Text style={styles.hoursTime}>Closed</Text>
          </View>
          <View style={styles.hoursNote}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.hoursNoteText}>
              Lunch break: 12:00 PM - 1:00 PM
            </Text>
          </View>
        </View>
      </InfoCard>

      {/* Services */}
      <InfoCard title="Our Services">
        <View style={styles.servicesContainer}>
          <View style={styles.serviceItem}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
            <Text style={styles.serviceText}>Mining Permits & Applications</Text>
          </View>
          <View style={styles.serviceItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
            <Text style={styles.serviceText}>Environmental Compliance</Text>
          </View>
          <View style={styles.serviceItem}>
            <Ionicons name="search-outline" size={20} color={COLORS.primary} />
            <Text style={styles.serviceText}>Mining Investigations</Text>
          </View>
          <View style={styles.serviceItem}>
            <Ionicons name="library-outline" size={20} color={COLORS.primary} />
            <Text style={styles.serviceText}>Geological Surveys</Text>
          </View>
        </View>
      </InfoCard>

      {/* Contact Directory */}
      <InfoCard title="Contact Directory">
        <Text style={styles.contactDirectoryDescription}>
          Contact information for MGB offices and PMRB regional branches. Send messages directly to admin panel or email.
        </Text>
        
        <ContactCard
          icon="business-outline"
          title="MGB IV CALABARZON"
          subtitle="region4a@mgb.gov.ph"
          onPress={() => handleEmail('region4a@mgb.gov.ph')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="location-outline"
          title="PMRB Rizal"
          subtitle="pmrb.rizal95@gmail.com"
          onPress={() => handleEmail('pmrb.rizal95@gmail.com')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="location-outline"
          title="PMRB Cavite"
          subtitle="pmrbcavite@gmail.com"
          onPress={() => handleEmail('pmrbcavite@gmail.com')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="location-outline"
          title="PMRB Laguna"
          subtitle="pmrblaguna@gmail.com"
          onPress={() => handleEmail('pmrblaguna@gmail.com')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="location-outline"
          title="PMRB Quezon"
          subtitle="quezon.pmrb@gmail.com"
          onPress={() => handleEmail('quezon.pmrb@gmail.com')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="location-outline"
          title="PMRB Batangas"
          subtitle="miningsection_pgenro@yahoo.com"
          onPress={() => handleEmail('miningsection_pgenro@yahoo.com')}
          actionIcon="mail"
        />
      </InfoCard>

      {/* Emergency Contact */}
      <InfoCard title="Emergency Contact">
        <View style={styles.emergencyContainer}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning-outline" size={24} color="#FF5722" />
            <Text style={styles.emergencyTitle}>Report Mining Violations</Text>
          </View>
          <Text style={styles.emergencyDescription}>
            For urgent mining violations or environmental emergencies, contact us immediately:
          </Text>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => handleCall('09171234567')}
          >
            <Ionicons name="call" size={20} color={COLORS.white} />
            <Text style={styles.emergencyButtonText}>Emergency Hotline: 0917-123-4567</Text>
          </TouchableOpacity>
        </View>
      </InfoCard>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
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
  infoCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  addressText: {
    flex: 1,
  },
  addressLine: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  hoursContainer: {
    gap: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursDay: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  hoursTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  hoursNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  hoursNoteText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  servicesContainer: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  feedbackForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  emergencyContainer: {
    gap: 12,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  emergencyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emergencyButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
  contactDirectoryDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
});
