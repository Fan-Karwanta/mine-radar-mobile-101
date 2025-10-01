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
        <View style={styles.officeNameContainer}>
          <Ionicons name="business" size={24} color={COLORS.primary} />
          <Text style={styles.officeName}>
            Mines and Geosciences Bureau Regional Office No. IV CALABARZON
          </Text>
        </View>
        
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={20} color={COLORS.textSecondary} />
          <View style={styles.addressText}>
            <Text style={styles.addressLine}>2nd floor Puregold Jr. Bldg., 11 National Road,</Text>
            <Text style={styles.addressLine}>Brgy Parian, Calamba City,</Text>
            <Text style={styles.addressLine}>Laguna Province</Text>
          </View>
        </View>
      </InfoCard>

      {/* Contact Details */}
      <InfoCard title="Contact Details">
        <ContactCard
          icon="call-outline"
          title="Phone"
          subtitle="(049) 542-4421"
          onPress={() => handleCall('0495424421')}
          actionIcon="call"
        />
        
        <ContactCard
          icon="mail-outline"
          title="Email"
          subtitle="region4a@mgb.gov.ph"
          onPress={() => handleEmail('region4a@mgb.gov.ph')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="globe-outline"
          title="Website"
          subtitle="https://region4a.mgb.gov.ph"
          onPress={() => handleWebsite('https://region4a.mgb.gov.ph')}
          actionIcon="open-outline"
        />

        <ContactCard
          icon="logo-facebook"
          title="Facebook"
          subtitle="MGB CALABARZON"
          onPress={() => handleWebsite('https://www.facebook.com/mgbcalabarzon')}
          actionIcon="open-outline"
        />
      </InfoCard>

      {/* Provincial Mining Regulatory Boards */}
      <InfoCard title="Provincial Mining Regulatory Boards">
        <Text style={styles.contactDirectoryDescription}>
          Contact information for Provincial Mining Regulatory Boards in CALABARZON region.
        </Text>
        
        <ContactCard
          icon="mail-outline"
          title="PMRB Rizal"
          subtitle="pmrb.rizal95@gmail.com"
          onPress={() => handleEmail('pmrb.rizal95@gmail.com')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="mail-outline"
          title="PMRB Cavite"
          subtitle="pmrbcavite@gmail.com"
          onPress={() => handleEmail('pmrbcavite@gmail.com')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="mail-outline"
          title="PMRB Laguna"
          subtitle="pmrblaguna@gmail.com"
          onPress={() => handleEmail('pmrblaguna@gmail.com')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="mail-outline"
          title="PMRB Quezon"
          subtitle="quezon.pmrb@gmail.com"
          onPress={() => handleEmail('quezon.pmrb@gmail.com')}
          actionIcon="mail"
        />
        
        <ContactCard
          icon="mail-outline"
          title="PMRB Batangas"
          subtitle="miningsection_pgenro@yahoo.com"
          onPress={() => handleEmail('miningsection_pgenro@yahoo.com')}
          actionIcon="mail"
        />
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
  officeNameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  officeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 22,
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
