import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import reportService from '../../services/reportService';
import locationService from '../../services/locationService';
import imageService from '../../services/imageService';
import asyncStorageDraftService from '../../services/asyncStorageDraftService';

// Translation object for Illegal Mining
const illegalMiningTranslations = {
  english: {
    gpsLocation: 'GPS Location:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Get Coordinates from Google Maps',
    location: 'Location:',
    locationPlaceholder: 'Sitio/Barangay/Municipality/City/Province',
    date: 'Date Observed:',
    time: 'Time Observed:',
    usePhoneDateTime: "Use phone's time and date",
    projectBoard: 'Is there a Project Information Board on Site? (check one box)',
    noSignboard: 'No signboard observed',
    notDetermined: 'Not determined',
    projectName: 'If yes, please indicate the name of the project:',
    commodity: 'Commodity:',
    commodityPlaceholder: 'Sand and Gravel/Filling Materials/Construction Aggregates/Rocks/Sand/Boulders/Base Course/Common Soil/Limestone/Silica/Others',
    siteStatus: 'Site Status during Verification:',
    operating: 'Operating',
    nonOperating: 'Non-operating',
    activitiesObserved: 'Activities observed in the area: (check all that apply)',
    extraction: 'Extraction',
    extractionEquipment: 'Backhoe/Mini Backhoe/Excavator/Shovel/Front-end Loader/',
    disposition: 'Disposition/Transportation',
    dispositionEquipment: 'Dump truck/Mini dump truck/Jeep/others',
    processing: 'Mineral Processing',
    processingEquipment: 'Crushing Plant/Mobile Crusher/Sand Washing',
    operatorName: 'Name of Operator/s:',
    operatorAddress: 'Address of Operator/s:',
    operatorDetermination: 'How did you determine the operator/s in the area?',
    observations: 'Observations in the area: (check all that apply)',
    excavations: 'Excavations',
    accessRoad: 'Access road for transport',
    processingFacility: 'Mineral Processing Facility',
    interviewNote: 'If no ongoing activities were seen during the verification, interview with residents or barangay officials are necessary to gather indicative information about the operation in the area. Guide questions are provided below.',
    conductedInterview: 'Conducted interview?',
    yes: 'Yes',
    no: 'No',
    guideQuestions: 'Guide Questions',
    question1: '1. Has there been any recent activity in the excavated area? If yes, when was the most recent?',
    question2: '2. When did the excavation start, and how often does it take place?',
    question3: '3. Are dump trucks or other vehicles transporting excavated minerals from the site?',
    question4: '4. Do you know the name of the person, company, or group operating in the area? If yes, list the name/s.',
    question5: '5. Is the address of the operator known or identified? If yes, list the address.',
    question6: '6. Were any permits or official documents presented by the operator?',
    answerHere: 'Answer here',
    additionalInfo: 'Additional Information:',
    attachPhotos: 'Attach photo/s (Preferably geotagged)',
    uploadGallery: 'Upload image from gallery',
    useCamera: 'Use phone camera',
    certificationTitle: 'Certification Statement:',
    certificationText1: 'By submitting this report, I certify that the information contained herein is true, complete, and accurate to the best of my knowledge. I affirm that the observations, interviews, and documentation reflected in this report were conducted in good faith and without bias.',
    certificationText2: 'I understand that this report will be used for official verification, possible legal action, and agency decision-making. I also acknowledge my responsibility to uphold the integrity and objectivity expected of my role as a Deputy Environment and Natural Resources Officer.',
    submitButton: 'Submit to MGB CALABARZON'
  },
  filipino: {
    gpsLocation: 'Lokasyon ng GPS:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Kunin ang coordinates mula sa Google Maps',
    location: 'Lokasyon:',
    locationPlaceholder: 'Sitio/Barangay/Municipality/City/Province',
    date: 'Petsang Naobserbahan:',
    time: 'Oras na Naobserbahan:',
    usePhoneDateTime: 'Gamitin ang oras at petsa ng telepono',
    projectBoard: 'May Project Information Board ba sa Lugar?',
    noSignboard: 'Walang nakita na karatula',
    notDetermined: 'Hindi matukoy',
    projectName: 'Kung mayroon, ilagay ang pangalan ng proyekto:',
    commodity: 'Uri ng mineral na minimina:',
    commodityPlaceholder: 'Sand and Gravel/Filling Materials/Construction Aggregates/Rocks/Sand/Boulders/Base Course/Common Soil/Limestone/Silica/Others',
    siteStatus: 'Kalagayan ng lugar sa oras ng pagbisita:',
    operating: 'May operasyon',
    nonOperating: 'Walang operasyon',
    activitiesObserved: 'Mga Aktibidad na Naobserbahan (piliin lahat ng naaangkop):',
    extraction: 'Pagbubungkal o Paghuhukay',
    extractionEquipment: 'Backhoe/Mini Backhoe/Excavator/Shovel/Front-end Loader/Others',
    disposition: 'Ibinabyahe ang nahukay na mineral',
    dispositionEquipment: 'Dump truck/Mini dump truck/Jeep/others',
    processing: 'Pag proseso ng mga mineral',
    processingEquipment: 'Crushing Plant/Mobile Crusher/Sand Washing',
    operatorName: 'Pangalan ng Operator:',
    operatorAddress: 'Address ng Operator:',
    operatorDetermination: 'Paano mo natukoy kung sino ang operator?',
    observations: 'Mga Naobserbahang Kalagayan sa Lugar:',
    excavations: 'Bagong hukay na palatandaan ng pagmimina',
    accessRoad: 'Daanan ng mga Dump Truck',
    processingFacility: 'Pasilidad para sa pag proseso ng mga mineral',
    interviewNote: 'Kung walang nakitang aktibong operasyon sa panahon ng beripikasyon, kinakailangang magsagawa ng panayam sa mga residente o opisyal ng barangay upang makakalap ng mga palatandaan ukol sa posibleng operasyon sa lugar. Narito ang mga gabay na tanong na maaaring gamitin sa panayam.',
    conductedInterview: 'Panayam sa Komunidad?',
    yes: 'Isinagawa ang panayam',
    no: 'Hindi isinagawa ang panayam',
    guideQuestions: 'Mga tanong na maaaring itanong sa mga residente o opisyal ng barangay',
    question1: '1. Mayroon bang kamakailang aktibidad sa hinukay na lugar?',
    question2: '2. Kailan nagsimula ang paghuhukay, at gaano ito kadalas ginagawa?',
    question3: '3. May mga trak o iba pang sasakyan bang kumukuha ng mineral mula sa lugar?',
    question4: '4. Alam ba ninyo ang pangalan ng tao, kumpanya, o grupo na nagpapatakbo sa lugar?',
    question5: '5. Kilala o natukoy ba ang address ng operator?',
    question6: '6. May naipakitang mga permit o opisyal na dokumento ang operator?',
    answerHere: 'Answer here',
    additionalInfo: 'Karagdagang Impormasyon:',
    attachPhotos: 'Ilakip ang larawan (Mas Maganda kung geo-tagged):',
    uploadGallery: 'Mag-upload mula sa gallery',
    useCamera: 'Gumamit ng camera ng cellphone',
    certificationTitle: 'Pahayag ng Sertipikasyon:',
    certificationText1: 'Sa pagsusumite ng ulat na ito, aking pinatototohanan na ang lahat ng impormasyong nakapaloob dito ay totoo, kumpleto, at tumpak ayon sa aking kaalaman. Pinagtitibay ko na ang mga obserbasyon, panayam, at dokumentasyong nakasaad sa ulat na ito ay isinagawa nang tapat at walang kinikilingan.',
    certificationText2: 'Nauunawaan ko na ang ulat na ito ay maaaring gamitin sa opisyal na beripikasyon, posibleng legal na hakbang, at sa paggawa ng desisyon ng ahensya. Tinatanggap ko rin ang aking pananagutan na panatilihin ang integridad at pagiging obhetibo na inaasahan sa aking tungkulin bilang isang Deputy Environment and Natural Resources Officer.',
    submitButton: 'Isumite sa MGB CALABARZON'
  }
};

// Translation object for Illegal Mineral Transportation
const illegalTransportTranslations = {
  english: {
    gpsLocation: 'GPS Location:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Get Coordinates from Google Maps',
    location: 'Location:',
    locationPlaceholder: 'Insert Sitio, Barangay, Municipality/City, Province',
    date: 'Date Observed:',
    time: 'Time Observed:',
    usePhoneDateTime: "Use phone's time and date",
    violationType: 'Type of Violation? (check one box)',
    absenceDocuments: 'Absence or failure to carry transport documents',
    outdatedDocuments: 'Use of outdated transport document:',
    fraudulentDocuments: 'Use of fraudulent transport document:',
    documentTypes: 'OTP/DR/OTC/MOEP',
    commodity: 'Commodity:',
    commodityPlaceholder: 'Sand and Gravel/Filling Materials/Construction Aggregates/Rocks/Sand/Boulders/Base Course/Common Soil/Limestone/Silica/Others',
    volumeWeight: 'Volume/Weight of Materials:',
    unit: 'Unit:',
    unitPlaceholder: 'Cubic Meters/Metric Tons/Sacks/Others',
    vehicleType: 'Type of Vehicle:',
    vehicleTypePlaceholder: 'Dump Truck/Mini Dump Truck/Jeepney/Tricycle/Others',
    vehicleDescription: 'Description of Vehicle:',
    vehicleBodyColor: 'Vehicle Body Color',
    plateNumber: 'Plate Number:',
    ownerOperator: 'Owner/Operator:',
    ownerAddress: 'Address of Owner/Operator:',
    driver: 'Driver:',
    driverAddress: 'Address of Driver:',
    sourceOfMaterials: 'Source of Materials:',
    actionsTaken: 'Action/s Taken:',
    additionalInfo: 'Additional Information:',
    attachPhotos: 'Attach photo/s (Preferably geotagged)',
    uploadGallery: 'Upload image from gallery',
    useCamera: 'Use phone camera',
    certificationTitle: 'Certification Statement:',
    certificationText1: 'By submitting this report, I certify that the information contained herein is true, complete, and accurate to the best of my knowledge. I affirm that the observations, interviews, and documentation reflected in this report were conducted in good faith and without bias.',
    certificationText2: 'I understand that this report will be used for official verification, possible legal action, and agency decision-making. I also acknowledge my responsibility to uphold the integrity and objectivity expected of my role as a Deputy Environment and Natural Resources Officer.',
    submitButton: 'Submit to MGB CALABARZON'
  },
  filipino: {
    gpsLocation: 'Lokasyon ng GPS:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Kunin ang coordinates mula sa Google Maps',
    location: 'Lokasyon:',
    locationPlaceholder: 'Ilagay ang Sitio, Barangay, Municipality/City, Province',
    date: 'Petsang Naobserbahan:',
    time: 'Oras na Naobserbahan:',
    usePhoneDateTime: 'Gamitin ang oras at petsa ng telepono',
    violationType: 'Uri ng Paglabag? (piliin isa)',
    absenceDocuments: 'Kawalan o pagkakapalyang magdala ng transport documents',
    outdatedDocuments: 'Paggamit ng luma na transport document:',
    fraudulentDocuments: 'Paggamit ng pekeng transport document:',
    documentTypes: 'OTP/DR/OTC/MOEP',
    commodity: 'Uri ng mineral:',
    commodityPlaceholder: 'Sand and Gravel/Filling Materials/Construction Aggregates/Rocks/Sand/Boulders/Base Course/Common Soil/Limestone/Silica/Others',
    volumeWeight: 'Dami/Timbang ng mga Materyales:',
    unit: 'Unit:',
    unitPlaceholder: 'Cubic Meters/Metric Tons/Sacks/Others',
    vehicleType: 'Uri ng Sasakyan:',
    vehicleTypePlaceholder: 'Dump Truck/Mini Dump Truck/Jeepney/Tricycle/Others',
    vehicleDescription: 'Paglalarawan ng Sasakyan:',
    vehicleBodyColor: 'Kulay ng Sasakyan',
    plateNumber: 'Plate Number:',
    ownerOperator: 'May-ari/Operator:',
    ownerAddress: 'Address ng May-ari/Operator:',
    driver: 'Driver:',
    driverAddress: 'Address ng Driver:',
    sourceOfMaterials: 'Pinagkunan ng mga Materyales:',
    actionsTaken: 'Mga Hakbang na Ginawa:',
    additionalInfo: 'Karagdagang Impormasyon:',
    attachPhotos: 'Ilakip ang larawan (Mas Maganda kung geo-tagged):',
    uploadGallery: 'Mag-upload mula sa gallery',
    useCamera: 'Gumamit ng camera ng cellphone',
    certificationTitle: 'Pahayag ng Sertipikasyon:',
    certificationText1: 'Sa pagsusumite ng ulat na ito, aking pinatototohanan na ang lahat ng impormasyong nakapaloob dito ay totoo, kumpleto, at tumpak ayon sa aking kaalaman. Pinagtitibay ko na ang mga obserbasyon, panayam, at dokumentasyong nakasaad sa ulat na ito ay isinagawa nang tapat at walang kinikilingan.',
    certificationText2: 'Nauunawaan ko na ang ulat na ito ay maaaring gamitin sa opisyal na beripikasyon, posibleng legal na hakbang, at sa paggawa ng desisyon ng ahensya. Tinatanggap ko rin ang aking pananagutan na panatilihin ang integridad at pagiging obhetibo na inaasahan sa aking tungkulin bilang isang Deputy Environment and Natural Resources Officer.',
    submitButton: 'Isumite sa MGB CALABARZON'
  }
};

// Translation object for Illegal Mineral Processing
const illegalProcessingTranslations = {
  english: {
    gpsLocation: 'GPS Location:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Get Coordinates from Google Maps',
    location: 'Location:',
    locationPlaceholder: 'Insert Sitio, Barangay, Municipality/City, Province',
    date: 'Date Observed:',
    time: 'Time Observed:',
    usePhoneDateTime: "Use phone's time and date",
    projectBoard: 'Is there a Project Information Board on Site?',
    noSignboard: 'No signboard observed',
    notDetermined: 'Not determined',
    projectName: 'If yes, please indicate the name of the project:',
    siteStatus: 'Site Status during Verification:',
    operating: 'Operating',
    nonOperating: 'Non-operating',
    underConstruction: 'Under construction',
    facilityType: 'Type of Mineral Processing Facility:',
    facilityTypePlaceholder: 'Crushing Plant/Milling Plant/Leaching Plant/Milling and Leaching Plant/Mobile Crusher/Sand Washing/Limestone Washing/Others',
    processingProducts: 'Mineral Processing Products:',
    processingProductsPlaceholder: 'Construction Aggregates/Washed Sand/Washed Limestone/Ground Ore/Gold/Others',
    operatorName: 'Name of Operator/s:',
    operatorAddress: 'Address of Operator/s:',
    operatorDetermination: 'How did you determine the operator/s in the area?',
    rawMaterialsName: 'Name of the source of raw materials:',
    rawMaterialsLocation: 'Location of the source of raw materials:',
    rawMaterialsDetermination: 'How did you determine the source of raw materials?',
    additionalInfo: 'Additional Information:',
    attachPhotos: 'Attach photo/s (Preferably geotagged)',
    uploadGallery: 'Upload image from gallery',
    useCamera: 'Use phone camera',
    certificationTitle: 'Certification Statement:',
    certificationText1: 'By submitting this report, I certify that the information contained herein is true, complete, and accurate to the best of my knowledge. I affirm that the observations, interviews, and documentation reflected in this report were conducted in good faith and without bias.',
    certificationText2: 'I understand that this report will be used for official verification, possible legal action, and agency decision-making. I also acknowledge my responsibility to uphold the integrity and objectivity expected of my role as a Deputy Environment and Natural Resources Officer.',
    submitButton: 'Submit to MGB CALABARZON'
  },
  filipino: {
    gpsLocation: 'Lokasyon ng GPS:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Kunin ang coordinates mula sa Google Maps',
    location: 'Lokasyon:',
    locationPlaceholder: 'Ilagay ang Sitio, Barangay, Municipality/City, Province',
    date: 'Petsang Naobserbahan:',
    time: 'Oras na Naobserbahan:',
    usePhoneDateTime: 'Gamitin ang oras at petsa ng telepono',
    projectBoard: 'May Project Information Board ba sa Lugar?',
    noSignboard: 'Walang nakita na karatula',
    notDetermined: 'Hindi matukoy',
    projectName: 'Kung mayroon, ilagay ang pangalan ng proyekto:',
    siteStatus: 'Kalagayan ng lugar sa oras ng pagbisita:',
    operating: 'May operasyon',
    nonOperating: 'Walang operasyon',
    underConstruction: 'Ginagawa pa',
    facilityType: 'Uri ng Mineral Processing Facility:',
    facilityTypePlaceholder: 'Crushing Plant/Milling Plant/Leaching Plant/Milling and Leaching Plant/Mobile Crusher/Sand Washing/Limestone Washing/Others',
    processingProducts: 'Mga Produkto ng Mineral Processing:',
    processingProductsPlaceholder: 'Construction Aggregates/Washed Sand/Washed Limestone/Ground Ore/Gold/Others',
    operatorName: 'Pangalan ng Operator:',
    operatorAddress: 'Address ng Operator:',
    operatorDetermination: 'Paano mo natukoy kung sino ang operator?',
    rawMaterialsName: 'Pangalan ng pinagkunan ng raw materials:',
    rawMaterialsLocation: 'Lokasyon ng pinagkunan ng raw materials:',
    rawMaterialsDetermination: 'Paano mo natukoy ang pinagkunan ng raw materials?',
    additionalInfo: 'Karagdagang Impormasyon:',
    attachPhotos: 'Ilakip ang larawan (Mas Maganda kung geo-tagged):',
    uploadGallery: 'Mag-upload mula sa gallery',
    useCamera: 'Gumamit ng camera ng cellphone',
    certificationTitle: 'Pahayag ng Sertipikasyon:',
    certificationText1: 'Sa pagsusumite ng ulat na ito, aking pinatototohanan na ang lahat ng impormasyong nakapaloob dito ay totoo, kumpleto, at tumpak ayon sa aking kaalaman. Pinagtitibay ko na ang mga obserbasyon, panayam, at dokumentasyong nakasaad sa ulat na ito ay isinagawa nang tapat at walang kinikilingan.',
    certificationText2: 'Nauunawaan ko na ang ulat na ito ay maaaring gamitin sa opisyal na beripikasyon, posibleng legal na hakbang, at sa paggawa ng desisyon ng ahensya. Tinatanggap ko rin ang aking pananagutan na panatilihin ang integridad at pagiging obhetibo na inaasahan sa aking tungkulin bilang isang Deputy Environment and Natural Resources Officer.',
    submitButton: 'Isumite sa MGB CALABARZON'
  }
};

// Translation object for Illegal Mineral Trading
const illegalTradingTranslations = {
  english: {
    gpsLocation: 'GPS Location:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Get Coordinates from Google Maps',
    location: 'Location:',
    locationPlaceholder: 'Sitio/Barangay/Municipality/City/Province',
    date: 'Date Observed:',
    time: 'Time Observed:',
    usePhoneDateTime: 'Use phones time and date',
    violationType: 'Type of Violation:',
    tradingViolation: 'Trading of mineral products without valid permit',
    businessName: 'Name of the business:',
    businessOwner: 'Name of the owner of the business:',
    businessLocation: 'Location of the business:',
    commodity: 'Commodity:',
    commodityPlaceholder: 'Sand, gravel, limestone, etc.',
    sourceOfCommodityName: 'Name of the source of commodity:',
    sourceOfCommodityLocation: 'Location of the source of commodity:',
    sourceOfCommodityDetermination: 'How did you determine the source of commodity?',
    stockpiledMaterials: 'Are there stockpiled materials in area?',
    dtiRegistration: 'Is the business registered with DTI?',
    yes: 'Yes',
    no: 'No',
    none: 'None',
    notDetermined: 'Not determined',
    additionalInfo: 'Additional Information:',
    attachPhotos: 'Attach photo/s (Preferably geotagged)',
    uploadGallery: 'Upload image from gallery',
    useCamera: 'Use phone camera',
    certificationTitle: 'Certification Statement:',
    certificationText1: 'By submitting this report, I certify that the information contained herein is true, complete, and accurate to the best of my knowledge. I affirm that the observations, interviews, and documentation reflected in this report were conducted in good faith and without bias.',
    certificationText2: 'I understand that this report will be used for official verification, possible legal action, and agency decision-making. I also acknowledge my responsibility to uphold the integrity and objectivity expected of my role as a Deputy Environment and Natural Resources Officer.',
    submitButton: 'Submit to MGB CALABARZON'
  },
  filipino: {
    gpsLocation: 'Lokasyon ng GPS:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Kunin ang Coordinates mula sa Google Maps',
    location: 'Lokasyon:',
    locationPlaceholder: 'Sitio/Barangay/Municipality/City/Province',
    date: 'Petsang Naobserbahan:',
    time: 'Oras na Naobserbahan:',
    usePhoneDateTime: 'Gamitin ang oras at petsa ng telepono',
    violationType: 'Uri ng Paglabag:',
    tradingViolation: 'Pagbebenta ng mineral products na walang valid permit',
    businessName: 'Pangalan ng negosyo:',
    businessOwner: 'Pangalan ng may-ari ng negosyo:',
    businessLocation: 'Lokasyon ng negosyo:',
    commodity: 'Commodity:',
    commodityPlaceholder: 'Buhangin, graba, limestone, atbp.',
    sourceOfCommodityName: 'Pangalan ng pinagkunan ng commodity:',
    sourceOfCommodityLocation: 'Lokasyon ng pinagkunan ng commodity:',
    sourceOfCommodityDetermination: 'Paano mo natukoy ang pinagkunan ng commodity?',
    stockpiledMaterials: 'May nakaimbak na mga materyales sa lugar?',
    dtiRegistration: 'Nakarehistro ba ang negosyo sa DTI?',
    yes: 'Oo',
    no: 'Hindi',
    none: 'Wala',
    notDetermined: 'Hindi natukoy',
    additionalInfo: 'Karagdagang Impormasyon:',
    attachPhotos: 'Mag-attach ng larawan (Mas mainam kung may geotagged)',
    uploadGallery: 'Mag-upload ng larawan mula sa gallery',
    useCamera: 'Gamitin ang camera ng telepono',
    certificationTitle: 'Certification Statement:',
    certificationText1: 'Sa pamamagitan ng pagsusumite ng ulat na ito, pinatutunayan ko na ang impormasyong narito ay totoo, kumpleto, at tumpak ayon sa aking kaalaman. Pinapatunayan ko na ang mga obserbasyon, panayam, at dokumentasyon na makikita sa ulat na ito ay ginawa nang may mabuting hangarin at walang pagkiling.',
    certificationText2: 'Nauunawaan ko na ang ulat na ito ay gagamitin para sa opisyal na pag-verify, posibleng legal action, at pagpapasya ng ahensya. Kinikilala ko rin ang aking responsibilidad na panatilihin ang integridad at layuning inaasahan sa aking tungkulin bilang Deputy Environment and Natural Resources Officer.',
    submitButton: 'Isumite sa MGB CALABARZON'
  }
};

// Translation objects for Illegal Exploration
const illegalExplorationTranslations = {
    english: {
      gpsLocation: 'GPS Location:',
      latitude: 'Latitude:',
      longitude: 'Longitude:',
      getCoordinates: 'Get Coordinates from Google Maps',
      location: 'Location:',
      locationPlaceholder: 'Sitio/Barangay/Municipality/City/Province',
      date: 'Date Observed:',
      time: 'Time Observed:',
      usePhoneDateTime: 'Use phones time and date',
      projectInfoBoard: 'Is there a Project Information Board on Site? (check one box)',
      noSignboard: 'No signboard observed',
      notDetermined: 'Not determined',
      projectName: 'If yes, please indicate the name of the project:',
      activitiesObserved: 'Activities observed in the area: (check all that apply)',
      drilling: 'Drilling',
      testPitting: 'Test Pitting',
      trenching: 'Trenching',
      shaftSinking: 'Shaft Sinking',
      tunneling: 'Tunneling',
      others: 'Others:',
      operatorName: 'Name of Operator/s:',
      operatorAddress: 'Address of Operator/s:',
      operatorDetermination: 'How did you determine the operator/s in the area?',
      additionalInfo: 'Additional Information:',
      attachPhotos: 'Attach photo/s (Preferably geotagged)',
      uploadGallery: 'Upload image from gallery',
      useCamera: 'Use phone camera',
      certificationTitle: 'Certification Statement:',
      certificationText1: 'By submitting this report, I certify that the information contained herein is true, complete, and accurate to the best of my knowledge. I affirm that the observations, interviews, and documentation reflected in this report were conducted in good faith and without bias.',
      certificationText2: 'I understand that this report will be used for official verification, possible legal action, and agency decision-making. I also acknowledge my responsibility to uphold the integrity and objectivity expected of my role as a Deputy Environment and Natural Resources Officer.',
      submitButton: 'Submit to MGB CALABARZON'
    },
    filipino: {
      gpsLocation: 'Lokasyon ng GPS:',
      latitude: 'Latitude:',
      longitude: 'Longitude:',
      getCoordinates: 'Kunin ang Coordinates mula sa Google Maps',
      location: 'Lokasyon:',
      locationPlaceholder: 'Sitio/Barangay/Municipality/City/Province',
      date: 'Petsang Naobserbahan:',
      time: 'Oras na Naobserbahan:',
      usePhoneDateTime: 'Gamitin ang oras at petsa ng telepono',
      projectInfoBoard: 'May Project Information Board ba sa Site? (piliin ang isa)',
      noSignboard: 'Walang signboard na nakita',
      notDetermined: 'Hindi natukoy',
      projectName: 'Kung oo, pakitukoy ang pangalan ng proyekto:',
      activitiesObserved: 'Mga aktibidad na nakita sa lugar: (piliin lahat ng naaangkop)',
      drilling: 'Drilling',
      testPitting: 'Test Pitting',
      trenching: 'Trenching',
      shaftSinking: 'Shaft Sinking',
      tunneling: 'Tunneling',
      others: 'Iba pa:',
      operatorName: 'Pangalan ng Operator/s:',
      operatorAddress: 'Address ng Operator/s:',
      operatorDetermination: 'Paano mo natukoy ang operator/s sa lugar?',
      additionalInfo: 'Karagdagang Impormasyon:',
      attachPhotos: 'Mag-attach ng larawan (Mas mainam kung may geotagged)',
      uploadGallery: 'Mag-upload ng larawan mula sa gallery',
      useCamera: 'Gamitin ang camera ng telepono',
      certificationTitle: 'Certification Statement:',
      certificationText1: 'Sa pamamagitan ng pagsusumite ng ulat na ito, pinatutunayan ko na ang impormasyong narito ay totoo, kumpleto, at tumpak ayon sa aking kaalaman. Pinapatunayan ko na ang mga obserbasyon, panayam, at dokumentasyon na makikita sa ulat na ito ay ginawa nang may mabuting hangarin at walang pagkiling.',
      certificationText2: 'Nauunawaan ko na ang ulat na ito ay gagamitin para sa opisyal na pag-verify, posibleng legal action, at pagpapasya ng ahensya. Kinikilala ko rin ang aking responsibilidad na panatilihin ang integridad at layuning inaasahan sa aking tungkulin bilang Deputy Environment and Natural Resources Officer.',
      submitButton: 'Isumite sa MGB CALABARZON'
    }
};

// Translation objects for Illegal Small-Scale Mining of Gold
const illegalSmallScaleMiningTranslations = {
  english: {
    gpsLocation: 'GPS Location:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Get Coordinates from Google Maps',
    location: 'Location:',
    locationPlaceholder: 'Sitio/Barangay/Municipality/City/Province',
    date: 'Date:',
    time: 'Time:',
    usePhoneDateTime: 'Use phones time and date',
    projectInfoBoard: 'Is there a Project Information Board on Site? (check one box)',
    noSignboard: 'No signboard observed',
    notDetermined: 'Not determined',
    projectName: 'If yes, please indicate the name of the project:',
    commodity: 'Commodity:',
    commodityPlaceholder: 'Sand and gravel/Filling materials/Aggregates/Rocks',
    siteStatus: 'Site Status during Verification:',
    operating: 'Operating',
    nonOperating: 'Non-operating',
    activitiesObserved: 'Activities observed in the area: (check all that apply)',
    equipmentUsed: 'Equipment used',
    extraction: 'Extraction',
    extractionEquipment: 'Shovel/Others',
    disposition: 'Disposition/Transportation',
    dispositionEquipment: 'Dump truck/Mini dump truck/Jeep/Others',
    mineralProcessing: 'Mineral Processing',
    processingEquipment: 'Rod Mill/Ball Mill',
    tunneling: 'Tunneling',
    shaftSinking: 'Shaft sinking',
    goldPanning: 'Gold Panning',
    amalgamation: 'Amalgamation (Use of Mercury)',
    others: 'Others',
    operatorName: 'Name of Operator/s:',
    operatorAddress: 'Address of Operator/s:',
    operatorDetermination: 'How did you determine the operator/s in the area?',
    operatorDeterminationPlaceholder: 'Interview with workers/residents/Brgy. Officials (Juan De La Cruz, Brgy. Captain)',
    observations: 'Observations in the area: (check all that apply)',
    excavations: 'Excavations',
    stockpiles: 'Stockpiles',
    tunnels: 'Tunnels',
    mineShafts: 'Mine Shafts',
    accessRoad: 'Access road for transport',
    processingFacility: 'Mineral Processing Facility',
    interviewNote: 'If no ongoing activities were seen during the verification, interview with residents or barangay officials are necessary to gather indicative information about the operation in the area. Guide questions are provided below.',
    interviewConducted: 'Conducted interview?',
    yes: 'Yes',
    no: 'No',
    guideQuestions: 'Guide Questions',
    question1: 'Has there been any recent activity in the area? If yes, when was the most recent?',
    question2: 'When did the extraction start, and how often does it take place?',
    question3: 'Are dump trucks or other vehicles transporting excavated minerals from the site?',
    question4: 'Do you know the name of the person, company, or group operating in the area? If yes, list the name/s.',
    question5: 'Is the address of the operator known or identified? If yes, list the address.',
    question6: 'Were any permits or official documents presented by the operator?',
    answerPlaceholder: 'Answer here',
    additionalInfo: 'Additional Information:',
    attachPhotos: 'Attach photo/s (Preferably geotagged)',
    uploadGallery: 'Upload image from gallery',
    useCamera: 'Use phone camera',
    certificationTitle: 'Certification Statement:',
    certificationText1: 'By submitting this report, I certify that the information contained herein is true, complete, and accurate to the best of my knowledge. I affirm that the observations, interviews, and documentation reflected in this report were conducted in good faith and without bias.',
    certificationText2: 'I understand that this report will be used for official verification, possible legal action, and agency decision-making. I also acknowledge my responsibility to uphold the integrity and objectivity expected of my role as a Deputy Environment and Natural Resources Officer.',
    submitButton: 'Submit to MGB CALABARZON'
  },
  filipino: {
    gpsLocation: 'Lokasyon ng GPS:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Kunin ang Coordinates mula sa Google Maps',
    location: 'Lokasyon:',
    locationPlaceholder: 'Sitio/Barangay/Municipality/City/Province',
    date: 'Petsa:',
    time: 'Oras:',
    usePhoneDateTime: 'Gamitin ang oras at petsa ng telepono',
    projectInfoBoard: 'May Project Information Board ba sa Site? (piliin ang isa)',
    noSignboard: 'Walang signboard na nakita',
    notDetermined: 'Hindi natukoy',
    projectName: 'Kung oo, pakitukoy ang pangalan ng proyekto:',
    commodity: 'Commodity:',
    commodityPlaceholder: 'Buhangin at graba/Filling materials/Aggregates/Bato',
    siteStatus: 'Status ng Site sa panahon ng Verification:',
    operating: 'Gumagana',
    nonOperating: 'Hindi gumagana',
    activitiesObserved: 'Mga aktibidad na nakita sa lugar: (piliin lahat ng naaangkop)',
    equipmentUsed: 'Kagamitang ginamit',
    extraction: 'Pagkuha',
    extractionEquipment: 'Pala/Iba pa',
    disposition: 'Disposition/Transportasyon',
    dispositionEquipment: 'Dump truck/Mini dump truck/Jeep/Iba pa',
    mineralProcessing: 'Pagpoproseso ng Mineral',
    processingEquipment: 'Rod Mill/Ball Mill',
    tunneling: 'Tunneling',
    shaftSinking: 'Shaft sinking',
    goldPanning: 'Gold Panning',
    amalgamation: 'Amalgamation (Paggamit ng Mercury)',
    others: 'Iba pa',
    operatorName: 'Pangalan ng Operator/s:',
    operatorAddress: 'Address ng Operator/s:',
    operatorDetermination: 'Paano mo natukoy ang operator/s sa lugar?',
    operatorDeterminationPlaceholder: 'Panayam sa mga manggagawa/residente/Brgy. Officials (Juan De La Cruz, Brgy. Captain)',
    observations: 'Mga obserbasyon sa lugar: (piliin lahat ng naaangkop)',
    excavations: 'Mga hukay',
    stockpiles: 'Mga nakaimbak',
    tunnels: 'Mga tunnel',
    mineShafts: 'Mine Shafts',
    accessRoad: 'Access road para sa transport',
    processingFacility: 'Mineral Processing Facility',
    interviewNote: 'Kung walang nakitang kasalukuyang aktibidad sa panahon ng verification, kailangan ng panayam sa mga residente o barangay officials upang makakuha ng indicative information tungkol sa operasyon sa lugar. Mga guide questions ay nakalaan sa ibaba.',
    interviewConducted: 'Nagsagawa ng panayam?',
    yes: 'Oo',
    no: 'Hindi',
    guideQuestions: 'Mga Gabay na Tanong',
    question1: 'May kamakailang aktibidad ba sa lugar? Kung oo, kailan ang pinakabago?',
    question2: 'Kailan nagsimula ang pagkuha, at gaano kadalas ito nangyayari?',
    question3: 'May mga dump truck o ibang sasakyan ba na naghahatid ng hinukay na mineral mula sa site?',
    question4: 'Kilala mo ba ang pangalan ng tao, kumpanya, o grupo na nag-ooperate sa lugar? Kung oo, ilista ang mga pangalan.',
    question5: 'Kilala o natukoy ba ang address ng operator? Kung oo, ilista ang address.',
    question6: 'May mga permit o opisyal na dokumento ba na ipinakita ng operator?',
    answerPlaceholder: 'Sagot dito',
    additionalInfo: 'Karagdagang Impormasyon:',
    attachPhotos: 'Mag-attach ng larawan (Mas mainam kung may geotagged)',
    uploadGallery: 'Mag-upload ng larawan mula sa gallery',
    useCamera: 'Gamitin ang camera ng telepono',
    certificationTitle: 'Certification Statement:',
    certificationText1: 'Sa pamamagitan ng pagsusumite ng ulat na ito, pinatutunayan ko na ang impormasyong narito ay totoo, kumpleto, at tumpak ayon sa aking kaalaman. Pinapatunayan ko na ang mga obserbasyon, panayam, at dokumentasyon na makikita sa ulat na ito ay ginawa nang may mabuting hangarin at walang pagkiling.',
    certificationText2: 'Nauunawaan ko na ang ulat na ito ay gagamitin para sa opisyal na pag-verify, posibleng legal action, at pagpapasya ng ahensya. Kinikilala ko rin ang aking responsibilidad na panatilihin ang integridad at layuning inaasahan sa aking tungkulin bilang Deputy Environment and Natural Resources Officer.',
    submitButton: 'Isumite sa MGB CALABARZON'
  }
};

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
    english: 'Illegal Small-Scale Mining',
    filipino: 'Ilegal na Maliitang Pagmimina',
    description: 'Unauthorized small-scale mining'
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
  
  // Main state
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'drafts'
  const [reports, setReports] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [showDraftDetail, setShowDraftDetail] = useState(false);
  
  // Form and modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [language, setLanguage] = useState('english');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingTransportationLocation, setIsLoadingTransportationLocation] = useState(false);
  const [isLoadingProcessingLocation, setIsLoadingProcessingLocation] = useState(false);
  const [isLoadingTradingLocation, setIsLoadingTradingLocation] = useState(false);
  const [isLoadingExplorationLocation, setIsLoadingExplorationLocation] = useState(false);
  const [isLoadingSmallScaleMiningLocation, setIsLoadingSmallScaleMiningLocation] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  
  // Image preview and management state
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [isEditingImages, setIsEditingImages] = useState(false);
  const [isUploadingNewImages, setIsUploadingNewImages] = useState(false);
  
  // Draft editing state
  const [editingDraft, setEditingDraft] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Network and sync state
  const [networkStatus, setNetworkStatus] = useState({ isOnline: true });
  const [syncStatus, setSyncStatus] = useState({ unsyncedCount: 0, canSync: false });
  
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
    commodityOther: '',
    siteStatus: 'operating',
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
    additionalInfo: '',
    // Non-operating status fields
    nonOperatingObservations: {
      excavations: false,
      accessRoad: false,
      processingFacility: false
    },
    conductedInterview: null, // null, true, false
    guideQuestions: {
      recentActivity: '',
      excavationStart: '',
      transportVehicles: '',
      operatorName: '',
      operatorAddress: '',
      permits: ''
    }
  });

  // Form state for Illegal Mineral Transportation checklist
  const [transportFormData, setTransportFormData] = useState({
    latitude: '',
    longitude: '',
    location: '',
    date: '',
    time: '',
    violationType: null, // 'absence', 'outdated', 'fraudulent'
    documentType: '',
    commodity: '',
    commodityOther: '',
    volumeWeight: '',
    unit: '',
    unitOther: '',
    vehicleType: '',
    vehicleTypeOther: '',
    vehicleDescription: '',
    vehicleBodyColor: '',
    plateNumber: '',
    ownerOperator: '',
    ownerAddress: '',
    driver: '',
    driverAddress: '',
    sourceOfMaterials: '',
    actionsTaken: '',
    additionalInfo: ''
  });

  // Form state for Illegal Mineral Processing checklist
  const [processingFormData, setProcessingFormData] = useState({
    latitude: '',
    longitude: '',
    location: '',
    date: '',
    time: '',
    hasSignboard: null, // null, true, false
    projectName: '',
    siteStatus: 'operating', // 'operating', 'non_operating', 'under_construction'
    facilityType: '',
    processingProducts: '',
    operatorName: '',
    operatorAddress: '',
    operatorDetermination: '',
    rawMaterialsName: '',
    rawMaterialsLocation: '',
    rawMaterialsDetermination: '',
    additionalInfo: ''
  });

  // Form state for Illegal Mineral Trading checklist
  const [tradingFormData, setTradingFormData] = useState({
    latitude: '',
    longitude: '',
    location: '',
    date: '',
    time: '',
    violationType: true, // Always true for this specific violation
    businessName: '',
    businessOwner: '',
    businessLocation: '',
    commodity: '',
    commodityOther: '',
    sourceOfCommodityName: '',
    sourceOfCommodityLocation: '',
    sourceOfCommodityDetermination: '',
    stockpiledMaterials: null, // 'yes', 'no', 'none', 'not_determined'
    dtiRegistration: null, // 'yes', 'no', 'not_determined'
    additionalInfo: ''
  });

  // Form state for Illegal Exploration checklist
  const [explorationFormData, setExplorationFormData] = useState({
    latitude: '',
    longitude: '',
    location: '',
    date: '',
    time: '',
    hasSignboard: null, // null, 'no_signboard', 'not_determined', 'yes'
    projectName: '',
    activities: {
      drilling: false,
      testPitting: false,
      trenching: false,
      shaftSinking: false,
      tunneling: false,
      others: false
    },
    othersActivity: '',
    operatorName: '',
    operatorAddress: '',
    operatorDetermination: '',
    additionalInfo: ''
  });

  // Form state for Illegal Small-Scale Mining of Gold checklist
  const [smallScaleMiningFormData, setSmallScaleMiningFormData] = useState({
    latitude: '',
    longitude: '',
    location: '',
    date: '',
    time: '',
    hasSignboard: null, // null, 'no_signboard', 'not_determined', 'yes'
    projectName: '',
    commodity: '',
    commodityOther: '',
    siteStatus: 'operating', // 'operating', 'nonOperating'
    // Operating status activities
    activities: {
      extraction: false,
      disposition: false,
      mineralProcessing: false,
      tunneling: false,
      shaftSinking: false,
      goldPanning: false,
      amalgamation: false,
      others: false
    },
    equipmentUsed: {
      extraction: '',
      disposition: '',
      mineralProcessing: ''
    },
    othersActivity: '',
    operatorName: '',
    operatorAddress: '',
    operatorDetermination: '',
    // Non-operating status observations
    observations: {
      excavations: false,
      stockpiles: false,
      tunnels: false,
      mineShafts: false,
      accessRoad: false,
      processingFacility: false
    },
    interviewConducted: false,
    interviewAnswers: {
      question1: '',
      question2: '',
      question3: '',
      question4: '',
      question5: '',
      question6: ''
    },
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

  const updateGuideQuestion = useCallback((questionKey, value) => {
    setFormData(prevData => ({
      ...prevData,
      guideQuestions: {
        ...prevData.guideQuestions,
        [questionKey]: value
      }
    }));
  }, []);

  // Update functions for transport form data
  const updateTransportFormData = useCallback((field, value) => {
    setTransportFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  }, []);

  // Update functions for processing form data
  const updateProcessingFormData = useCallback((field, value) => {
    setProcessingFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  }, []);

  // Update functions for trading form data
  const updateTradingFormData = useCallback((field, value) => {
    setTradingFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  }, []);

  // Update functions for exploration form data
  const updateExplorationFormData = useCallback((field, value) => {
    setExplorationFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  }, []);

  const updateExplorationActivityData = useCallback((activity, value) => {
    setExplorationFormData(prevData => ({
      ...prevData,
      activities: {
        ...prevData.activities,
        [activity]: value
      }
    }));
  }, []);

  // Update functions for small-scale mining form data
  const updateSmallScaleMiningFormData = useCallback((field, value) => {
    setSmallScaleMiningFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  }, []);

  const updateSmallScaleMiningActivityData = useCallback((activity, value) => {
    setSmallScaleMiningFormData(prevData => ({
      ...prevData,
      activities: {
        ...prevData.activities,
        [activity]: value
      }
    }));
  }, []);

  const updateSmallScaleMiningEquipmentData = useCallback((equipment, value) => {
    setSmallScaleMiningFormData(prevData => ({
      ...prevData,
      equipmentUsed: {
        ...prevData.equipmentUsed,
        [equipment]: value
      }
    }));
  }, []);

  const updateSmallScaleMiningObservationData = useCallback((observation, value) => {
    setSmallScaleMiningFormData(prevData => ({
      ...prevData,
      observations: {
        ...prevData.observations,
        [observation]: value
      }
    }));
  }, []);

  const updateSmallScaleMiningInterviewData = useCallback((question, value) => {
    setSmallScaleMiningFormData(prevData => ({
      ...prevData,
      interviewAnswers: {
        ...prevData.interviewAnswers,
        [question]: value
      }
    }));
  }, []);
  
  // Check if user has reporting permissions (not public user)
  const canReport = user?.role !== 'public';

  // Data fetching functions
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      
      // Get network status first
      const currentNetworkStatus = await asyncStorageDraftService.getNetworkStatus();
      setNetworkStatus(currentNetworkStatus);
      
      // Fetch reports (online only)
      let reportsData = [];
      if (currentNetworkStatus.isOnline) {
        try {
          const reportsResult = await reportService.getUserReports(user?.id || user?.username, 1, 50);
          if (reportsResult.success) {
            reportsData = reportsResult.data || [];
          }
        } catch (error) {
          console.warn('Failed to fetch online reports:', error.message);
        }
      }
      
      // Fetch drafts (combines online and offline)
      const draftsResult = await asyncStorageDraftService.getDrafts(user?.id || user?.username);
      let draftsData = [];
      if (draftsResult.success) {
        draftsData = draftsResult.data || [];
      }
      
      // Update sync status
      const unsyncedCount = await asyncStorageDraftService.getUnsyncedCount();
      setSyncStatus({ unsyncedCount });
      
      setReports(reportsData);
      setDrafts(draftsData);
      
      console.log(`📊 Loaded ${reportsData.length} reports and ${draftsData.length} drafts (${draftsResult.offlineCount || 0} offline, ${draftsResult.onlineCount || 0} online)`);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshReports = async () => {
    try {
      setIsRefreshing(true);
      await fetchReports();
    } catch (error) {
      console.error('Error refreshing reports:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sync offline drafts to online
  const handleSyncDrafts = async () => {
    try {
      const result = await asyncStorageDraftService.syncOfflineDrafts();
      if (result.success) {
        if (result.syncedCount > 0) {
          Alert.alert('Sync Complete', 
            `Successfully synced ${result.syncedCount} draft(s) to the server.${result.failedCount > 0 ? `\n\n${result.failedCount} draft(s) failed to sync.` : ''}`, [
            { text: 'OK', onPress: () => refreshReports() }
          ]);
        } else {
          Alert.alert('Sync Complete', 'No drafts to sync.');
        }
      } else {
        Alert.alert('Sync Failed', result.error || 'Failed to sync drafts');
      }
    } catch (error) {
      console.error('Error syncing drafts:', error);
      Alert.alert('Sync Failed', 'An error occurred while syncing drafts');
    }
  };

  // Load reports on component mount
  useEffect(() => {
    if (user?.id || user?.username) {
      fetchReports();
    }
  }, [user]);

  // Filter and search functions
  const getFilteredData = () => {
    const currentData = activeTab === 'reports' ? reports : drafts;
    
    return currentData.filter(item => {
      const matchesSearch = !searchQuery || 
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reportId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reportType?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesType = filterType === 'all' || item.reportType === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FF9800';
      case 'under_investigation':
        return '#2196F3';
      case 'resolved':
        return '#4CAF50';
      case 'dismissed':
        return '#F44336';
      case 'draft':
        return '#9E9E9E';
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'under_investigation':
        return 'Under Investigation';
      case 'resolved':
        return 'Resolved';
      case 'dismissed':
        return 'Dismissed';
      case 'draft':
        return 'Draft';
      default:
        return status || 'Unknown';
    }
  };

  const getReportTypeTitle = (reportType) => {
    const category = violationCategories.find(cat => cat.id === reportType);
    return category ? (language === 'english' ? category.english : category.filipino) : reportType;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Draft handling functions
  const handleSaveAsDraft = async () => {
    if (isSavingDraft) return;

    // Get current form data based on selected category
    let currentFormData;
    switch (selectedCategory?.id) {
      case 'illegal_mining':
        currentFormData = formData;
        break;
      case 'illegal_transport':
        currentFormData = transportFormData;
        break;
      case 'illegal_processing':
        currentFormData = processingFormData;
        break;
      case 'illegal_trading':
        currentFormData = tradingFormData;
        break;
      case 'illegal_exploration':
        currentFormData = explorationFormData;
        break;
      case 'illegal_smallscale':
        currentFormData = smallScaleMiningFormData;
        break;
      default:
        currentFormData = formData;
    }

    setIsSavingDraft(true);

    try {
      // Prepare draft data with proper structure for offline storage
      const draftData = {
        type: selectedCategory.id,
        reporterId: user?.id || user?.username,
        language: language,
        gpsLocation: {
          latitude: currentFormData.latitude ? parseFloat(currentFormData.latitude) : null,
          longitude: currentFormData.longitude ? parseFloat(currentFormData.longitude) : null
        },
        location: currentFormData.location || '',
        incidentDate: currentFormData.date || '',
        incidentTime: currentFormData.time || '',
        projectInfo: {
          hasSignboard: currentFormData.hasSignboard === true ? 'yes' : 
                       currentFormData.hasSignboard === false ? 'no' : 'not_determined',
          projectName: currentFormData.projectName || ''
        },
        commodity: currentFormData.commodity || '',
        siteStatus: currentFormData.siteStatus || 'operating',
        operatorInfo: {
          name: currentFormData.operatorName || '',
          address: currentFormData.operatorAddress || '',
          determinationMethod: currentFormData.operatorDetermination || ''
        },
        additionalInfo: currentFormData.additionalInfo || '',
        formData: currentFormData, // Store complete form data for reconstruction
        attachments: uploadedImages.map(img => ({
          url: img.url || img.uri || img.preview,
          publicId: img.publicId,
          type: 'image',
          geotagged: img.geotagged || false,
          uploadedAt: img.uploadedAt || new Date().toISOString()
        }))
      };

      let result;
      if (isEditingMode && editingDraft) {
        // Update existing draft
        result = await asyncStorageDraftService.updateDraft(editingDraft.id || editingDraft._id, draftData);
      } else {
        // Save new draft (handles online/offline automatically)
        result = await asyncStorageDraftService.saveDraft(draftData);
      }
      
      if (result.success) {
        // All drafts are now saved offline by default
        const statusMessage = isEditingMode 
          ? 'Draft updated offline successfully!' 
          : 'Report saved as draft offline!';
          
        const networkMessage = '\n\n📱 Saved to device storage\n🔄 Will sync to MGB CALABARZON when submitted';

        Alert.alert('Success', statusMessage + networkMessage, [
          { 
            text: 'OK', 
            onPress: () => {
              resetAllForms();
              setUploadedImages([]);
              setShowChecklistModal(false);
              setSelectedCategory(null);
              setEditingDraft(null);
              setIsEditingMode(false);
              refreshReports(); // Refresh the reports list
            }
          }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'An error occurred while saving the draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleEditDraft = (draft) => {
    console.log('Editing draft:', draft);
    setEditingDraft(draft);
    setIsEditingMode(true);
    
    // Reset all form states first
    resetAllFormStates();
    
    // Find the category for this draft - use draft.type instead of draft.reportType
    const draftType = draft.type || draft.reportType;
    const category = violationCategories.find(cat => cat.id === draftType);
    if (category) {
      setSelectedCategory(category);
      
      // Small delay to ensure form states are reset before populating
      setTimeout(() => {
        populateFormFromDraft(draft);
        setShowChecklistModal(true);
      }, 100);
    } else {
      console.error('Category not found for draft type:', draftType);
      Alert.alert('Error', 'Unable to edit this draft. Category not found.');
    }
  };

  // Function to reset all form states
  const resetAllFormStates = () => {
    setFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      hasSignboard: null,
      projectName: '',
      commodity: '',
      siteStatus: 'operating',
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
      nonOperatingObservations: {
        excavations: false,
        accessRoad: false,
        processingFacility: false
      },
      conductedInterview: null,
      guideQuestions: {
        recentActivity: '',
        excavationStart: '',
        transportVehicles: '',
        operatorName: '',
        operatorAddress: '',
        permits: ''
      },
      additionalInfo: ''
    });
    
    setTransportFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      violationType: '',
      documentType: '',
      commodity: '',
      volumeWeight: '',
      unit: '',
      vehicleType: '',
      vehicleDescription: '',
      bodyColor: '',
      plateNumber: '',
      ownerName: '',
      ownerAddress: '',
      driverName: '',
      driverAddress: '',
      sourceOfMaterials: '',
      actionsTaken: '',
      additionalInfo: ''
    });
    
    setProcessingFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      hasSignboard: null,
      projectName: '',
      siteStatus: 'operating',
      facilityType: '',
      processingProducts: '',
      operatorName: '',
      operatorAddress: '',
      operatorDetermination: '',
      rawMaterialsName: '',
      rawMaterialsLocation: '',
      rawMaterialsDetermination: '',
      additionalInfo: ''
    });
    
    setTradingFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      violationType: '',
      businessName: '',
      businessOwner: '',
      businessLocation: '',
      commodity: '',
      sourceOfCommodityName: '',
      sourceOfCommodityLocation: '',
      sourceOfCommodityDetermination: '',
      stockpiledMaterials: '',
      dtiRegistration: '',
      additionalInfo: ''
    });
    
    setExplorationFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      hasSignboard: null,
      projectName: '',
      activities: {
        drilling: false,
        testPitting: false,
        trenching: false,
        shaftSinking: false,
        tunneling: false,
        others: false
      },
      othersActivity: '',
      operatorName: '',
      operatorAddress: '',
      operatorDetermination: '',
      additionalInfo: ''
    });
    
    setSmallScaleMiningFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      hasSignboard: null,
      projectName: '',
      commodity: '',
      siteStatus: 'operating',
      activities: {
        extraction: false,
        disposition: false,
        mineralProcessing: false,
        tunneling: false,
        shaftSinking: false,
        goldPanning: false,
        amalgamation: false,
        others: false
      },
      equipmentUsed: {
        extraction: '',
        disposition: '',
        mineralProcessing: ''
      },
      othersActivity: '',
      operatorName: '',
      operatorAddress: '',
      operatorDetermination: '',
      observations: {
        excavations: false,
        stockpiles: false,
        tunnels: false,
        mineShafts: false,
        accessRoad: false,
        processingFacility: false
      },
      interviewConducted: false,
      guideQuestions: {
        question1: '',
        question2: '',
        question3: '',
        question4: '',
        question5: '',
        question6: ''
      },
      additionalInfo: ''
    });
    
    setUploadedImages([]);
  };

  const populateFormFromDraft = (draft) => {
    console.log('Populating form from draft:', draft);
    const draftType = draft.type || draft.reportType;
    console.log('Draft report type:', draftType);
    console.log('Is offline draft:', draft.isOffline);
    console.log('Draft data structure:', JSON.stringify(draft, null, 2));
    
    // For offline drafts, use the stored formData if available, otherwise use the structured data
    const useStoredFormData = draft.isOffline && draft.formData;
    
    let baseData;
    if (useStoredFormData) {
      // Use the complete form data stored for offline drafts
      baseData = {
        ...draft.formData,
        // Ensure these fields are properly set from the structured data
        latitude: draft.gpsLocation?.latitude?.toString() || draft.formData.latitude || '',
        longitude: draft.gpsLocation?.longitude?.toString() || draft.formData.longitude || '',
        location: draft.location || draft.formData.location || '',
        date: draft.incidentDate || draft.formData.date || '',
        time: draft.incidentTime || draft.formData.time || '',
        commodity: draft.commodity || draft.formData.commodity || '',
        siteStatus: draft.siteStatus || draft.formData.siteStatus || 'operating',
        additionalInfo: draft.additionalInfo || draft.formData.additionalInfo || ''
      };
    } else {
      // Use the structured data for online drafts
      baseData = {
        latitude: draft.gpsLocation?.latitude?.toString() || '',
        longitude: draft.gpsLocation?.longitude?.toString() || '',
        location: draft.location || '',
        date: draft.incidentDate || '',
        time: draft.incidentTime || '',
        hasSignboard: draft.projectInfo?.hasSignboard === 'yes' ? true : 
                     draft.projectInfo?.hasSignboard === 'no' ? false : null,
        projectName: draft.projectInfo?.projectName || '',
        commodity: draft.commodity || '',
        siteStatus: draft.siteStatus || 'operating',
        operatorName: draft.operatorInfo?.name || '',
        operatorAddress: draft.operatorInfo?.address || '',
        operatorDetermination: draft.operatorInfo?.determinationMethod || '',
        additionalInfo: draft.additionalInfo || ''
      };
    }
    
    // Set uploaded images from draft attachments
    if (draft.attachments && draft.attachments.length > 0) {
      const draftImages = draft.attachments.map((attachment, index) => ({
        id: `draft_image_${index}`,
        url: attachment.url,
        uri: attachment.url,
        preview: attachment.url,
        publicId: attachment.publicId,
        type: attachment.type || 'image',
        geotagged: attachment.geotagged || false,
        uploadedAt: attachment.uploadedAt,
        isUploaded: true
      }));
      setUploadedImages(draftImages);
    }

    // Set form data based on report type
    console.log('Setting form data for report type:', draftType);
    switch (draftType) {
      case 'illegal_mining':
        console.log('Setting illegal_mining form data');
        const miningFormData = {
          ...baseData,
          activities: useStoredFormData ? 
            (draft.formData.activities || {
              extraction: false,
              disposition: false,
              processing: false
            }) : {
              extraction: draft.miningData?.operatingActivities?.extraction?.active || false,
              disposition: draft.miningData?.operatingActivities?.disposition?.active || false,
              processing: draft.miningData?.operatingActivities?.processing?.active || false
            },
          extractionEquipment: useStoredFormData ? 
            (draft.formData.extractionEquipment || []) :
            (draft.miningData?.operatingActivities?.extraction?.equipment || []),
          dispositionEquipment: useStoredFormData ? 
            (draft.formData.dispositionEquipment || []) :
            (draft.miningData?.operatingActivities?.disposition?.equipment || []),
          processingEquipment: useStoredFormData ? 
            (draft.formData.processingEquipment || []) :
            (draft.miningData?.operatingActivities?.processing?.equipment || []),
          nonOperatingObservations: useStoredFormData ? 
            (draft.formData.nonOperatingObservations || {
              excavations: false,
              accessRoad: false,
              processingFacility: false
            }) : {
              excavations: draft.miningData?.nonOperatingObservations?.excavations || false,
              accessRoad: draft.miningData?.nonOperatingObservations?.accessRoad || false,
              processingFacility: draft.miningData?.nonOperatingObservations?.processingFacility || false
            },
          conductedInterview: useStoredFormData ? 
            draft.formData.conductedInterview :
            (draft.miningData?.interview?.conducted || null),
          guideQuestions: useStoredFormData ? 
            (draft.formData.guideQuestions || {
              recentActivity: '',
              excavationStart: '',
              transportVehicles: '',
              operatorName: '',
              operatorAddress: '',
              permits: ''
            }) : (draft.miningData?.interview?.responses || {
              recentActivity: '',
              excavationStart: '',
              transportVehicles: '',
              operatorName: '',
              operatorAddress: '',
              permits: ''
            })
        };
        console.log('Mining form data to set:', miningFormData);
        setFormData(miningFormData);
        break;
      case 'illegal_transport':
        console.log('Setting illegal_transport form data');
        const transportFormData = useStoredFormData && draft.formData ? {
          ...baseData,
          ...draft.formData
        } : {
          ...baseData,
          violationType: draft.transportData?.violationType || '',
          documentType: draft.transportData?.documentType || '',
          volumeWeight: draft.transportData?.materialInfo?.volumeWeight || '',
          unit: draft.transportData?.materialInfo?.unit || '',
          vehicleType: draft.transportData?.vehicleInfo?.type || '',
          vehicleDescription: draft.transportData?.vehicleInfo?.description || '',
          bodyColor: draft.transportData?.vehicleInfo?.bodyColor || '',
          plateNumber: draft.transportData?.vehicleInfo?.plateNumber || '',
          ownerName: draft.transportData?.ownerOperator?.name || '',
          ownerAddress: draft.transportData?.ownerOperator?.address || '',
          driverName: draft.transportData?.driver?.name || '',
          driverAddress: draft.transportData?.driver?.address || '',
          sourceOfMaterials: draft.transportData?.sourceOfMaterials || '',
          actionsTaken: draft.transportData?.actionsTaken || ''
        };
        console.log('Transport form data to set:', transportFormData);
        setTransportFormData(transportFormData);
        break;
      case 'illegal_processing':
        console.log('Setting illegal_processing form data');
        const processingFormData = useStoredFormData && draft.formData ? {
          ...baseData,
          ...draft.formData
        } : {
          ...baseData,
          facilityType: draft.processingData?.facilityType || '',
          processingProducts: draft.processingData?.processingProducts || '',
          operatorName: draft.processingData?.ownerOperator?.name || '',
          operatorAddress: draft.processingData?.ownerOperator?.address || '',
          operatorDetermination: draft.processingData?.operatorDetermination || '',
          rawMaterialsName: draft.processingData?.rawMaterialsName || '',
          rawMaterialsLocation: draft.processingData?.rawMaterialsLocation || '',
          rawMaterialsDetermination: draft.processingData?.rawMaterialsDetermination || ''
        };
        console.log('Processing form data to set:', processingFormData);
        setProcessingFormData(processingFormData);
        break;
      case 'illegal_trading':
        console.log('Setting illegal_trading form data');
        const tradingFormData = useStoredFormData && draft.formData ? {
          ...baseData,
          ...draft.formData
        } : {
          ...baseData,
          violationType: draft.tradingData?.violationType || 'tradingViolation',
          businessName: draft.tradingData?.businessName || '',
          businessOwner: draft.tradingData?.businessOwner || '',
          businessLocation: draft.tradingData?.businessLocation || '',
          sourceOfCommodityName: draft.tradingData?.sourceOfCommodityName || '',
          sourceOfCommodityLocation: draft.tradingData?.sourceOfCommodityLocation || '',
          sourceOfCommodityDetermination: draft.tradingData?.sourceOfCommodityDetermination || '',
          stockpiledMaterials: draft.tradingData?.stockpiledMaterials || '',
          dtiRegistration: draft.tradingData?.dtiRegistration || ''
        };
        console.log('Trading form data to set:', tradingFormData);
        setTradingFormData(tradingFormData);
        break;
      case 'illegal_exploration':
        console.log('Setting illegal_exploration form data');
        const explorationFormData = {
          ...baseData,
          activities: useStoredFormData ? 
            (draft.formData.activities || {
              drilling: false,
              testPitting: false,
              trenching: false,
              shaftSinking: false,
              tunneling: false,
              others: false
            }) : {
              drilling: draft.explorationData?.activities?.drilling || false,
              testPitting: draft.explorationData?.activities?.testPitting || false,
              trenching: draft.explorationData?.activities?.trenching || false,
              shaftSinking: draft.explorationData?.activities?.shaftSinking || false,
              tunneling: draft.explorationData?.activities?.tunneling || false,
              others: draft.explorationData?.activities?.others || false
            },
          othersActivity: useStoredFormData ? 
            (draft.formData.othersActivity || '') :
            (draft.explorationData?.othersActivity || ''),
          operatorName: useStoredFormData ? 
            (draft.formData.operatorName || '') :
            (draft.explorationData?.ownerOperator?.name || ''),
          operatorAddress: useStoredFormData ? 
            (draft.formData.operatorAddress || '') :
            (draft.explorationData?.ownerOperator?.address || ''),
          operatorDetermination: useStoredFormData ? 
            (draft.formData.operatorDetermination || '') :
            (draft.explorationData?.operatorDetermination || '')
        };
        console.log('Exploration form data to set:', explorationFormData);
        setExplorationFormData(explorationFormData);
        break;
      case 'illegal_smallscale':
        console.log('Setting illegal_smallscale form data');
        const smallScaleFormData = {
          ...baseData,
          activities: useStoredFormData ? 
            (draft.formData.activities || {
              extraction: false,
              disposition: false,
              mineralProcessing: false,
              tunneling: false,
              shaftSinking: false,
              goldPanning: false,
              amalgamation: false,
              others: false
            }) : {
              extraction: draft.smallScaleData?.activities?.extraction || false,
              disposition: draft.smallScaleData?.activities?.disposition || false,
              mineralProcessing: draft.smallScaleData?.activities?.mineralProcessing || false,
              tunneling: draft.smallScaleData?.activities?.tunneling || false,
              shaftSinking: draft.smallScaleData?.activities?.shaftSinking || false,
              goldPanning: draft.smallScaleData?.activities?.goldPanning || false,
              amalgamation: draft.smallScaleData?.activities?.amalgamation || false,
              others: draft.smallScaleData?.activities?.others || false
            },
          equipmentUsed: useStoredFormData ? 
            (draft.formData.equipmentUsed || {
              extraction: '',
              disposition: '',
              mineralProcessing: ''
            }) : {
              extraction: draft.smallScaleData?.equipmentUsed?.extraction || '',
              disposition: draft.smallScaleData?.equipmentUsed?.disposition || '',
              mineralProcessing: draft.smallScaleData?.equipmentUsed?.mineralProcessing || ''
            },
          othersActivity: useStoredFormData ? 
            (draft.formData.othersActivity || '') :
            (draft.smallScaleData?.othersActivity || ''),
          observations: useStoredFormData ? 
            (draft.formData.observations || {
              excavations: false,
              stockpiles: false,
              tunnels: false,
              mineShafts: false,
              accessRoad: false,
              processingFacility: false
            }) : {
              excavations: draft.smallScaleData?.observations?.excavations || false,
              stockpiles: draft.smallScaleData?.observations?.stockpiles || false,
              tunnels: draft.smallScaleData?.observations?.tunnels || false,
              mineShafts: draft.smallScaleData?.observations?.mineShafts || false,
              accessRoad: draft.smallScaleData?.observations?.accessRoad || false,
              processingFacility: draft.smallScaleData?.observations?.processingFacility || false
            },
          interviewConducted: useStoredFormData ? 
            (draft.formData.interviewConducted || false) :
            (draft.smallScaleData?.interview?.conducted || false),
          guideQuestions: useStoredFormData ? 
            (draft.formData.guideQuestions || {
              question1: '',
              question2: '',
              question3: '',
              question4: '',
              question5: '',
              question6: ''
            }) : {
              question1: draft.smallScaleData?.interview?.responses?.question1 || '',
              question2: draft.smallScaleData?.interview?.responses?.question2 || '',
              question3: draft.smallScaleData?.interview?.responses?.question3 || '',
              question4: draft.smallScaleData?.interview?.responses?.question4 || '',
              question5: draft.smallScaleData?.interview?.responses?.question5 || '',
              question6: draft.smallScaleData?.interview?.responses?.question6 || ''
            }
        };
        console.log('Small-scale form data to set:', smallScaleFormData);
        setSmallScaleMiningFormData(smallScaleFormData);
        break;
      default:
        console.warn('Unknown report type:', draftType);
        console.log('Available form data:', draft.formData);
        // For unknown types, try to use stored form data if available
        if (useStoredFormData && draft.formData) {
          setFormData({
            ...baseData,
            ...draft.formData
          });
        } else {
          setFormData(baseData);
        }
    }
    
    console.log('Form population completed for:', draftType);

    // Set uploaded images if any
    if (draft.attachments && draft.attachments.length > 0) {
      setUploadedImages(draft.attachments.map((att, index) => ({
        id: att.id || `draft_${Date.now()}_${index}`,
        url: att.url || att.path,
        uri: att.url || att.path,
        preview: att.url || att.path,
        publicId: att.publicId || '',
        geotagged: att.geotagged || false,
        uploadedAt: att.uploadedAt,
        isUploaded: true,
        type: att.type || 'image/jpeg',
        name: att.name || `image_${index}.jpg`
      })));
    }
  };

  // GPS location handler
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const coordinates = await locationService.getCurrentLocation();
      if (coordinates) {
        updateFormData('latitude', coordinates.latitude.toString());
        updateFormData('longitude', coordinates.longitude.toString());
      } else {
        Alert.alert('Error', 'Unable to get location coordinates. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to get current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Date and time handler
  const handleUsePhoneDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    updateFormData('date', date);
    updateFormData('time', time);
  };

  // Transportation form handlers
  const handleTransportationGetCurrentLocation = async () => {
    setIsLoadingTransportationLocation(true);
    try {
      const coordinates = await locationService.getCurrentLocation();
      if (coordinates) {
        updateTransportFormData('latitude', coordinates.latitude.toString());
        updateTransportFormData('longitude', coordinates.longitude.toString());
      } else {
        Alert.alert('Error', 'Unable to get location coordinates. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to get current location');
    } finally {
      setIsLoadingTransportationLocation(false);
    }
  };

  const handleTransportationUsePhoneDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    updateTransportFormData('date', date);
    updateTransportFormData('time', time);
  };

  // Processing form handlers
  const handleProcessingGetCurrentLocation = async () => {
    setIsLoadingProcessingLocation(true);
    try {
      const coordinates = await locationService.getCurrentLocation();
      if (coordinates) {
        updateProcessingFormData('latitude', coordinates.latitude.toString());
        updateProcessingFormData('longitude', coordinates.longitude.toString());
      } else {
        Alert.alert('Error', 'Unable to get location coordinates. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to get current location');
    } finally {
      setIsLoadingProcessingLocation(false);
    }
  };

  const handleProcessingUsePhoneDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    updateProcessingFormData('date', date);
    updateProcessingFormData('time', time);
  };

  // Trading form handlers
  const handleTradingGetCurrentLocation = async () => {
    setIsLoadingTradingLocation(true);
    try {
      const coordinates = await locationService.getCurrentLocation();
      if (coordinates) {
        updateTradingFormData('latitude', coordinates.latitude.toString());
        updateTradingFormData('longitude', coordinates.longitude.toString());
      } else {
        Alert.alert('Error', 'Unable to get location coordinates. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to get current location');
    } finally {
      setIsLoadingTradingLocation(false);
    }
  };

  const handleTradingUsePhoneDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    updateTradingFormData('date', date);
    updateTradingFormData('time', time);
  };

  // Exploration form handlers
  const handleExplorationGetCurrentLocation = async () => {
    setIsLoadingExplorationLocation(true);
    try {
      const coordinates = await locationService.getCurrentLocation();
      if (coordinates) {
        updateExplorationFormData('latitude', coordinates.latitude.toString());
        updateExplorationFormData('longitude', coordinates.longitude.toString());
      } else {
        Alert.alert('Error', 'Unable to get location coordinates. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to get current location');
    } finally {
      setIsLoadingExplorationLocation(false);
    }
  };

  const handleExplorationUsePhoneDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    updateExplorationFormData('date', date);
    updateExplorationFormData('time', time);
  };

  // Small Scale Mining form handlers
  const handleSmallScaleMiningGetCurrentLocation = async () => {
    setIsLoadingSmallScaleMiningLocation(true);
    try {
      const coordinates = await locationService.getCurrentLocation();
      if (coordinates) {
        updateSmallScaleMiningFormData('latitude', coordinates.latitude.toString());
        updateSmallScaleMiningFormData('longitude', coordinates.longitude.toString());
      } else {
        Alert.alert('Error', 'Unable to get location coordinates. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to get current location');
    } finally {
      setIsLoadingSmallScaleMiningLocation(false);
    }
  };

  const handleSmallScaleMiningUsePhoneDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    updateSmallScaleMiningFormData('date', date);
    updateSmallScaleMiningFormData('time', time);
  };

  // Image Upload Functions
  const handleImageUpload = async () => {
    if (isUploadingImages) return;

    try {
      setIsUploadingImages(true);
      
      // First, pick images for preview
      const images = await imageService.pickImagesForPreview(5);
      
      if (images.length === 0) {
        setIsUploadingImages(false);
        return;
      }

      // Validate image sizes
      const oversizedImages = images.filter(img => {
        const validation = imageService.validateImageSize(img, 10);
        return !validation.valid;
      });

      if (oversizedImages.length > 0) {
        Alert.alert(
          'Image Size Error',
          `${oversizedImages.length} image(s) exceed the 10MB size limit. Please select smaller images.`,
          [{ text: 'OK' }]
        );
        setIsUploadingImages(false);
        return;
      }

      // Upload images to Cloudinary immediately
      console.log('📤 Uploading images to Cloudinary...');
      const uploadResults = await imageService.uploadMultipleImages(images);
      
      if (uploadResults.successful && uploadResults.successful.length > 0) {
        // Add successfully uploaded images with Cloudinary URLs
        const uploadedImagesWithUrls = uploadResults.successful.map(result => ({
          id: `uploaded_${Date.now()}_${Math.random()}`,
          url: result.url,
          publicId: result.publicId,
          geotagged: result.geotagged,
          isUploaded: true,
          uploadedAt: result.uploadedAt || new Date().toISOString()
        }));
        
        setUploadedImages(prev => [...prev, ...uploadedImagesWithUrls]);
        
        console.log('✅ Images uploaded successfully:', uploadedImagesWithUrls.length);
        
        Alert.alert(
          'Upload Successful',
          `${uploadResults.successful.length} image(s) uploaded successfully to Cloudinary!`,
          [{ text: 'OK' }]
        );
      }
      
      if (uploadResults.failed && uploadResults.failed.length > 0) {
        console.error('❌ Failed to upload some images:', uploadResults.failed);
        Alert.alert(
          'Upload Warning',
          `${uploadResults.failed.length} image(s) failed to upload. Please try again.`,
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert(
        'Upload Error',
        'An error occurred while uploading images. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUploadingImages(false);
    }
  };

  // Function to upload images when submitting report
  const uploadSelectedImages = async (selectedImages) => {
    try {
      const imagesToUpload = selectedImages.filter(img => !img.isUploaded);
      if (imagesToUpload.length === 0) return [];

      const uploadResults = await imageService.uploadMultipleImages(imagesToUpload);
      return uploadResults.successful || [];
    } catch (error) {
      console.error('Error uploading selected images:', error);
      return [];
    }
  };

  // Image Preview and Management Functions
  const openImagePreview = (images, startIndex = 0) => {
    setCurrentImages(images);
    setSelectedImageIndex(startIndex);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setIsEditingImages(false);
    setSelectedImageIndex(0);
    setCurrentImages([]);
  };

  const handleDeleteImageFromPreview = async (imageIndex) => {
    try {
      const imageToDelete = currentImages[imageIndex];
      
      Alert.alert(
        'Delete Image',
        'Are you sure you want to delete this image?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // Remove from current images
              const updatedImages = currentImages.filter((_, index) => index !== imageIndex);
              setCurrentImages(updatedImages);
              
              // If this was the last image, close preview
              if (updatedImages.length === 0) {
                closeImagePreview();
                return;
              }
              
              // Adjust selected index if needed
              if (selectedImageIndex >= updatedImages.length) {
                setSelectedImageIndex(updatedImages.length - 1);
              }
              
              // Update the source (report or draft) images
              if (selectedReport) {
                setSelectedReport(prev => ({
                  ...prev,
                  attachments: updatedImages
                }));
              } else if (selectedDraft) {
                setSelectedDraft(prev => ({
                  ...prev,
                  attachments: updatedImages
                }));
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', 'Failed to delete image. Please try again.');
    }
  };

  const handleAddNewImages = async () => {
    try {
      setIsUploadingNewImages(true);
      
      const newImages = await imageService.pickImagesForPreview(5);
      if (newImages.length === 0) return;
      
      // Add new images to current images
      const updatedImages = [...currentImages, ...newImages];
      setCurrentImages(updatedImages);
      
      // Update the source (report or draft) images
      if (selectedReport) {
        setSelectedReport(prev => ({
          ...prev,
          attachments: updatedImages
        }));
      } else if (selectedDraft) {
        setSelectedDraft(prev => ({
          ...prev,
          attachments: updatedImages
        }));
      }
      
      Alert.alert('Success', `${newImages.length} image(s) added successfully!`);
    } catch (error) {
      console.error('Error adding new images:', error);
      Alert.alert('Error', 'Failed to add new images. Please try again.');
    } finally {
      setIsUploadingNewImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setUploadedImages(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

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

  const handleSubmitReport = async () => {
    if (isSubmitting) return;

    // Get current form data based on selected category
    let currentFormData;
    switch (selectedCategory?.id) {
      case 'illegal_mining':
        currentFormData = formData;
        break;
      case 'illegal_transport':
        currentFormData = transportFormData;
        break;
      case 'illegal_processing':
        currentFormData = processingFormData;
        break;
      case 'illegal_trading':
        currentFormData = tradingFormData;
        break;
      case 'illegal_exploration':
        currentFormData = explorationFormData;
        break;
      case 'illegal_smallscale':
        currentFormData = smallScaleMiningFormData;
        break;
      default:
        currentFormData = formData;
    }

    // Basic validation - Date and time are required
    if (!currentFormData.date || !currentFormData.time) {
      Alert.alert('Validation Error', 'Date and time are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use already uploaded images (they were uploaded when selected)
      let finalAttachments = [];
      if (uploadedImages.length > 0) {
        // Images are already uploaded to Cloudinary, just format them
        finalAttachments = uploadedImages.map(img => ({
          url: img.url,
          publicId: img.publicId,
          type: 'image',
          geotagged: img.geotagged || false,
          uploadedAt: img.uploadedAt || new Date().toISOString()
        }));
        
        console.log('📎 Attaching uploaded images to report:', finalAttachments.length);
      }

      const reportData = {
        type: selectedCategory.id,
        reporterId: user?.id || user?.username,
        language: language,
        ...currentFormData,
        attachments: finalAttachments
      };

      console.log('📤 Submitting report data:', {
        type: reportData.type,
        hasAttachments: reportData.attachments?.length || 0,
        location: reportData.location
      });

      const result = await reportService.submitReport(reportData);
      
      console.log('📨 Submit result:', result);
      
      if (result.success) {
        // If this was a draft being submitted, delete it from drafts
        if (isEditingMode && editingDraft) {
          try {
            await asyncStorageDraftService.deleteDraft(editingDraft.id || editingDraft._id);
            console.log('Draft deleted successfully after submission');
          } catch (deleteError) {
            console.error('Error deleting draft after submission:', deleteError);
            // Don't show error to user as the main submission was successful
          }
        }

        Alert.alert('Success', 'Report submitted successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              resetAllForms();
              setUploadedImages([]);
              setShowChecklistModal(false);
              setSelectedCategory(null);
              setEditingDraft(null);
              setIsEditingMode(false);
              // Refresh the reports list to show the new report and remove from drafts
              refreshReports();
            }
          }
        ]);
      } else {
        console.error('❌ Submit failed:', result.message);
        Alert.alert('Error', result.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('❌ Error submitting report:', error);
      console.error('Error details:', error.message, error.stack);
      Alert.alert('Error', error.message || 'An error occurred while submitting the report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // GPS and Image Components
  const renderGPSSection = (currentFormData, translations) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{translations.gpsLocation}</Text>
      
      <View style={styles.gpsContainer}>
        <View style={styles.gpsRow}>
          <View style={styles.gpsField}>
            <Text style={styles.label}>{translations.latitude}</Text>
            <TextInput
              style={styles.input}
              value={currentFormData.latitude}
              onChangeText={(text) => {
                switch (selectedCategory?.id) {
                  case 'illegal_mining':
                    updateFormData('latitude', text);
                    break;
                  case 'illegal_transport':
                    updateTransportFormData('latitude', text);
                    break;
                  case 'illegal_processing':
                    updateProcessingFormData('latitude', text);
                    break;
                  case 'illegal_trading':
                    updateTradingFormData('latitude', text);
                    break;
                  case 'illegal_exploration':
                    updateExplorationFormData('latitude', text);
                    break;
                  case 'illegal_smallscale':
                    updateSmallScaleMiningFormData('latitude', text);
                    break;
                }
              }}
              placeholder="0.000000"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.gpsField}>
            <Text style={styles.label}>{translations.longitude}</Text>
            <TextInput
              style={styles.input}
              value={currentFormData.longitude}
              onChangeText={(text) => {
                switch (selectedCategory?.id) {
                  case 'illegal_mining':
                    updateFormData('longitude', text);
                    break;
                  case 'illegal_transport':
                    updateTransportFormData('longitude', text);
                    break;
                  case 'illegal_processing':
                    updateProcessingFormData('longitude', text);
                    break;
                  case 'illegal_trading':
                    updateTradingFormData('longitude', text);
                    break;
                  case 'illegal_exploration':
                    updateExplorationFormData('longitude', text);
                    break;
                  case 'illegal_smallscale':
                    updateSmallScaleMiningFormData('longitude', text);
                    break;
                }
              }}
              placeholder="0.000000"
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.gpsButton, isLoadingLocation && styles.buttonDisabled]}
          onPress={handleGetCurrentLocation}
          disabled={isLoadingLocation}
        >
          <Ionicons 
            name={isLoadingLocation ? "refresh" : "location"} 
            size={20} 
            color="white" 
            style={isLoadingLocation ? { transform: [{ rotate: '180deg' }] } : {}}
          />
          <Text style={styles.gpsButtonText}>
            {isLoadingLocation ? 'Getting Location...' : translations.getCoordinates}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageSection = (translations) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {language === 'english' ? 'Photo Evidence' : 'Patunay na Larawan'}
      </Text>
      
      <TouchableOpacity
        style={[styles.imageUploadButton, isUploadingImages && styles.buttonDisabled]}
        onPress={handleImageUpload}
        disabled={isUploadingImages}
      >
        <Ionicons 
          name={isUploadingImages ? "cloud-upload" : "camera"} 
          size={20} 
          color="white" 
        />
        <Text style={styles.imageUploadButtonText}>
          {isUploadingImages 
            ? (language === 'english' ? 'Uploading...' : 'Nag-uupload...')
            : (language === 'english' ? 'Add Photos from Gallery' : 'Magdagdag ng Larawan mula sa Gallery')
          }
        </Text>
      </TouchableOpacity>

      {uploadedImages.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.imagePreviewTitle}>
            {language === 'english' 
              ? `Uploaded Images (${uploadedImages.length})` 
              : `Mga Na-upload na Larawan (${uploadedImages.length})`
            }
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
            {uploadedImages.map((image, index) => (
              <View key={image.id || `image_${index}_${Date.now()}`} style={styles.imagePreviewItem}>
                <TouchableOpacity
                  onPress={() => openImagePreview(uploadedImages, index)}
                  style={styles.imagePreviewTouchable}
                >
                  <Image 
                    source={{ uri: image.url || image.uri || image.preview }} 
                    style={styles.imagePreview}
                    onError={(error) => {
                      console.log('Form image preview error:', error.nativeEvent.error);
                    }}
                  />
                  <View style={styles.imagePreviewOverlayIcon}>
                    <Ionicons name="eye" size={16} color="white" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
                {image.geotagged && (
                  <View style={styles.geotaggedIndicator}>
                    <Ionicons name="location" size={12} color="white" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  // Helper function to reset all forms
  // Ensure form data is properly initialized
  useEffect(() => {
    // Initialize activities object if it doesn't exist
    if (!formData.activities) {
      setFormData(prev => ({
        ...prev,
        activities: {
          extraction: false,
          disposition: false,
          processing: false
        }
      }));
    }
    
    // Initialize small scale mining activities if they don't exist
    if (!smallScaleMiningFormData.activities) {
      setSmallScaleMiningFormData(prev => ({
        ...prev,
        activities: {
          extraction: false,
          disposition: false,
          mineralProcessing: false,
          tunneling: false,
          shaftSinking: false,
          goldPanning: false,
          amalgamation: false,
          others: false
        },
        equipmentUsed: {
          extraction: '',
          disposition: '',
          mineralProcessing: ''
        }
      }));
    }
    
    // Initialize exploration activities if they don't exist
    if (!explorationFormData.activities) {
      setExplorationFormData(prev => ({
        ...prev,
        activities: {
          drilling: false,
          testPitting: false,
          trenching: false,
          shaftSinking: false,
          tunneling: false,
          others: false
        }
      }));
    }
  }, []);

  const resetAllForms = () => {
    setFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      hasSignboard: null,
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
      additionalInfo: '',
      nonOperatingObservations: {
        excavations: false,
        accessRoad: false,
        processingFacility: false
      },
      conductedInterview: null,
      guideQuestions: {
        recentActivity: '',
        excavationStart: '',
        transportVehicles: '',
        operatorName: '',
        operatorAddress: '',
        permits: ''
      }
    });

    setTransportFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      violationType: null,
      documentType: '',
      commodity: '',
      volumeWeight: '',
      unit: '',
      vehicleType: '',
      vehicleDescription: '',
      vehicleBodyColor: '',
      plateNumber: '',
      ownerOperator: '',
      ownerAddress: '',
      driver: '',
      driverAddress: '',
      sourceOfMaterials: '',
      actionsTaken: '',
      additionalInfo: ''
    });

    setProcessingFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      hasSignboard: null,
      projectName: '',
      siteStatus: 'Operating',
      facilityType: '',
      processingProducts: '',
      operatorName: '',
      operatorAddress: '',
      operatorDetermination: '',
      rawMaterialsName: '',
      rawMaterialsLocation: '',
      rawMaterialsDetermination: '',
      additionalInfo: ''
    });

    setTradingFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      violationType: true,
      businessName: '',
      businessOwner: '',
      businessLocation: '',
      commodity: '',
      sourceOfCommodityName: '',
      sourceOfCommodityLocation: '',
      sourceOfCommodityDetermination: '',
      stockpiledMaterials: null,
      dtiRegistration: null,
      additionalInfo: ''
    });

    setExplorationFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      hasSignboard: null,
      projectName: '',
      activities: {
        drilling: false,
        testPitting: false,
        trenching: false,
        shaftSinking: false,
        tunneling: false,
        others: false
      },
      othersActivity: '',
      operatorName: '',
      operatorAddress: '',
      operatorDetermination: '',
      additionalInfo: ''
    });

    setSmallScaleMiningFormData({
      latitude: '',
      longitude: '',
      location: '',
      date: '',
      time: '',
      hasSignboard: null,
      projectName: '',
      commodity: '',
      siteStatus: 'operating',
      activities: {
        extraction: false,
        disposition: false,
        mineralProcessing: false,
        tunneling: false,
        shaftSinking: false,
        goldPanning: false,
        amalgamation: false,
        others: false
      },
      equipmentUsed: {
        extraction: '',
        disposition: '',
        mineralProcessing: ''
      },
      othersActivity: '',
      operatorName: '',
      operatorAddress: '',
      operatorDetermination: '',
      observations: {
        excavations: false,
        stockpiles: false,
        tunnels: false,
        mineShafts: false,
        accessRoad: false,
        processingFacility: false
      },
      interviewConducted: false,
      interviewAnswers: {
        question1: '',
        question2: '',
        question3: '',
        question4: '',
        question5: '',
        question6: ''
      },
      additionalInfo: ''
    });
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
    // Use item.type for drafts, item.reportType for reports
    const reportType = item.type || item.reportType;
    const categoryTitle = getReportTypeTitle(reportType);
    const isDraft = activeTab === 'drafts' || item.status === 'draft';
    
    const handleCardPress = () => {
      if (isDraft) {
        // Show options: View Details or Edit
        Alert.alert(
          'Draft Options',
          'What would you like to do with this draft?',
          [
            {
              text: 'View Details',
              onPress: () => {
                setSelectedDraft(item);
                setShowDraftDetail(true);
              }
            },
            {
              text: 'Edit Draft',
              onPress: () => handleEditDraft(item)
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else {
        setSelectedReport(item);
        setShowReportDetail(true);
      }
    };
    
    return (
      <TouchableOpacity 
        style={styles.reportCard}
        onPress={handleCardPress}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>{categoryTitle}</Text>
            <View style={styles.cardBadges}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'draft') }]}>
                <Text style={styles.statusText}>{getStatusText(item.status || 'draft')}</Text>
              </View>
              {item.isOffline && (
                <View style={styles.offlineBadge}>
                  <Ionicons name="cloud-offline" size={10} color="white" />
                  <Text style={styles.offlineBadgeText}>Offline</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.cardInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>{item.reportId || 'Draft'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText} numberOfLines={2}>{item.location || 'No location specified'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{formatDate(item.submittedAt || item.createdAt)}</Text>
          </View>
          {item.submittedBy && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {typeof item.submittedBy === 'object' 
                  ? (item.submittedBy.email || item.submittedBy.completeName || item.submittedBy.username || 'Unknown User')
                  : item.submittedBy}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          {isDraft ? (
            <View style={styles.draftActions}>
              <Text style={styles.draftActionText}>Tap for options</Text>
              <Ionicons name="ellipsis-horizontal" size={16} color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.draftActions}>
              <Text style={styles.draftActionText}>Tap to view</Text>
              <Ionicons name="eye" size={16} color={COLORS.primary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const ReportDetailModal = () => {
    if (!selectedReport) return null;
    
    const renderReportTypeSpecificFields = () => {
      const reportType = selectedReport.reportType;
      
      // ILLEGAL MINING SPECIFIC FIELDS
      if (reportType === 'illegal_mining' && selectedReport.miningData) {
        return (
          <>
            {/* Project Information */}
            {selectedReport.projectInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Project Information</Text>
                <Text style={styles.detailLabel}>Project Information Board</Text>
                <Text style={styles.detailValue}>
                  {selectedReport.projectInfo.hasSignboard === 'yes' ? 'Yes' : 
                   selectedReport.projectInfo.hasSignboard === 'no' ? 'No' : 'Not Determined'}
                </Text>
                {selectedReport.projectInfo.projectName && (
                  <>
                    <Text style={styles.detailLabel}>Project Name</Text>
                    <Text style={styles.detailValue}>{selectedReport.projectInfo.projectName}</Text>
                  </>
                )}
              </View>
            )}
            
            {/* Operating Activities */}
            {selectedReport.miningData.operatingActivities && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Activities Observed</Text>
                {selectedReport.miningData.operatingActivities.extraction?.active && (
                  <>
                    <Text style={styles.detailLabel}>✓ Extraction</Text>
                    {selectedReport.miningData.operatingActivities.extraction.equipment?.length > 0 && (
                      <Text style={styles.detailValue}>Equipment: {selectedReport.miningData.operatingActivities.extraction.equipment.join(', ')}</Text>
                    )}
                  </>
                )}
                {selectedReport.miningData.operatingActivities.disposition?.active && (
                  <>
                    <Text style={styles.detailLabel}>✓ Disposition/Transportation</Text>
                    {selectedReport.miningData.operatingActivities.disposition.equipment?.length > 0 && (
                      <Text style={styles.detailValue}>Equipment: {selectedReport.miningData.operatingActivities.disposition.equipment.join(', ')}</Text>
                    )}
                  </>
                )}
                {selectedReport.miningData.operatingActivities.processing?.active && (
                  <>
                    <Text style={styles.detailLabel}>✓ Mineral Processing</Text>
                    {selectedReport.miningData.operatingActivities.processing.equipment?.length > 0 && (
                      <Text style={styles.detailValue}>Equipment: {selectedReport.miningData.operatingActivities.processing.equipment.join(', ')}</Text>
                    )}
                  </>
                )}
              </View>
            )}
            
            {/* Non-Operating Observations */}
            {selectedReport.miningData.nonOperatingObservations && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Observations in the Area</Text>
                {selectedReport.miningData.nonOperatingObservations.excavations && (
                  <Text style={styles.detailLabel}>✓ Excavations</Text>
                )}
                {selectedReport.miningData.nonOperatingObservations.accessRoad && (
                  <Text style={styles.detailLabel}>✓ Access Road for Transport</Text>
                )}
                {selectedReport.miningData.nonOperatingObservations.processingFacility && (
                  <Text style={styles.detailLabel}>✓ Mineral Processing Facility</Text>
                )}
              </View>
            )}
            
            {/* Interview */}
            {selectedReport.miningData.interview?.conducted && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Community Interview</Text>
                <Text style={styles.detailLabel}>Interview Conducted: Yes</Text>
                {selectedReport.miningData.interview.responses?.recentActivity && (
                  <>
                    <Text style={styles.detailLabel}>Recent Activity</Text>
                    <Text style={styles.detailValue}>{selectedReport.miningData.interview.responses.recentActivity}</Text>
                  </>
                )}
                {selectedReport.miningData.interview.responses?.excavationStart && (
                  <>
                    <Text style={styles.detailLabel}>Excavation Start</Text>
                    <Text style={styles.detailValue}>{selectedReport.miningData.interview.responses.excavationStart}</Text>
                  </>
                )}
                {selectedReport.miningData.interview.responses?.transportVehicles && (
                  <>
                    <Text style={styles.detailLabel}>Transport Vehicles</Text>
                    <Text style={styles.detailValue}>{selectedReport.miningData.interview.responses.transportVehicles}</Text>
                  </>
                )}
                {selectedReport.miningData.interview.responses?.operatorName && (
                  <>
                    <Text style={styles.detailLabel}>Operator Name (from interview)</Text>
                    <Text style={styles.detailValue}>{selectedReport.miningData.interview.responses.operatorName}</Text>
                  </>
                )}
                {selectedReport.miningData.interview.responses?.operatorAddress && (
                  <>
                    <Text style={styles.detailLabel}>Operator Address (from interview)</Text>
                    <Text style={styles.detailValue}>{selectedReport.miningData.interview.responses.operatorAddress}</Text>
                  </>
                )}
                {selectedReport.miningData.interview.responses?.permits && (
                  <>
                    <Text style={styles.detailLabel}>Permits Information</Text>
                    <Text style={styles.detailValue}>{selectedReport.miningData.interview.responses.permits}</Text>
                  </>
                )}
              </View>
            )}
          </>
        );
      }
      
      // ILLEGAL TRANSPORTATION SPECIFIC FIELDS
      if (reportType === 'illegal_transport' && selectedReport.transportData) {
        return (
          <>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Violation Details</Text>
              <Text style={styles.detailLabel}>Type of Violation</Text>
              <Text style={styles.detailValue}>
                {selectedReport.transportData.violationType === 'absence' ? 'Absence of Transport Documents' :
                 selectedReport.transportData.violationType === 'outdated' ? 'Outdated Transport Document' :
                 selectedReport.transportData.violationType === 'fraudulent' ? 'Fraudulent Transport Document' : 'Not specified'}
              </Text>
              {selectedReport.transportData.documentType && (
                <>
                  <Text style={styles.detailLabel}>Document Type</Text>
                  <Text style={styles.detailValue}>{selectedReport.transportData.documentType}</Text>
                </>
              )}
            </View>
            
            {selectedReport.transportData.materialInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Material Information</Text>
                {selectedReport.transportData.materialInfo.volumeWeight && (
                  <>
                    <Text style={styles.detailLabel}>Volume/Weight</Text>
                    <Text style={styles.detailValue}>{selectedReport.transportData.materialInfo.volumeWeight}</Text>
                  </>
                )}
                {selectedReport.transportData.materialInfo.unit && (
                  <>
                    <Text style={styles.detailLabel}>Unit</Text>
                    <Text style={styles.detailValue}>{selectedReport.transportData.materialInfo.unit}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedReport.transportData.vehicleInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Vehicle Information</Text>
                {selectedReport.transportData.vehicleInfo.type && (
                  <>
                    <Text style={styles.detailLabel}>Vehicle Type</Text>
                    <Text style={styles.detailValue}>{selectedReport.transportData.vehicleInfo.type}</Text>
                  </>
                )}
                {selectedReport.transportData.vehicleInfo.description && (
                  <>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{selectedReport.transportData.vehicleInfo.description}</Text>
                  </>
                )}
                {selectedReport.transportData.vehicleInfo.bodyColor && (
                  <>
                    <Text style={styles.detailLabel}>Body Color</Text>
                    <Text style={styles.detailValue}>{selectedReport.transportData.vehicleInfo.bodyColor}</Text>
                  </>
                )}
                {selectedReport.transportData.vehicleInfo.plateNumber && (
                  <>
                    <Text style={styles.detailLabel}>Plate Number</Text>
                    <Text style={styles.detailValue}>{selectedReport.transportData.vehicleInfo.plateNumber}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedReport.transportData.ownerOperator && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Owner/Operator</Text>
                {selectedReport.transportData.ownerOperator.name && (
                  <>
                    <Text style={styles.detailLabel}>Name</Text>
                    <Text style={styles.detailValue}>{selectedReport.transportData.ownerOperator.name}</Text>
                  </>
                )}
                {selectedReport.transportData.ownerOperator.address && (
                  <>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{selectedReport.transportData.ownerOperator.address}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedReport.transportData.driver && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Driver Information</Text>
                {selectedReport.transportData.driver.name && (
                  <>
                    <Text style={styles.detailLabel}>Name</Text>
                    <Text style={styles.detailValue}>{selectedReport.transportData.driver.name}</Text>
                  </>
                )}
                {selectedReport.transportData.driver.address && (
                  <>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{selectedReport.transportData.driver.address}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedReport.transportData.sourceOfMaterials && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Source of Materials</Text>
                <Text style={styles.detailValue}>{selectedReport.transportData.sourceOfMaterials}</Text>
              </View>
            )}
            
            {selectedReport.transportData.actionsTaken && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Actions Taken</Text>
                <Text style={styles.detailValue}>{selectedReport.transportData.actionsTaken}</Text>
              </View>
            )}
          </>
        );
      }
      
      // ILLEGAL PROCESSING SPECIFIC FIELDS
      if (reportType === 'illegal_processing' && selectedReport.processingData) {
        return (
          <>
            {selectedReport.processingData.facilityInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Facility Information</Text>
                {selectedReport.processingData.facilityInfo.type && (
                  <>
                    <Text style={styles.detailLabel}>Facility Type</Text>
                    <Text style={styles.detailValue}>{selectedReport.processingData.facilityInfo.type}</Text>
                  </>
                )}
                {selectedReport.processingData.facilityInfo.processingProducts && (
                  <>
                    <Text style={styles.detailLabel}>Processing Products</Text>
                    <Text style={styles.detailValue}>{selectedReport.processingData.facilityInfo.processingProducts}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedReport.processingData.rawMaterials && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Raw Materials Source</Text>
                {selectedReport.processingData.rawMaterials.sourceName && (
                  <>
                    <Text style={styles.detailLabel}>Source Name</Text>
                    <Text style={styles.detailValue}>{selectedReport.processingData.rawMaterials.sourceName}</Text>
                  </>
                )}
                {selectedReport.processingData.rawMaterials.sourceLocation && (
                  <>
                    <Text style={styles.detailLabel}>Source Location</Text>
                    <Text style={styles.detailValue}>{selectedReport.processingData.rawMaterials.sourceLocation}</Text>
                  </>
                )}
                {selectedReport.processingData.rawMaterials.determinationMethod && (
                  <>
                    <Text style={styles.detailLabel}>How Determined</Text>
                    <Text style={styles.detailValue}>{selectedReport.processingData.rawMaterials.determinationMethod}</Text>
                  </>
                )}
              </View>
            )}
          </>
        );
      }
      
      // ILLEGAL TRADING SPECIFIC FIELDS
      if (reportType === 'illegal_trading' && selectedReport.tradingData) {
        return (
          <>
            {selectedReport.tradingData.businessInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Business Information</Text>
                {selectedReport.tradingData.businessInfo.name && (
                  <>
                    <Text style={styles.detailLabel}>Business Name</Text>
                    <Text style={styles.detailValue}>{selectedReport.tradingData.businessInfo.name}</Text>
                  </>
                )}
                {selectedReport.tradingData.businessInfo.owner && (
                  <>
                    <Text style={styles.detailLabel}>Owner</Text>
                    <Text style={styles.detailValue}>{selectedReport.tradingData.businessInfo.owner}</Text>
                  </>
                )}
                {selectedReport.tradingData.businessInfo.location && (
                  <>
                    <Text style={styles.detailLabel}>Business Location</Text>
                    <Text style={styles.detailValue}>{selectedReport.tradingData.businessInfo.location}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedReport.tradingData.commoditySource && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Commodity Source</Text>
                {selectedReport.tradingData.commoditySource.name && (
                  <>
                    <Text style={styles.detailLabel}>Source Name</Text>
                    <Text style={styles.detailValue}>{selectedReport.tradingData.commoditySource.name}</Text>
                  </>
                )}
                {selectedReport.tradingData.commoditySource.location && (
                  <>
                    <Text style={styles.detailLabel}>Source Location</Text>
                    <Text style={styles.detailValue}>{selectedReport.tradingData.commoditySource.location}</Text>
                  </>
                )}
                {selectedReport.tradingData.commoditySource.determinationMethod && (
                  <>
                    <Text style={styles.detailLabel}>How Determined</Text>
                    <Text style={styles.detailValue}>{selectedReport.tradingData.commoditySource.determinationMethod}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedReport.tradingData.stockpiledMaterials && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Stockpiled Materials</Text>
                <Text style={styles.detailValue}>
                  {selectedReport.tradingData.stockpiledMaterials === 'yes' ? 'Yes' :
                   selectedReport.tradingData.stockpiledMaterials === 'no' ? 'No' : 'Not Determined'}
                </Text>
              </View>
            )}
            
            {selectedReport.tradingData.dtiRegistration && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>DTI Registration</Text>
                <Text style={styles.detailValue}>
                  {selectedReport.tradingData.dtiRegistration === 'yes' ? 'Yes' :
                   selectedReport.tradingData.dtiRegistration === 'no' ? 'No' : 'Not Determined'}
                </Text>
              </View>
            )}
          </>
        );
      }
      
      // ILLEGAL EXPLORATION SPECIFIC FIELDS
      if (reportType === 'illegal_exploration' && selectedReport.explorationData) {
        return (
          <>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Exploration Activities</Text>
              {selectedReport.explorationData.activities?.drilling && (
                <Text style={styles.detailLabel}>✓ Drilling</Text>
              )}
              {selectedReport.explorationData.activities?.testPitting && (
                <Text style={styles.detailLabel}>✓ Test Pitting</Text>
              )}
              {selectedReport.explorationData.activities?.trenching && (
                <Text style={styles.detailLabel}>✓ Trenching</Text>
              )}
              {selectedReport.explorationData.activities?.shaftSinking && (
                <Text style={styles.detailLabel}>✓ Shaft Sinking</Text>
              )}
              {selectedReport.explorationData.activities?.tunneling && (
                <Text style={styles.detailLabel}>✓ Tunneling</Text>
              )}
              {selectedReport.explorationData.activities?.others && (
                <>
                  <Text style={styles.detailLabel}>✓ Others</Text>
                  {selectedReport.explorationData.othersActivity && (
                    <Text style={styles.detailValue}>{selectedReport.explorationData.othersActivity}</Text>
                  )}
                </>
              )}
            </View>
          </>
        );
      }
      
      // ILLEGAL SMALL-SCALE MINING SPECIFIC FIELDS
      if (reportType === 'illegal_smallscale' && selectedReport.smallScaleData) {
        return (
          <>
            {selectedReport.smallScaleData.operatingActivities && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Operating Activities</Text>
                {selectedReport.smallScaleData.operatingActivities.extraction && (
                  <>
                    <Text style={styles.detailLabel}>✓ Extraction</Text>
                    {selectedReport.smallScaleData.equipmentUsed?.extraction && (
                      <Text style={styles.detailValue}>Equipment: {selectedReport.smallScaleData.equipmentUsed.extraction}</Text>
                    )}
                  </>
                )}
                {selectedReport.smallScaleData.operatingActivities.disposition && (
                  <>
                    <Text style={styles.detailLabel}>✓ Disposition</Text>
                    {selectedReport.smallScaleData.equipmentUsed?.disposition && (
                      <Text style={styles.detailValue}>Equipment: {selectedReport.smallScaleData.equipmentUsed.disposition}</Text>
                    )}
                  </>
                )}
                {selectedReport.smallScaleData.operatingActivities.mineralProcessing && (
                  <>
                    <Text style={styles.detailLabel}>✓ Mineral Processing</Text>
                    {selectedReport.smallScaleData.equipmentUsed?.mineralProcessing && (
                      <Text style={styles.detailValue}>Equipment: {selectedReport.smallScaleData.equipmentUsed.mineralProcessing}</Text>
                    )}
                  </>
                )}
                {selectedReport.smallScaleData.operatingActivities.tunneling && (
                  <Text style={styles.detailLabel}>✓ Tunneling</Text>
                )}
                {selectedReport.smallScaleData.operatingActivities.shaftSinking && (
                  <Text style={styles.detailLabel}>✓ Shaft Sinking</Text>
                )}
                {selectedReport.smallScaleData.operatingActivities.goldPanning && (
                  <Text style={styles.detailLabel}>✓ Gold Panning</Text>
                )}
                {selectedReport.smallScaleData.operatingActivities.amalgamation && (
                  <Text style={styles.detailLabel}>✓ Amalgamation</Text>
                )}
                {selectedReport.smallScaleData.operatingActivities.others && (
                  <>
                    <Text style={styles.detailLabel}>✓ Others</Text>
                    {selectedReport.smallScaleData.othersActivity && (
                      <Text style={styles.detailValue}>{selectedReport.smallScaleData.othersActivity}</Text>
                    )}
                  </>
                )}
              </View>
            )}
            
            {selectedReport.smallScaleData.nonOperatingObservations && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Observations</Text>
                {selectedReport.smallScaleData.nonOperatingObservations.excavations && (
                  <Text style={styles.detailLabel}>✓ Excavations</Text>
                )}
                {selectedReport.smallScaleData.nonOperatingObservations.stockpiles && (
                  <Text style={styles.detailLabel}>✓ Stockpiles</Text>
                )}
                {selectedReport.smallScaleData.nonOperatingObservations.tunnels && (
                  <Text style={styles.detailLabel}>✓ Tunnels</Text>
                )}
                {selectedReport.smallScaleData.nonOperatingObservations.mineShafts && (
                  <Text style={styles.detailLabel}>✓ Mine Shafts</Text>
                )}
                {selectedReport.smallScaleData.nonOperatingObservations.accessRoad && (
                  <Text style={styles.detailLabel}>✓ Access Road</Text>
                )}
                {selectedReport.smallScaleData.nonOperatingObservations.processingFacility && (
                  <Text style={styles.detailLabel}>✓ Processing Facility</Text>
                )}
              </View>
            )}
            
            {selectedReport.smallScaleData.interview?.conducted && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Community Interview</Text>
                <Text style={styles.detailLabel}>Interview Conducted: Yes</Text>
                {selectedReport.smallScaleData.interview.responses?.question1 && (
                  <>
                    <Text style={styles.detailLabel}>Question 1</Text>
                    <Text style={styles.detailValue}>{selectedReport.smallScaleData.interview.responses.question1}</Text>
                  </>
                )}
                {selectedReport.smallScaleData.interview.responses?.question2 && (
                  <>
                    <Text style={styles.detailLabel}>Question 2</Text>
                    <Text style={styles.detailValue}>{selectedReport.smallScaleData.interview.responses.question2}</Text>
                  </>
                )}
                {selectedReport.smallScaleData.interview.responses?.question3 && (
                  <>
                    <Text style={styles.detailLabel}>Question 3</Text>
                    <Text style={styles.detailValue}>{selectedReport.smallScaleData.interview.responses.question3}</Text>
                  </>
                )}
                {selectedReport.smallScaleData.interview.responses?.question4 && (
                  <>
                    <Text style={styles.detailLabel}>Question 4</Text>
                    <Text style={styles.detailValue}>{selectedReport.smallScaleData.interview.responses.question4}</Text>
                  </>
                )}
                {selectedReport.smallScaleData.interview.responses?.question5 && (
                  <>
                    <Text style={styles.detailLabel}>Question 5</Text>
                    <Text style={styles.detailValue}>{selectedReport.smallScaleData.interview.responses.question5}</Text>
                  </>
                )}
                {selectedReport.smallScaleData.interview.responses?.question6 && (
                  <>
                    <Text style={styles.detailLabel}>Question 6</Text>
                    <Text style={styles.detailValue}>{selectedReport.smallScaleData.interview.responses.question6}</Text>
                  </>
                )}
              </View>
            )}
          </>
        );
      }
      
      return null;
    };
    
    return (
      <Modal visible={showReportDetail} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => setShowReportDetail(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.detailScrollView}>
              {/* Report Type */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Report Type</Text>
                <Text style={styles.detailValue}>{getReportTypeTitle(selectedReport.reportType)}</Text>
              </View>
              
              {/* Status */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(selectedReport.status)}</Text>
                </View>
              </View>
              
              {/* Report ID */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Report ID</Text>
                <Text style={styles.detailValue}>{selectedReport.reportId}</Text>
              </View>
              
              {/* Location */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{selectedReport.location}</Text>
              </View>
              
              {/* GPS Coordinates */}
              {selectedReport.gpsLocation && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>GPS Coordinates</Text>
                  <Text style={styles.detailValue}>
                    Lat: {selectedReport.gpsLocation.latitude}, Lng: {selectedReport.gpsLocation.longitude}
                  </Text>
                </View>
              )}
              
              {/* Date & Time */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Incident Date & Time</Text>
                <Text style={styles.detailValue}>
                  {selectedReport.incidentDate} at {selectedReport.incidentTime}
                </Text>
              </View>
              
              {/* Commodity */}
              {selectedReport.commodity && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Commodity</Text>
                  <Text style={styles.detailValue}>{selectedReport.commodity}</Text>
                </View>
              )}
              
              {/* Site Status */}
              {selectedReport.siteStatus && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Site Status</Text>
                  <Text style={styles.detailValue}>
                    {selectedReport.siteStatus === 'operating' ? 'Operating' :
                     selectedReport.siteStatus === 'non_operating' ? 'Non-Operating' : 
                     selectedReport.siteStatus === 'under_construction' ? 'Under Construction' : selectedReport.siteStatus}
                  </Text>
                </View>
              )}
              
              {/* Operator Information */}
              {selectedReport.operatorInfo && (selectedReport.operatorInfo.name || selectedReport.operatorInfo.address) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Operator Information</Text>
                  {selectedReport.operatorInfo.name && (
                    <>
                      <Text style={styles.detailLabel}>Name</Text>
                      <Text style={styles.detailValue}>{selectedReport.operatorInfo.name}</Text>
                    </>
                  )}
                  {selectedReport.operatorInfo.address && (
                    <>
                      <Text style={styles.detailLabel}>Address</Text>
                      <Text style={styles.detailValue}>{selectedReport.operatorInfo.address}</Text>
                    </>
                  )}
                  {selectedReport.operatorInfo.determinationMethod && (
                    <>
                      <Text style={styles.detailLabel}>How Determined</Text>
                      <Text style={styles.detailValue}>{selectedReport.operatorInfo.determinationMethod}</Text>
                    </>
                  )}
                </View>
              )}
              
              {/* Report Type Specific Fields */}
              {renderReportTypeSpecificFields()}
              
              {/* Additional Information */}
              {selectedReport.additionalInfo && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Additional Information</Text>
                  <Text style={styles.detailValue}>{selectedReport.additionalInfo}</Text>
                </View>
              )}
              
              {/* Submitted By */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Submitted By</Text>
                <Text style={styles.detailValue}>
                  {typeof selectedReport.submittedBy === 'object'
                    ? `${selectedReport.submittedBy.completeName || selectedReport.submittedBy.username || 'Unknown User'} (${selectedReport.submittedBy.email || 'No email'})`
                    : selectedReport.submittedBy}
                </Text>
              </View>
              
              {/* Submitted Date */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Submitted Date</Text>
                <Text style={styles.detailValue}>{formatDate(selectedReport.submittedAt || selectedReport.createdAt)}</Text>
              </View>
              
              {/* Attachments */}
              {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Attachments ({selectedReport.attachments.length})</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentScrollView}>
                    {selectedReport.attachments.map((attachment, index) => (
                      <TouchableOpacity
                        key={attachment.id || `attachment_${index}_${attachment.url || index}`}
                        style={styles.attachmentThumbnail}
                        onPress={() => openImagePreview(selectedReport.attachments, index)}
                      >
                        <Image 
                          source={{ uri: attachment.url || attachment.uri || attachment.preview }} 
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                          onError={(error) => {
                            console.log('Report image load error:', error.nativeEvent.error);
                          }}
                        />
                        <View style={styles.thumbnailOverlay}>
                          <Ionicons name="eye" size={16} color="white" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity 
                    style={styles.viewAllImagesButton}
                    onPress={() => openImagePreview(selectedReport.attachments, 0)}
                  >
                    <Ionicons name="images" size={16} color={COLORS.primary} />
                    <Text style={styles.viewAllImagesText}>View All Images</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  const DraftDetailModal = () => {
    if (!selectedDraft) return null;
    
    const renderDraftTypeSpecificFields = () => {
      const reportType = selectedDraft.reportType;
      
      // ILLEGAL MINING SPECIFIC FIELDS
      if (reportType === 'illegal_mining' && selectedDraft.miningData) {
        return (
          <>
            {/* Project Information */}
            {selectedDraft.projectInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Project Information</Text>
                <Text style={styles.detailLabel}>Project Information Board</Text>
                <Text style={styles.detailValue}>
                  {selectedDraft.projectInfo.hasSignboard === 'yes' ? 'Yes' : 
                   selectedDraft.projectInfo.hasSignboard === 'no' ? 'No' : 'Not Determined'}
                </Text>
                {selectedDraft.projectInfo.projectName && (
                  <>
                    <Text style={styles.detailLabel}>Project Name</Text>
                    <Text style={styles.detailValue}>{selectedDraft.projectInfo.projectName}</Text>
                  </>
                )}
              </View>
            )}
            
            {/* Operating Activities */}
            {selectedDraft.miningData.operatingActivities && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Activities Observed</Text>
                {selectedDraft.miningData.operatingActivities.extraction?.active && (
                  <>
                    <Text style={styles.detailLabel}>✓ Extraction</Text>
                    {selectedDraft.miningData.operatingActivities.extraction.equipment?.length > 0 && (
                      <Text style={styles.detailValue}>Equipment: {selectedDraft.miningData.operatingActivities.extraction.equipment.join(', ')}</Text>
                    )}
                  </>
                )}
                {selectedDraft.miningData.operatingActivities.disposition?.active && (
                  <>
                    <Text style={styles.detailLabel}>✓ Disposition/Transportation</Text>
                    {selectedDraft.miningData.operatingActivities.disposition.equipment?.length > 0 && (
                      <Text style={styles.detailValue}>Equipment: {selectedDraft.miningData.operatingActivities.disposition.equipment.join(', ')}</Text>
                    )}
                  </>
                )}
                {selectedDraft.miningData.operatingActivities.processing?.active && (
                  <>
                    <Text style={styles.detailLabel}>✓ Mineral Processing</Text>
                    {selectedDraft.miningData.operatingActivities.processing.equipment?.length > 0 && (
                      <Text style={styles.detailValue}>Equipment: {selectedDraft.miningData.operatingActivities.processing.equipment.join(', ')}</Text>
                    )}
                  </>
                )}
              </View>
            )}
            
            {/* Non-Operating Observations */}
            {selectedDraft.miningData.nonOperatingObservations && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Observations in the Area</Text>
                {selectedDraft.miningData.nonOperatingObservations.excavations && (
                  <Text style={styles.detailLabel}>✓ Excavations</Text>
                )}
                {selectedDraft.miningData.nonOperatingObservations.accessRoad && (
                  <Text style={styles.detailLabel}>✓ Access Road for Transport</Text>
                )}
                {selectedDraft.miningData.nonOperatingObservations.processingFacility && (
                  <Text style={styles.detailLabel}>✓ Mineral Processing Facility</Text>
                )}
              </View>
            )}
            
            {/* Interview */}
            {selectedDraft.miningData.interview?.conducted && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Community Interview</Text>
                <Text style={styles.detailLabel}>Interview Conducted: Yes</Text>
                {selectedDraft.miningData.interview.responses?.recentActivity && (
                  <>
                    <Text style={styles.detailLabel}>Recent Activity</Text>
                    <Text style={styles.detailValue}>{selectedDraft.miningData.interview.responses.recentActivity}</Text>
                  </>
                )}
                {selectedDraft.miningData.interview.responses?.excavationStart && (
                  <>
                    <Text style={styles.detailLabel}>Excavation Start</Text>
                    <Text style={styles.detailValue}>{selectedDraft.miningData.interview.responses.excavationStart}</Text>
                  </>
                )}
                {selectedDraft.miningData.interview.responses?.transportVehicles && (
                  <>
                    <Text style={styles.detailLabel}>Transport Vehicles</Text>
                    <Text style={styles.detailValue}>{selectedDraft.miningData.interview.responses.transportVehicles}</Text>
                  </>
                )}
                {selectedDraft.miningData.interview.responses?.operatorName && (
                  <>
                    <Text style={styles.detailLabel}>Operator Name (from interview)</Text>
                    <Text style={styles.detailValue}>{selectedDraft.miningData.interview.responses.operatorName}</Text>
                  </>
                )}
                {selectedDraft.miningData.interview.responses?.operatorAddress && (
                  <>
                    <Text style={styles.detailLabel}>Operator Address (from interview)</Text>
                    <Text style={styles.detailValue}>{selectedDraft.miningData.interview.responses.operatorAddress}</Text>
                  </>
                )}
                {selectedDraft.miningData.interview.responses?.permits && (
                  <>
                    <Text style={styles.detailLabel}>Permits Information</Text>
                    <Text style={styles.detailValue}>{selectedDraft.miningData.interview.responses.permits}</Text>
                  </>
                )}
              </View>
            )}
          </>
        );
      }
      
      // ILLEGAL TRANSPORTATION SPECIFIC FIELDS
      if (reportType === 'illegal_transport' && selectedDraft.transportData) {
        return (
          <>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Violation Details</Text>
              <Text style={styles.detailLabel}>Type of Violation</Text>
              <Text style={styles.detailValue}>
                {selectedDraft.transportData.violationType === 'absence' ? 'Absence of Transport Documents' :
                 selectedDraft.transportData.violationType === 'outdated' ? 'Outdated Transport Document' :
                 selectedDraft.transportData.violationType === 'fraudulent' ? 'Fraudulent Transport Document' : 'Not specified'}
              </Text>
              {selectedDraft.transportData.documentType && (
                <>
                  <Text style={styles.detailLabel}>Document Type</Text>
                  <Text style={styles.detailValue}>{selectedDraft.transportData.documentType}</Text>
                </>
              )}
            </View>
            
            {selectedDraft.transportData.materialInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Material Information</Text>
                {selectedDraft.transportData.materialInfo.volumeWeight && (
                  <>
                    <Text style={styles.detailLabel}>Volume/Weight</Text>
                    <Text style={styles.detailValue}>{selectedDraft.transportData.materialInfo.volumeWeight}</Text>
                  </>
                )}
                {selectedDraft.transportData.materialInfo.unit && (
                  <>
                    <Text style={styles.detailLabel}>Unit</Text>
                    <Text style={styles.detailValue}>{selectedDraft.transportData.materialInfo.unit}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedDraft.transportData.vehicleInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Vehicle Information</Text>
                {selectedDraft.transportData.vehicleInfo.type && (
                  <>
                    <Text style={styles.detailLabel}>Vehicle Type</Text>
                    <Text style={styles.detailValue}>{selectedDraft.transportData.vehicleInfo.type}</Text>
                  </>
                )}
                {selectedDraft.transportData.vehicleInfo.description && (
                  <>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{selectedDraft.transportData.vehicleInfo.description}</Text>
                  </>
                )}
                {selectedDraft.transportData.vehicleInfo.bodyColor && (
                  <>
                    <Text style={styles.detailLabel}>Body Color</Text>
                    <Text style={styles.detailValue}>{selectedDraft.transportData.vehicleInfo.bodyColor}</Text>
                  </>
                )}
                {selectedDraft.transportData.vehicleInfo.plateNumber && (
                  <>
                    <Text style={styles.detailLabel}>Plate Number</Text>
                    <Text style={styles.detailValue}>{selectedDraft.transportData.vehicleInfo.plateNumber}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedDraft.transportData.ownerOperator && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Owner/Operator</Text>
                {selectedDraft.transportData.ownerOperator.name && (
                  <>
                    <Text style={styles.detailLabel}>Name</Text>
                    <Text style={styles.detailValue}>{selectedDraft.transportData.ownerOperator.name}</Text>
                  </>
                )}
                {selectedDraft.transportData.ownerOperator.address && (
                  <>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{selectedDraft.transportData.ownerOperator.address}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedDraft.transportData.driver && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Driver Information</Text>
                {selectedDraft.transportData.driver.name && (
                  <>
                    <Text style={styles.detailLabel}>Name</Text>
                    <Text style={styles.detailValue}>{selectedDraft.transportData.driver.name}</Text>
                  </>
                )}
                {selectedDraft.transportData.driver.address && (
                  <>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{selectedDraft.transportData.driver.address}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedDraft.transportData.sourceOfMaterials && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Source of Materials</Text>
                <Text style={styles.detailValue}>{selectedDraft.transportData.sourceOfMaterials}</Text>
              </View>
            )}
            
            {selectedDraft.transportData.actionsTaken && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Actions Taken</Text>
                <Text style={styles.detailValue}>{selectedDraft.transportData.actionsTaken}</Text>
              </View>
            )}
          </>
        );
      }
      
      // ILLEGAL PROCESSING SPECIFIC FIELDS
      if (reportType === 'illegal_processing' && selectedDraft.processingData) {
        return (
          <>
            {selectedDraft.processingData.facilityInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Facility Information</Text>
                {selectedDraft.processingData.facilityInfo.type && (
                  <>
                    <Text style={styles.detailLabel}>Facility Type</Text>
                    <Text style={styles.detailValue}>{selectedDraft.processingData.facilityInfo.type}</Text>
                  </>
                )}
                {selectedDraft.processingData.facilityInfo.processingProducts && (
                  <>
                    <Text style={styles.detailLabel}>Processing Products</Text>
                    <Text style={styles.detailValue}>{selectedDraft.processingData.facilityInfo.processingProducts}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedDraft.processingData.rawMaterials && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Raw Materials Source</Text>
                {selectedDraft.processingData.rawMaterials.sourceName && (
                  <>
                    <Text style={styles.detailLabel}>Source Name</Text>
                    <Text style={styles.detailValue}>{selectedDraft.processingData.rawMaterials.sourceName}</Text>
                  </>
                )}
                {selectedDraft.processingData.rawMaterials.sourceLocation && (
                  <>
                    <Text style={styles.detailLabel}>Source Location</Text>
                    <Text style={styles.detailValue}>{selectedDraft.processingData.rawMaterials.sourceLocation}</Text>
                  </>
                )}
                {selectedDraft.processingData.rawMaterials.determinationMethod && (
                  <>
                    <Text style={styles.detailLabel}>How Determined</Text>
                    <Text style={styles.detailValue}>{selectedDraft.processingData.rawMaterials.determinationMethod}</Text>
                  </>
                )}
              </View>
            )}
          </>
        );
      }
      
      // ILLEGAL TRADING SPECIFIC FIELDS
      if (reportType === 'illegal_trading' && selectedDraft.tradingData) {
        return (
          <>
            {selectedDraft.tradingData.businessInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Business Information</Text>
                {selectedDraft.tradingData.businessInfo.name && (
                  <>
                    <Text style={styles.detailLabel}>Business Name</Text>
                    <Text style={styles.detailValue}>{selectedDraft.tradingData.businessInfo.name}</Text>
                  </>
                )}
                {selectedDraft.tradingData.businessInfo.owner && (
                  <>
                    <Text style={styles.detailLabel}>Owner</Text>
                    <Text style={styles.detailValue}>{selectedDraft.tradingData.businessInfo.owner}</Text>
                  </>
                )}
                {selectedDraft.tradingData.businessInfo.location && (
                  <>
                    <Text style={styles.detailLabel}>Business Location</Text>
                    <Text style={styles.detailValue}>{selectedDraft.tradingData.businessInfo.location}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedDraft.tradingData.commoditySource && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Commodity Source</Text>
                {selectedDraft.tradingData.commoditySource.name && (
                  <>
                    <Text style={styles.detailLabel}>Source Name</Text>
                    <Text style={styles.detailValue}>{selectedDraft.tradingData.commoditySource.name}</Text>
                  </>
                )}
                {selectedDraft.tradingData.commoditySource.location && (
                  <>
                    <Text style={styles.detailLabel}>Source Location</Text>
                    <Text style={styles.detailValue}>{selectedDraft.tradingData.commoditySource.location}</Text>
                  </>
                )}
                {selectedDraft.tradingData.commoditySource.determinationMethod && (
                  <>
                    <Text style={styles.detailLabel}>How Determined</Text>
                    <Text style={styles.detailValue}>{selectedDraft.tradingData.commoditySource.determinationMethod}</Text>
                  </>
                )}
              </View>
            )}
            
            {selectedDraft.tradingData.stockpiledMaterials && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Stockpiled Materials</Text>
                <Text style={styles.detailValue}>
                  {selectedDraft.tradingData.stockpiledMaterials === 'yes' ? 'Yes' :
                   selectedDraft.tradingData.stockpiledMaterials === 'no' ? 'No' : 'Not Determined'}
                </Text>
              </View>
            )}
            
            {selectedDraft.tradingData.dtiRegistration && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>DTI Registration</Text>
                <Text style={styles.detailValue}>
                  {selectedDraft.tradingData.dtiRegistration === 'yes' ? 'Yes' :
                   selectedDraft.tradingData.dtiRegistration === 'no' ? 'No' : 'Not Determined'}
                </Text>
              </View>
            )}
          </>
        );
      }
      
      // ILLEGAL EXPLORATION SPECIFIC FIELDS
      if (reportType === 'illegal_exploration' && selectedDraft.explorationData) {
        return (
          <>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Exploration Activities</Text>
              {selectedDraft.explorationData.activities?.drilling && (
                <Text style={styles.detailLabel}>✓ Drilling</Text>
              )}
              {selectedDraft.explorationData.activities?.testPitting && (
                <Text style={styles.detailLabel}>✓ Test Pitting</Text>
              )}
              {selectedDraft.explorationData.activities?.trenching && (
                <Text style={styles.detailLabel}>✓ Trenching</Text>
              )}
              {selectedDraft.explorationData.activities?.shaftSinking && (
                <Text style={styles.detailLabel}>✓ Shaft Sinking</Text>
              )}
              {selectedDraft.explorationData.activities?.tunneling && (
                <Text style={styles.detailLabel}>✓ Tunneling</Text>
              )}
              {selectedDraft.explorationData.activities?.others && (
                <>
                  <Text style={styles.detailLabel}>✓ Others</Text>
                  {selectedDraft.explorationData.othersActivity && (
                    <Text style={styles.detailValue}>{selectedDraft.explorationData.othersActivity}</Text>
                  )}
                </>
              )}
            </View>
          </>
        );
      }
      
      // ILLEGAL SMALL-SCALE MINING SPECIFIC FIELDS
      if (reportType === 'illegal_smallscale' && selectedDraft.smallScaleData) {
        return (
          <>
            {selectedDraft.smallScaleData.operatingActivities && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Operating Activities</Text>
                {selectedDraft.smallScaleData.operatingActivities.extraction && (
                  <>
                    <Text style={styles.detailLabel}>✓ Extraction</Text>
                    {selectedDraft.smallScaleData.equipmentUsed?.extraction && (
                      <Text style={styles.detailValue}>Equipment: {selectedDraft.smallScaleData.equipmentUsed.extraction}</Text>
                    )}
                  </>
                )}
                {selectedDraft.smallScaleData.operatingActivities.disposition && (
                  <>
                    <Text style={styles.detailLabel}>✓ Disposition</Text>
                    {selectedDraft.smallScaleData.equipmentUsed?.disposition && (
                      <Text style={styles.detailValue}>Equipment: {selectedDraft.smallScaleData.equipmentUsed.disposition}</Text>
                    )}
                  </>
                )}
                {selectedDraft.smallScaleData.operatingActivities.mineralProcessing && (
                  <>
                    <Text style={styles.detailLabel}>✓ Mineral Processing</Text>
                    {selectedDraft.smallScaleData.equipmentUsed?.mineralProcessing && (
                      <Text style={styles.detailValue}>Equipment: {selectedDraft.smallScaleData.equipmentUsed.mineralProcessing}</Text>
                    )}
                  </>
                )}
                {selectedDraft.smallScaleData.operatingActivities.tunneling && (
                  <Text style={styles.detailLabel}>✓ Tunneling</Text>
                )}
                {selectedDraft.smallScaleData.operatingActivities.shaftSinking && (
                  <Text style={styles.detailLabel}>✓ Shaft Sinking</Text>
                )}
                {selectedDraft.smallScaleData.operatingActivities.goldPanning && (
                  <Text style={styles.detailLabel}>✓ Gold Panning</Text>
                )}
                {selectedDraft.smallScaleData.operatingActivities.amalgamation && (
                  <Text style={styles.detailLabel}>✓ Amalgamation</Text>
                )}
                {selectedDraft.smallScaleData.operatingActivities.others && (
                  <>
                    <Text style={styles.detailLabel}>✓ Others</Text>
                    {selectedDraft.smallScaleData.othersActivity && (
                      <Text style={styles.detailValue}>{selectedDraft.smallScaleData.othersActivity}</Text>
                    )}
                  </>
                )}
              </View>
            )}
            
            {selectedDraft.smallScaleData.nonOperatingObservations && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Observations</Text>
                {selectedDraft.smallScaleData.nonOperatingObservations.excavations && (
                  <Text style={styles.detailLabel}>✓ Excavations</Text>
                )}
                {selectedDraft.smallScaleData.nonOperatingObservations.stockpiles && (
                  <Text style={styles.detailLabel}>✓ Stockpiles</Text>
                )}
                {selectedDraft.smallScaleData.nonOperatingObservations.tunnels && (
                  <Text style={styles.detailLabel}>✓ Tunnels</Text>
                )}
                {selectedDraft.smallScaleData.nonOperatingObservations.mineShafts && (
                  <Text style={styles.detailLabel}>✓ Mine Shafts</Text>
                )}
                {selectedDraft.smallScaleData.nonOperatingObservations.accessRoad && (
                  <Text style={styles.detailLabel}>✓ Access Road</Text>
                )}
                {selectedDraft.smallScaleData.nonOperatingObservations.processingFacility && (
                  <Text style={styles.detailLabel}>✓ Processing Facility</Text>
                )}
              </View>
            )}
            
            {selectedDraft.smallScaleData.interview?.conducted && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Community Interview</Text>
                <Text style={styles.detailLabel}>Interview Conducted: Yes</Text>
                {selectedDraft.smallScaleData.interview.responses?.question1 && (
                  <>
                    <Text style={styles.detailLabel}>Question 1</Text>
                    <Text style={styles.detailValue}>{selectedDraft.smallScaleData.interview.responses.question1}</Text>
                  </>
                )}
                {selectedDraft.smallScaleData.interview.responses?.question2 && (
                  <>
                    <Text style={styles.detailLabel}>Question 2</Text>
                    <Text style={styles.detailValue}>{selectedDraft.smallScaleData.interview.responses.question2}</Text>
                  </>
                )}
                {selectedDraft.smallScaleData.interview.responses?.question3 && (
                  <>
                    <Text style={styles.detailLabel}>Question 3</Text>
                    <Text style={styles.detailValue}>{selectedDraft.smallScaleData.interview.responses.question3}</Text>
                  </>
                )}
                {selectedDraft.smallScaleData.interview.responses?.question4 && (
                  <>
                    <Text style={styles.detailLabel}>Question 4</Text>
                    <Text style={styles.detailValue}>{selectedDraft.smallScaleData.interview.responses.question4}</Text>
                  </>
                )}
                {selectedDraft.smallScaleData.interview.responses?.question5 && (
                  <>
                    <Text style={styles.detailLabel}>Question 5</Text>
                    <Text style={styles.detailValue}>{selectedDraft.smallScaleData.interview.responses.question5}</Text>
                  </>
                )}
                {selectedDraft.smallScaleData.interview.responses?.question6 && (
                  <>
                    <Text style={styles.detailLabel}>Question 6</Text>
                    <Text style={styles.detailValue}>{selectedDraft.smallScaleData.interview.responses.question6}</Text>
                  </>
                )}
              </View>
            )}
          </>
        );
      }
      
      return null;
    };
    
    return (
      <Modal visible={showDraftDetail} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Draft Details</Text>
              <TouchableOpacity onPress={() => setShowDraftDetail(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.detailScrollView}>
              {/* Report Type */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Report Type</Text>
                <Text style={styles.detailValue}>{getReportTypeTitle(selectedDraft.reportType)}</Text>
              </View>
              
              {/* Status */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor('draft') }]}>
                  <Text style={styles.statusText}>Draft</Text>
                </View>
              </View>
              
              {/* Location */}
              {selectedDraft.location && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{selectedDraft.location}</Text>
                </View>
              )}
              
              {/* GPS Coordinates */}
              {selectedDraft.gpsLocation && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>GPS Coordinates</Text>
                  <Text style={styles.detailValue}>
                    Lat: {selectedDraft.gpsLocation.latitude}, Lng: {selectedDraft.gpsLocation.longitude}
                  </Text>
                </View>
              )}
              
              {/* Date & Time */}
              {(selectedDraft.incidentDate || selectedDraft.incidentTime) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Incident Date & Time</Text>
                  <Text style={styles.detailValue}>
                    {selectedDraft.incidentDate || 'Not specified'} at {selectedDraft.incidentTime || 'Not specified'}
                  </Text>
                </View>
              )}
              
              {/* Commodity */}
              {selectedDraft.commodity && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Commodity</Text>
                  <Text style={styles.detailValue}>{selectedDraft.commodity}</Text>
                </View>
              )}
              
              {/* Site Status */}
              {selectedDraft.siteStatus && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Site Status</Text>
                  <Text style={styles.detailValue}>
                    {selectedDraft.siteStatus === 'operating' ? 'Operating' :
                     selectedDraft.siteStatus === 'non_operating' ? 'Non-Operating' : 
                     selectedDraft.siteStatus === 'under_construction' ? 'Under Construction' : selectedDraft.siteStatus}
                  </Text>
                </View>
              )}
              
              {/* Operator Information */}
              {selectedDraft.operatorInfo && (selectedDraft.operatorInfo.name || selectedDraft.operatorInfo.address) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Operator Information</Text>
                  {selectedDraft.operatorInfo.name && (
                    <>
                      <Text style={styles.detailLabel}>Name</Text>
                      <Text style={styles.detailValue}>{selectedDraft.operatorInfo.name}</Text>
                    </>
                  )}
                  {selectedDraft.operatorInfo.address && (
                    <>
                      <Text style={styles.detailLabel}>Address</Text>
                      <Text style={styles.detailValue}>{selectedDraft.operatorInfo.address}</Text>
                    </>
                  )}
                  {selectedDraft.operatorInfo.determinationMethod && (
                    <>
                      <Text style={styles.detailLabel}>How Determined</Text>
                      <Text style={styles.detailValue}>{selectedDraft.operatorInfo.determinationMethod}</Text>
                    </>
                  )}
                </View>
              )}
              
              {/* Draft Type Specific Fields */}
              {renderDraftTypeSpecificFields()}
              
              {/* Additional Information */}
              {selectedDraft.additionalInfo && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Additional Information</Text>
                  <Text style={styles.detailValue}>{selectedDraft.additionalInfo}</Text>
                </View>
              )}
              
              {/* Created Date */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Created Date</Text>
                <Text style={styles.detailValue}>{formatDate(selectedDraft.createdAt)}</Text>
              </View>
              
              {/* Attachments */}
              {selectedDraft.attachments && selectedDraft.attachments.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Attachments ({selectedDraft.attachments.length})</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentScrollView}>
                    {selectedDraft.attachments.map((attachment, index) => (
                      <TouchableOpacity
                        key={attachment.id || `draft_attachment_${index}_${attachment.url || index}`}
                        style={styles.attachmentThumbnail}
                        onPress={() => openImagePreview(selectedDraft.attachments, index)}
                      >
                        <Image 
                          source={{ uri: attachment.url || attachment.uri || attachment.preview }} 
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                          onError={(error) => {
                            console.log('Draft image load error:', error.nativeEvent.error);
                          }}
                        />
                        <View style={styles.thumbnailOverlay}>
                          <Ionicons name="eye" size={16} color="white" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity 
                    style={styles.viewAllImagesButton}
                    onPress={() => openImagePreview(selectedDraft.attachments, 0)}
                  >
                    <Ionicons name="images" size={16} color={COLORS.primary} />
                    <Text style={styles.viewAllImagesText}>View All Images</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            
            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.editDraftButton}
                onPress={() => {
                  setShowDraftDetail(false);
                  handleEditDraft(selectedDraft);
                }}
              >
                <Ionicons name="create" size={20} color={COLORS.white} />
                <Text style={styles.editDraftButtonText}>Edit Draft</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

          <Text style={styles.newReportLabel}>{language === 'english' ? 'New Report:' : 'Bagong Report:'}</Text>
          
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

  // Get current language translations
  const t = illegalMiningTranslations[language] || illegalMiningTranslations.english;
  const tt = illegalTransportTranslations[language] || illegalTransportTranslations.english;
  const tp = illegalProcessingTranslations[language] || illegalProcessingTranslations.english;
  const td = illegalTradingTranslations[language] || illegalTradingTranslations.english;
  const te = illegalExplorationTranslations[language] || illegalExplorationTranslations.english;
  const ts = illegalSmallScaleMiningTranslations[language] || illegalSmallScaleMiningTranslations.english;

  const IllegalMiningChecklist = useMemo(() => (
    <ScrollView style={styles.checklistContent}>
      {/* GPS Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{t.gpsLocation}</Text>
        <View style={styles.gpsRow}>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{t.latitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={formData.latitude}
              onChangeText={(text) => updateFormData('latitude', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{t.longitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={formData.longitude}
              onChangeText={(text) => updateFormData('longitude', text)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.getLocationButton, isLoadingLocation && styles.buttonDisabled]}
          onPress={handleGetCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation && (
            <ActivityIndicator size="small" color="#2196F3" style={styles.buttonSpinner} />
          )}
          <Text style={styles.getLocationText}>
            {isLoadingLocation ? 'Getting Location...' : t.getCoordinates}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{t.location}</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder={t.locationPlaceholder}
          value={formData.location}
          onChangeText={(text) => updateFormData('location', text)}
        />
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateInput}>
            <Text style={styles.sectionLabel}>{t.date}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="mm/dd/yyyy"
              value={formData.date}
              onChangeText={(text) => updateFormData('date', text)}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.sectionLabel}>{t.time}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="07:30 AM"
              value={formData.time}
              onChangeText={(text) => updateFormData('time', text)}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.usePhoneButton} onPress={handleUsePhoneDateTime}>
          <Text style={styles.usePhoneText}>{t.usePhoneDateTime}</Text>
        </TouchableOpacity>
      </View>

      {/* Project Information Board */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{t.projectBoard}</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateFormData('hasSignboard', false)}
          >
            <View style={[styles.checkbox, formData.hasSignboard === false && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{t.noSignboard}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateFormData('hasSignboard', null)}
          >
            <View style={[styles.checkbox, formData.hasSignboard === null && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{t.notDetermined}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateFormData('hasSignboard', true)}
          >
            <View style={[styles.checkbox, formData.hasSignboard === true && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{t.projectName}</Text>
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
        <Text style={styles.sectionLabel}>{t.commodity}</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => {
              const commodityOptions = [
                'Sand and Gravel',
                'Filling Materials', 
                'Construction Aggregates',
                'Rocks',
                'Sand',
                'Boulders',
                'Base Course',
                'Common Soil',
                'Limestone',
                'Silica',
                'Others'
              ];
              
              const alertOptions = commodityOptions.map(option => ({
                text: option,
                onPress: () => {
                  updateFormData('commodity', option);
                  if (option === 'Others') {
                    updateFormData('commodityOther', '');
                  }
                }
              }));
              
              alertOptions.push({ text: 'X', style: 'cancel' });
              
              Alert.alert(
                'Commodity',
                'Select commodity ⮽',
                alertOptions
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {formData.commodity || 'Select commodity'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Others input field */}
        {formData.commodity === 'Others' && (
          <TextInput 
            style={[styles.textInput, { marginTop: 8 }]}
            placeholder="Please specify other commodity"
            value={formData.commodityOther || ''}
            onChangeText={(text) => updateFormData('commodityOther', text)}
          />
        )}
      </View>

      {/* Site Status */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{t.siteStatus}</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => {
              Alert.alert(
                'Site Status',
                'Select site status ⮽',
                [
                  { text: t.operating, onPress: () => updateFormData('siteStatus', 'operating') },
                  { text: t.nonOperating, onPress: () => updateFormData('siteStatus', 'non_operating') },
                  { text: 'X', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.dropdownText}>{formData.siteStatus === 'operating' ? t.operating : t.nonOperating}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Operating Status Activities */}
      {formData.siteStatus === 'operating' && (
        <View style={styles.operatingSection}>
          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>{t.activitiesObserved}</Text>
            <View style={styles.activitiesContainer}>
              <TouchableOpacity 
                style={styles.activityRow}
                onPress={() => updateNestedFormData('activities', 'extraction', !formData.activities?.extraction)}
              >
                <View style={[styles.checkbox, formData.activities?.extraction && styles.checkedBox]} />
                <Text style={styles.activityText}>{t.extraction}</Text>
                
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.activityRow}
                onPress={() => updateNestedFormData('activities', 'disposition', !formData.activities?.disposition)}
              >
                <View style={[styles.checkbox, formData.activities?.disposition && styles.checkedBox]} />
                <Text style={styles.activityText}>{t.disposition}</Text>
               
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.activityRow}
                onPress={() => updateNestedFormData('activities', 'processing', !formData.activities?.processing)}
              >
                <View style={[styles.checkbox, formData.activities?.processing && styles.checkedBox]} />
                <Text style={styles.activityText}>{t.processing}</Text>
               
              </TouchableOpacity>
            </View>
          </View>

          {/* Operator Information */}
          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>{t.operatorName}</Text>
            <TextInput 
              style={styles.textInput}
              value={formData.operatorName}
              onChangeText={(text) => updateFormData('operatorName', text)}
            />
          </View>

          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>{t.operatorAddress}</Text>
            <TextInput 
              style={styles.textInput}
              value={formData.operatorAddress}
              onChangeText={(text) => updateFormData('operatorAddress', text)}
            />
          </View>

          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>{t.operatorDetermination}</Text>
            <TextInput 
              style={[styles.textInput, styles.textArea]}
              multiline
              value={formData.operatorDetermination}
              onChangeText={(text) => updateFormData('operatorDetermination', text)}
            />
          </View>
        </View>
      )}

      {/* Non-Operating Status Activities */}
      {formData.siteStatus === 'non_operating' && (
        <View style={styles.nonOperatingSection}>
          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>{t.observations}</Text>
            <View style={styles.activitiesContainer}>
              <TouchableOpacity 
                style={styles.observationRow}
                onPress={() => updateNestedFormData('nonOperatingObservations', 'excavations', !formData.nonOperatingObservations.excavations)}
              >
                <View style={[styles.checkbox, formData.nonOperatingObservations.excavations && styles.checkedBox]} />
                <Text style={styles.observationText}>{t.excavations}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.observationRow}
                onPress={() => updateNestedFormData('nonOperatingObservations', 'accessRoad', !formData.nonOperatingObservations.accessRoad)}
              >
                <View style={[styles.checkbox, formData.nonOperatingObservations.accessRoad && styles.checkedBox]} />
                <Text style={styles.observationText}>{t.accessRoad}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.observationRow}
                onPress={() => updateNestedFormData('nonOperatingObservations', 'processingFacility', !formData.nonOperatingObservations.processingFacility)}
              >
                <View style={[styles.checkbox, formData.nonOperatingObservations.processingFacility && styles.checkedBox]} />
                <Text style={styles.observationText}>{t.processingFacility}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Interview Information */}
          <View style={styles.checklistSection}>
            <Text style={styles.interviewNote}>
              {t.interviewNote}
            </Text>
            
            <Text style={styles.sectionLabel}>{t.conductedInterview}</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateFormData('conductedInterview', true)}
              >
                <View style={[styles.checkbox, formData.conductedInterview === true && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{t.yes}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateFormData('conductedInterview', false)}
              >
                <View style={[styles.checkbox, formData.conductedInterview === false && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{t.no}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guide Questions */}
          <View style={styles.guideQuestionsSection}>
            <Text style={styles.guideQuestionsTitle}>{t.guideQuestions}</Text>
            
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{t.question1}</Text>
              <TextInput 
                style={[styles.textInput, styles.answerInput]}
                placeholder={t.answerHere}
                value={formData.guideQuestions.recentActivity}
                onChangeText={(text) => updateGuideQuestion('recentActivity', text)}
                multiline
              />
            </View>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{t.question2}</Text>
              <TextInput 
                style={[styles.textInput, styles.answerInput]}
                placeholder={t.answerHere}
                value={formData.guideQuestions.excavationStart}
                onChangeText={(text) => updateGuideQuestion('excavationStart', text)}
                multiline
              />
            </View>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{t.question3}</Text>
              <TextInput 
                style={[styles.textInput, styles.answerInput]}
                placeholder={t.answerHere}
                value={formData.guideQuestions.transportVehicles}
                onChangeText={(text) => updateGuideQuestion('transportVehicles', text)}
                multiline
              />
            </View>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{t.question4}</Text>
              <TextInput 
                style={[styles.textInput, styles.answerInput]}
                placeholder={t.answerHere}
                value={formData.guideQuestions.operatorName}
                onChangeText={(text) => updateGuideQuestion('operatorName', text)}
                multiline
              />
            </View>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{t.question5}</Text>
              <TextInput 
                style={[styles.textInput, styles.answerInput]}
                placeholder={t.answerHere}
                value={formData.guideQuestions.operatorAddress}
                onChangeText={(text) => updateGuideQuestion('operatorAddress', text)}
                multiline
              />
            </View>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{t.question6}</Text>
              <TextInput 
                style={[styles.textInput, styles.answerInput]}
                placeholder={t.answerHere}
                value={formData.guideQuestions.permits}
                onChangeText={(text) => updateGuideQuestion('permits', text)}
                multiline
              />
            </View>
          </View>
        </View>
      )}

      {/* Additional Information */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{t.additionalInfo}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={formData.additionalInfo}
          onChangeText={(text) => updateFormData('additionalInfo', text)}
        />
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>{t.attachPhotos}</Text>
          <TouchableOpacity 
            style={[styles.uploadButton, isUploadingImages && styles.buttonDisabled]}
            onPress={handleImageUpload}
            disabled={isUploadingImages}
          >
            <Ionicons name="images-outline" size={20} color="white" />
            <Text style={styles.uploadText}>
              {isUploadingImages ? 'Uploading...' : t.uploadGallery}
            </Text>
          </TouchableOpacity>
          {uploadedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewTitle}>
                {language === 'english' 
                  ? `Uploaded Images (${uploadedImages.length})` 
                  : `Mga Na-upload na Larawan (${uploadedImages.length})`
                }
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                {uploadedImages.map((image, index) => (
                  <View key={image.id || `mining_image_${index}_${Date.now()}`} style={styles.imagePreviewItem}>
                    <TouchableOpacity
                      onPress={() => openImagePreview(uploadedImages, index)}
                      style={styles.imagePreviewTouchable}
                    >
                      <Image 
                        source={{ uri: image.url || image.uri || image.preview }} 
                        style={styles.imagePreview}
                        onError={(error) => {
                          console.log('Mining form image preview error:', error.nativeEvent.error);
                        }}
                      />
                      <View style={styles.imagePreviewOverlayIcon}>
                        <Ionicons name="eye" size={16} color="white" />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                    {image.geotagged && (
                      <View style={styles.geotaggedIndicator}>
                        <Ionicons name="location" size={12} color="white" />
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Certification Statement */}
      <View style={styles.certificationSection}>
        <Text style={styles.certificationTitle}>{t.certificationTitle}</Text>
        <Text style={styles.certificationText}>
          {t.certificationText1}
        </Text>
        <Text style={styles.certificationText}>
          {t.certificationText2}
        </Text>
      </View>

      {/* Save as Draft Button */}
      <TouchableOpacity 
        style={[styles.saveAsDraftButton, isSavingDraft && styles.submitButtonDisabled]} 
        onPress={handleSaveAsDraft}
        disabled={isSavingDraft || isSubmitting}
      >
        <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.saveAsDraftText}>
          {isSavingDraft ? 'Saving...' : (isEditingMode ? 'Update Draft' : 'Save as Draft')}
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitToMGBButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmitReport}
        disabled={isSubmitting}
      >
        <Text style={styles.submitToMGBText}>
          {isSubmitting ? 'Submitting...' : t.submitButton}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  ), [formData, updateFormData, updateNestedFormData, t, language]);

  const IllegalTransportationChecklist = useMemo(() => (
    <ScrollView style={styles.checklistContent}>
      {/* GPS Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.gpsLocation}</Text>
        <View style={styles.gpsRow}>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{tt.latitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={transportFormData.latitude}
              onChangeText={(text) => updateTransportFormData('latitude', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{tt.longitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={transportFormData.longitude}
              onChangeText={(text) => updateTransportFormData('longitude', text)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.getLocationButton, isLoadingTransportationLocation && styles.buttonDisabled]}
          onPress={handleTransportationGetCurrentLocation}
          disabled={isLoadingTransportationLocation}
        >
          {isLoadingTransportationLocation && (
            <ActivityIndicator size="small" color="#2196F3" style={styles.buttonSpinner} />
          )}
          <Text style={styles.getLocationText}>
            {isLoadingTransportationLocation ? 'Getting Location...' : tt.getCoordinates}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.location}</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder={tt.locationPlaceholder}
          value={transportFormData.location}
          onChangeText={(text) => updateTransportFormData('location', text)}
        />
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateInput}>
            <Text style={styles.sectionLabel}>{tt.date}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="mm/dd/yyyy"
              value={transportFormData.date}
              onChangeText={(text) => updateTransportFormData('date', text)}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.sectionLabel}>{tt.time}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="07:30 AM"
              value={transportFormData.time}
              onChangeText={(text) => updateTransportFormData('time', text)}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.usePhoneButton} onPress={handleTransportationUsePhoneDateTime}>
          <Text style={styles.usePhoneText}>{tt.usePhoneDateTime}</Text>
        </TouchableOpacity>
      </View>

      {/* Type of Violation */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.violationType}</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateTransportFormData('violationType', 'absence')}
          >
            <View style={[styles.checkbox, transportFormData.violationType === 'absence' && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{tt.absenceDocuments}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateTransportFormData('violationType', 'outdated')}
          >
            <View style={[styles.checkbox, transportFormData.violationType === 'outdated' && styles.checkedBox]} />
            <View style={styles.violationTextContainer}>
              <Text style={styles.checkboxText}>{tt.outdatedDocuments}</Text>
              <Text style={styles.documentTypes}>{tt.documentTypes}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateTransportFormData('violationType', 'fraudulent')}
          >
            <View style={[styles.checkbox, transportFormData.violationType === 'fraudulent' && styles.checkedBox]} />
            <View style={styles.violationTextContainer}>
              <Text style={styles.checkboxText}>{tt.fraudulentDocuments}</Text>
              <Text style={styles.documentTypes}>{tt.documentTypes}</Text>
            </View>
          </TouchableOpacity>
        </View>
        {(transportFormData.violationType === 'outdated' || transportFormData.violationType === 'fraudulent') && (
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => {
                const docTypes = ['OTP', 'DR', 'OTC', 'MOEP'];
                const alertOptions = docTypes.map(option => ({
                  text: option,
                  onPress: () => updateTransportFormData('documentType', option)
                }));
                alertOptions.push({ text: 'X', style: 'cancel' });
                Alert.alert('Document Type', 'Select document type ⮽', alertOptions);
              }}
            >
              <Text style={styles.dropdownText}>
                {transportFormData.documentType || 'Select document type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Commodity */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.commodity}</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => {
              const commodityOptions = [
                'Sand and Gravel',
                'Filling Materials', 
                'Construction Aggregates',
                'Rocks',
                'Sand',
                'Boulders',
                'Base Course',
                'Common Soil',
                'Limestone',
                'Silica',
                'Others'
              ];
              
              const alertOptions = commodityOptions.map(option => ({
                text: option,
                onPress: () => {
                  updateTransportFormData('commodity', option);
                  if (option === 'Others') {
                    updateTransportFormData('commodityOther', '');
                  }
                }
              }));
              
              alertOptions.push({ text: 'X', style: 'cancel' });
              
              Alert.alert(
                'Commodity',
                'Select commodity ⮽',
                alertOptions
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {transportFormData.commodity || 'Select commodity'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Others input field */}
        {transportFormData.commodity === 'Others' && (
          <TextInput 
            style={[styles.textInput, { marginTop: 8 }]}
            placeholder="Please specify other commodity"
            value={transportFormData.commodityOther || ''}
            onChangeText={(text) => updateTransportFormData('commodityOther', text)}
          />
        )}
      </View>

      {/* Volume/Weight and Unit */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateInput}>
            <Text style={styles.sectionLabel}>{tt.volumeWeight}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="Enter volume/weight"
              value={transportFormData.volumeWeight}
              onChangeText={(text) => updateTransportFormData('volumeWeight', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.sectionLabel}>{tt.unit}</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => {
                const unitOptions = ['Cubic Meters', 'Metric Tons', 'Sacks', 'Others'];
                const alertOptions = unitOptions.map(option => ({
                  text: option,
                  onPress: () => {
                    updateTransportFormData('unit', option);
                    if (option !== 'Others') {
                      updateTransportFormData('unitOther', '');
                    }
                  }
                }));
                alertOptions.push({ text: 'X', style: 'cancel' });
                Alert.alert('Unit', 'Select unit ⮽', alertOptions);
              }}
            >
              <Text style={styles.dropdownText}>
                {transportFormData.unit || 'Select unit'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            {transportFormData.unit === 'Others' && (
              <TextInput 
                style={[styles.textInput, { marginTop: 8 }]}
                placeholder="Please specify unit"
                value={transportFormData.unitOther || ''}
                onChangeText={(text) => updateTransportFormData('unitOther', text)}
              />
            )}
          </View>
        </View>
      </View>

      {/* Type of Vehicle */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.vehicleType}</Text>
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => {
            const vehicleOptions = ['Dump Truck', 'Mini Dump Truck', 'Jeepney', 'Tricycle', 'Others'];
            const alertOptions = vehicleOptions.map(option => ({
              text: option,
              onPress: () => {
                updateTransportFormData('vehicleType', option);
                if (option !== 'Others') {
                  updateTransportFormData('vehicleTypeOther', '');
                }
              }
            }));
            alertOptions.push({ text: 'X', style: 'cancel' });
            Alert.alert('Vehicle Type', 'Select vehicle type ⮽', alertOptions);
          }}
        >
          <Text style={styles.dropdownText}>
            {transportFormData.vehicleType || 'Select vehicle type'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        {transportFormData.vehicleType === 'Others' && (
          <TextInput 
            style={[styles.textInput, { marginTop: 8 }]}
            placeholder="Please specify vehicle type"
            value={transportFormData.vehicleTypeOther || ''}
            onChangeText={(text) => updateTransportFormData('vehicleTypeOther', text)}
          />
        )}
      </View>

      {/* Vehicle Description */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.vehicleDescription}</Text>
        <Text style={styles.subLabel}>{tt.vehicleBodyColor}</Text>
        <TextInput 
          style={styles.textInput}
          value={transportFormData.vehicleDescription}
          onChangeText={(text) => updateTransportFormData('vehicleDescription', text)}
        />
      </View>

      {/* Plate Number */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.plateNumber}</Text>
        <TextInput 
          style={styles.textInput}
          value={transportFormData.plateNumber}
          onChangeText={(text) => updateTransportFormData('plateNumber', text)}
        />
      </View>

      {/* Owner/Operator */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.ownerOperator}</Text>
        <TextInput 
          style={styles.textInput}
          value={transportFormData.ownerOperator}
          onChangeText={(text) => updateTransportFormData('ownerOperator', text)}
        />
      </View>

      {/* Address of Owner/Operator */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.ownerAddress}</Text>
        <TextInput 
          style={styles.textInput}
          value={transportFormData.ownerAddress}
          onChangeText={(text) => updateTransportFormData('ownerAddress', text)}
        />
      </View>

      {/* Driver */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.driver}</Text>
        <TextInput 
          style={styles.textInput}
          value={transportFormData.driver}
          onChangeText={(text) => updateTransportFormData('driver', text)}
        />
      </View>

      {/* Address of Driver */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.driverAddress}</Text>
        <TextInput 
          style={styles.textInput}
          value={transportFormData.driverAddress}
          onChangeText={(text) => updateTransportFormData('driverAddress', text)}
        />
      </View>

      {/* Source of Materials */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.sourceOfMaterials}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={transportFormData.sourceOfMaterials}
          onChangeText={(text) => updateTransportFormData('sourceOfMaterials', text)}
        />
      </View>

      {/* Actions Taken */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.actionsTaken}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={transportFormData.actionsTaken}
          onChangeText={(text) => updateTransportFormData('actionsTaken', text)}
        />
      </View>

      {/* Additional Information */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.additionalInfo}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={transportFormData.additionalInfo}
          onChangeText={(text) => updateTransportFormData('additionalInfo', text)}
        />
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>{tt.attachPhotos}</Text>
          <TouchableOpacity 
            style={[styles.uploadButton, isUploadingImages && styles.buttonDisabled]}
            onPress={handleImageUpload}
            disabled={isUploadingImages}
          >
            <Ionicons name="images-outline" size={20} color="white" />
            <Text style={styles.uploadText}>
              {isUploadingImages ? 'Uploading...' : tt.uploadGallery}
            </Text>
          </TouchableOpacity>
          {uploadedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewTitle}>
                {language === 'english' 
                  ? `Uploaded Images (${uploadedImages.length})` 
                  : `Mga Na-upload na Larawan (${uploadedImages.length})`
                }
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                {uploadedImages.map((image, index) => (
                  <View key={image.id || `transport_image_${index}_${Date.now()}`} style={styles.imagePreviewItem}>
                    <TouchableOpacity
                      onPress={() => openImagePreview(uploadedImages, index)}
                      style={styles.imagePreviewTouchable}
                    >
                      <Image 
                        source={{ uri: image.url || image.uri || image.preview }} 
                        style={styles.imagePreview}
                        onError={(error) => console.log('Image load error:', error)}
                      />
                      <View style={styles.imagePreviewOverlayIcon}>
                        <Ionicons name="eye" size={16} color="white" />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                    {image.geotagged && (
                      <View style={styles.geotaggedIndicator}>
                        <Ionicons name="location" size={12} color="white" />
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Certification Statement */}
      <View style={styles.certificationSection}>
        <Text style={styles.certificationTitle}>{tt.certificationTitle}</Text>
        <Text style={styles.certificationText}>
          {tt.certificationText1}
        </Text>
        <Text style={styles.certificationText}>
          {tt.certificationText2}
        </Text>
      </View>

      {/* Save as Draft Button */}
      <TouchableOpacity 
        style={[styles.saveAsDraftButton, isSavingDraft && styles.submitButtonDisabled]} 
        onPress={handleSaveAsDraft}
        disabled={isSavingDraft || isSubmitting}
      >
        <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.saveAsDraftText}>
          {isSavingDraft ? 'Saving...' : (isEditingMode ? 'Update Draft' : 'Save as Draft')}
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitToMGBButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmitReport}
        disabled={isSubmitting}
      >
        <Text style={styles.submitToMGBText}>
          {isSubmitting ? 'Submitting...' : tt.submitButton}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  ), [transportFormData, updateTransportFormData, tt, language]);

  const IllegalProcessingChecklist = useMemo(() => (
    <ScrollView style={styles.checklistContent}>
      {/* GPS Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.gpsLocation}</Text>
        <View style={styles.gpsRow}>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{tp.latitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={processingFormData.latitude}
              onChangeText={(text) => updateProcessingFormData('latitude', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{tp.longitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={processingFormData.longitude}
              onChangeText={(text) => updateProcessingFormData('longitude', text)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.getLocationButton, isLoadingProcessingLocation && styles.buttonDisabled]}
          onPress={handleProcessingGetCurrentLocation}
          disabled={isLoadingProcessingLocation}
        >
          {isLoadingProcessingLocation && (
            <ActivityIndicator size="small" color="#2196F3" style={styles.buttonSpinner} />
          )}
          <Text style={styles.getLocationText}>
            {isLoadingProcessingLocation ? 'Getting Location...' : tp.getCoordinates}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.location}</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder={tp.locationPlaceholder}
          value={processingFormData.location}
          onChangeText={(text) => updateProcessingFormData('location', text)}
        />
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateInput}>
            <Text style={styles.sectionLabel}>{tp.date}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="mm/dd/yyyy"
              value={processingFormData.date}
              onChangeText={(text) => updateProcessingFormData('date', text)}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.sectionLabel}>{tp.time}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="07:30 AM"
              value={processingFormData.time}
              onChangeText={(text) => updateProcessingFormData('time', text)}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.usePhoneButton} onPress={handleProcessingUsePhoneDateTime}>
          <Text style={styles.usePhoneText}>{tp.usePhoneDateTime}</Text>
        </TouchableOpacity>
      </View>

      {/* Project Information Board */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.projectBoard}</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateProcessingFormData('hasSignboard', false)}
          >
            <View style={[styles.checkbox, processingFormData.hasSignboard === false && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{tp.noSignboard}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateProcessingFormData('hasSignboard', null)}
          >
            <View style={[styles.checkbox, processingFormData.hasSignboard === null && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{tp.notDetermined}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateProcessingFormData('hasSignboard', true)}
          >
            <View style={[styles.checkbox, processingFormData.hasSignboard === true && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{tp.projectName}</Text>
          </TouchableOpacity>
        </View>
        {processingFormData.hasSignboard === true && (
          <TextInput 
            style={styles.textInput}
            placeholder="Project name"
            value={processingFormData.projectName}
            onChangeText={(text) => updateProcessingFormData('projectName', text)}
          />
        )}
      </View>

      {/* Site Status */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.siteStatus}</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => {
              Alert.alert(
                'Site Status',
                'Select site status',
                [
                  { text: tp.operating, onPress: () => updateProcessingFormData('siteStatus', 'operating') },
                  { text: tp.nonOperating, onPress: () => updateProcessingFormData('siteStatus', 'non_operating') },
                  { text: tp.underConstruction, onPress: () => updateProcessingFormData('siteStatus', 'under_construction') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {processingFormData.siteStatus === 'operating' ? tp.operating : 
               processingFormData.siteStatus === 'non_operating' ? tp.nonOperating : 
               processingFormData.siteStatus === 'under_construction' ? tp.underConstruction : tp.operating}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Type of Mineral Processing Facility */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.facilityType}</Text>
        <TextInput 
          style={styles.textInput}
          placeholder={tp.facilityTypePlaceholder}
          value={processingFormData.facilityType}
          onChangeText={(text) => updateProcessingFormData('facilityType', text)}
          multiline
        />
      </View>

      {/* Mineral Processing Products */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.processingProducts}</Text>
        <TextInput 
          style={styles.textInput}
          placeholder={tp.processingProductsPlaceholder}
          value={processingFormData.processingProducts}
          onChangeText={(text) => updateProcessingFormData('processingProducts', text)}
          multiline
        />
      </View>

      {/* Name of Operator/s */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.operatorName}</Text>
        <TextInput 
          style={styles.textInput}
          value={processingFormData.operatorName}
          onChangeText={(text) => updateProcessingFormData('operatorName', text)}
        />
      </View>

      {/* Address of Operator/s */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.operatorAddress}</Text>
        <TextInput 
          style={styles.textInput}
          value={processingFormData.operatorAddress}
          onChangeText={(text) => updateProcessingFormData('operatorAddress', text)}
        />
      </View>

      {/* How did you determine the operator/s */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.operatorDetermination}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={processingFormData.operatorDetermination}
          onChangeText={(text) => updateProcessingFormData('operatorDetermination', text)}
        />
      </View>

      {/* Name of the source of raw materials */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.rawMaterialsName}</Text>
        <TextInput 
          style={styles.textInput}
          value={processingFormData.rawMaterialsName}
          onChangeText={(text) => updateProcessingFormData('rawMaterialsName', text)}
        />
      </View>

      {/* Location of the source of raw materials */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.rawMaterialsLocation}</Text>
        <TextInput 
          style={styles.textInput}
          value={processingFormData.rawMaterialsLocation}
          onChangeText={(text) => updateProcessingFormData('rawMaterialsLocation', text)}
        />
      </View>

      {/* How did you determine the source of raw materials */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.rawMaterialsDetermination}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={processingFormData.rawMaterialsDetermination}
          onChangeText={(text) => updateProcessingFormData('rawMaterialsDetermination', text)}
        />
      </View>

      {/* Additional Information */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tp.additionalInfo}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={processingFormData.additionalInfo}
          onChangeText={(text) => updateProcessingFormData('additionalInfo', text)}
        />
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>{tp.attachPhotos}</Text>
          <TouchableOpacity 
            style={[styles.uploadButton, isUploadingImages && styles.buttonDisabled]}
            onPress={handleImageUpload}
            disabled={isUploadingImages}
          >
            <Ionicons name="images-outline" size={20} color="white" />
            <Text style={styles.uploadText}>
              {isUploadingImages ? 'Uploading...' : tp.uploadGallery}
            </Text>
          </TouchableOpacity>
          {uploadedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewTitle}>
                {language === 'english' 
                  ? `Uploaded Images (${uploadedImages.length})` 
                  : `Mga Na-upload na Larawan (${uploadedImages.length})`
                }
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                {uploadedImages.map((image, index) => (
                  <View key={image.id || `processing_image_${index}_${Date.now()}`} style={styles.imagePreviewItem}>
                    <TouchableOpacity
                      onPress={() => openImagePreview(uploadedImages, index)}
                      style={styles.imagePreviewTouchable}
                    >
                      <Image 
                        source={{ uri: image.url || image.uri || image.preview }} 
                        style={styles.imagePreview}
                        onError={(error) => console.log('Image load error:', error)}
                      />
                      <View style={styles.imagePreviewOverlayIcon}>
                        <Ionicons name="eye" size={16} color="white" />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                    {image.geotagged && (
                      <View style={styles.geotaggedIndicator}>
                        <Ionicons name="location" size={12} color="white" />
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Certification Statement */}
      <View style={styles.certificationSection}>
        <Text style={styles.certificationTitle}>{tp.certificationTitle}</Text>
        <Text style={styles.certificationText}>
          {tp.certificationText1}
        </Text>
        <Text style={styles.certificationText}>
          {tp.certificationText2}
        </Text>
      </View>

      {/* Save as Draft Button */}
      <TouchableOpacity 
        style={[styles.saveAsDraftButton, isSavingDraft && styles.submitButtonDisabled]} 
        onPress={handleSaveAsDraft}
        disabled={isSavingDraft || isSubmitting}
      >
        <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.saveAsDraftText}>
          {isSavingDraft ? 'Saving...' : (isEditingMode ? 'Update Draft' : 'Save as Draft')}
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitToMGBButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmitReport}
        disabled={isSubmitting}
      >
        <Text style={styles.submitToMGBText}>
          {isSubmitting ? 'Submitting...' : tp.submitButton}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  ), [processingFormData, updateProcessingFormData, tp, language]);

  const IllegalTradingChecklist = useMemo(() => (
    <ScrollView style={styles.checklistContent}>
      {/* GPS Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.gpsLocation}</Text>
        <View style={styles.gpsRow}>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{td.latitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={tradingFormData.latitude}
              onChangeText={(text) => updateTradingFormData('latitude', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{td.longitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={tradingFormData.longitude}
              onChangeText={(text) => updateTradingFormData('longitude', text)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.getLocationButton, isLoadingTradingLocation && styles.buttonDisabled]}
          onPress={handleTradingGetCurrentLocation}
          disabled={isLoadingTradingLocation}
        >
          {isLoadingTradingLocation && (
            <ActivityIndicator size="small" color="#2196F3" style={styles.buttonSpinner} />
          )}
          <Text style={styles.getLocationText}>
            {isLoadingTradingLocation ? 'Getting Location...' : td.getCoordinates}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.location}</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder={td.locationPlaceholder}
          value={tradingFormData.location}
          onChangeText={(text) => updateTradingFormData('location', text)}
        />
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateInput}>
            <Text style={styles.sectionLabel}>{td.date}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="mm/dd/yyyy"
              value={tradingFormData.date}
              onChangeText={(text) => updateTradingFormData('date', text)}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.sectionLabel}>{td.time}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="07:30 AM"
              value={tradingFormData.time}
              onChangeText={(text) => updateTradingFormData('time', text)}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.usePhoneButton} onPress={handleTradingUsePhoneDateTime}>
          <Text style={styles.usePhoneText}>{td.usePhoneDateTime}</Text>
        </TouchableOpacity>
      </View>

      {/* Type of Violation */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.violationType}</Text>
        <View style={[styles.checkboxContainer, { backgroundColor: '#F0F8FF', padding: 12, borderRadius: 8 }]}>
          <Text style={[styles.checkboxText, { fontWeight: '600', color: COLORS.textPrimary }]}>
            {td.tradingViolation}
          </Text>
        </View>
      </View>

      {/* Business Name */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.businessName}</Text>
        <TextInput 
          style={styles.textInput}
          value={tradingFormData.businessName}
          onChangeText={(text) => updateTradingFormData('businessName', text)}
        />
      </View>

      {/* Business Owner */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.businessOwner}</Text>
        <TextInput 
          style={styles.textInput}
          value={tradingFormData.businessOwner}
          onChangeText={(text) => updateTradingFormData('businessOwner', text)}
        />
      </View>

      {/* Business Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.businessLocation}</Text>
        <TextInput 
          style={styles.textInput}
          value={tradingFormData.businessLocation}
          onChangeText={(text) => updateTradingFormData('businessLocation', text)}
        />
      </View>

      {/* Commodity */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.commodity}</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => {
              const commodityOptions = [
                'Sand and Gravel',
                'Filling Materials', 
                'Construction Aggregates',
                'Rocks',
                'Sand',
                'Boulders',
                'Base Course',
                'Common Soil',
                'Limestone',
                'Silica',
                'Others'
              ];
              
              const alertOptions = commodityOptions.map(option => ({
                text: option,
                onPress: () => {
                  updateTradingFormData('commodity', option);
                  if (option === 'Others') {
                    updateTradingFormData('commodityOther', '');
                  }
                }
              }));
              
              alertOptions.push({ text: 'X', style: 'cancel' });
              
              Alert.alert(
                'Commodity',
                'Select commodity ⮽',
                alertOptions
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {tradingFormData.commodity || 'Select commodity'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Others input field */}
        {tradingFormData.commodity === 'Others' && (
          <TextInput 
            style={[styles.textInput, { marginTop: 8 }]}
            placeholder="Please specify other commodity"
            value={tradingFormData.commodityOther || ''}
            onChangeText={(text) => updateTradingFormData('commodityOther', text)}
          />
        )}
      </View>

      {/* Name of the source of commodity */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.sourceOfCommodityName}</Text>
        <TextInput 
          style={styles.textInput}
          value={tradingFormData.sourceOfCommodityName}
          onChangeText={(text) => updateTradingFormData('sourceOfCommodityName', text)}
        />
      </View>

      {/* Location of the source of commodity */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.sourceOfCommodityLocation}</Text>
        <TextInput 
          style={styles.textInput}
          value={tradingFormData.sourceOfCommodityLocation}
          onChangeText={(text) => updateTradingFormData('sourceOfCommodityLocation', text)}
        />
      </View>

      {/* How did you determine the source of commodity */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.sourceOfCommodityDetermination}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={tradingFormData.sourceOfCommodityDetermination}
          onChangeText={(text) => updateTradingFormData('sourceOfCommodityDetermination', text)}
        />
      </View>

      {/* Are there stockpiled materials in area */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.stockpiledMaterials}</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => {
              Alert.alert(
                'Stockpiled Materials',
                'Select option ⮽',
                [
                  { text: td.yes, onPress: () => updateTradingFormData('stockpiledMaterials', 'yes') },
                  { text: td.no, onPress: () => updateTradingFormData('stockpiledMaterials', 'no') },
                  { text: td.notDetermined, onPress: () => updateTradingFormData('stockpiledMaterials', 'not_determined') },
                  { text: 'X', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {tradingFormData.stockpiledMaterials === 'yes' ? td.yes :
               tradingFormData.stockpiledMaterials === 'no' ? td.no :
               tradingFormData.stockpiledMaterials === 'not_determined' ? td.notDetermined : 'Select option'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Is the business registered with DTI */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.dtiRegistration}</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => {
              Alert.alert(
                'DTI Registration',
                'Select option',
                [
                  { text: td.yes, onPress: () => updateTradingFormData('dtiRegistration', 'yes') },
                  { text: td.no, onPress: () => updateTradingFormData('dtiRegistration', 'no') },
                  { text: td.notDetermined, onPress: () => updateTradingFormData('dtiRegistration', 'not_determined') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {tradingFormData.dtiRegistration === 'yes' ? td.yes :
               tradingFormData.dtiRegistration === 'no' ? td.no :
               tradingFormData.dtiRegistration === 'not_determined' ? td.notDetermined : 'Select option'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Additional Information */}
      <View style={styles.checklistSection}>
        <Text style={styles.checklistLabel}>{td.additionalInfo}</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          multiline
          value={tradingFormData.additionalInfo}
          onChangeText={(text) => updateTradingFormData('additionalInfo', text)}
        />
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>{td.attachPhotos}</Text>
          <TouchableOpacity 
            style={[styles.uploadButton, isUploadingImages && styles.buttonDisabled]}
            onPress={handleImageUpload}
            disabled={isUploadingImages}
          >
            <Ionicons name="images-outline" size={20} color="white" />
            <Text style={styles.uploadText}>
              {isUploadingImages ? 'Uploading...' : td.uploadGallery}
            </Text>
          </TouchableOpacity>
            {uploadedImages.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                <Text style={styles.imagePreviewTitle}>
                  {language === 'english' 
                    ? `Uploaded Images (${uploadedImages.length})` 
                    : `Mga Na-upload na Larawan (${uploadedImages.length})`
                  }
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                  {uploadedImages.map((image, index) => (
                    <View key={image.id || `mining_image_${index}_${Date.now()}`} style={styles.imagePreviewItem}>
                      <TouchableOpacity
                        onPress={() => openImagePreview(uploadedImages, index)}
                        style={styles.imagePreviewTouchable}
                      >
                        <Image 
                          source={{ uri: image.url || image.uri || image.preview }} 
                          style={styles.imagePreview}
                          onError={(error) => console.log('Image load error:', error)}
                        />
                        <View style={styles.imagePreviewOverlayIcon}>
                          <Ionicons name="eye" size={16} color="white" />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#ff4444" />
                      </TouchableOpacity>
                      {image.geotagged && (
                        <View style={styles.geotaggedIndicator}>
                          <Ionicons name="location" size={12} color="white" />
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
        </View>
      </View>

      {/* Certification Statement */}
      <View style={styles.certificationSection}>
        <Text style={styles.certificationTitle}>{td.certificationTitle}</Text>
        <Text style={styles.certificationText}>
          {td.certificationText1}
        </Text>
        <Text style={styles.certificationText}>
          {td.certificationText2}
        </Text>
      </View>

      {/* Save as Draft Button */}
      <TouchableOpacity 
        style={[styles.saveAsDraftButton, isSavingDraft && styles.submitButtonDisabled]} 
        onPress={handleSaveAsDraft}
        disabled={isSavingDraft || isSubmitting}
      >
        <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.saveAsDraftText}>
          {isSavingDraft ? 'Saving...' : (isEditingMode ? 'Update Draft' : 'Save as Draft')}
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitToMGBButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmitReport}
        disabled={isSubmitting}
      >
        <Text style={styles.submitToMGBText}>
          {isSubmitting ? 'Submitting...' : td.submitButton}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  ), [tradingFormData, updateTradingFormData, td, language]);

  const IllegalExplorationChecklist = useMemo(() => (
    <ScrollView style={styles.checklistContent}>
      {/* GPS Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{te.gpsLocation}</Text>
        <View style={styles.gpsRow}>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{te.latitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={explorationFormData.latitude}
              onChangeText={(text) => updateExplorationFormData('latitude', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{te.longitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={explorationFormData.longitude}
              onChangeText={(text) => updateExplorationFormData('longitude', text)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.getLocationButton, isLoadingExplorationLocation && styles.buttonDisabled]}
          onPress={handleExplorationGetCurrentLocation}
          disabled={isLoadingExplorationLocation}
        >
          {isLoadingExplorationLocation && (
            <ActivityIndicator size="small" color="#2196F3" style={styles.buttonSpinner} />
          )}
          <Text style={styles.getLocationText}>
            {isLoadingExplorationLocation ? 'Getting Location...' : te.getCoordinates}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{te.location}</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder={te.locationPlaceholder}
          value={explorationFormData.location}
          onChangeText={(text) => updateExplorationFormData('location', text)}
        />
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateInput}>
            <Text style={styles.sectionLabel}>{te.date}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="mm/dd/yyyy"
              value={explorationFormData.date}
              onChangeText={(text) => updateExplorationFormData('date', text)}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.sectionLabel}>{te.time}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="07:30 AM"
              value={explorationFormData.time}
              onChangeText={(text) => updateExplorationFormData('time', text)}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.usePhoneButton} onPress={handleExplorationUsePhoneDateTime}>
          <Text style={styles.usePhoneText}>{te.usePhoneDateTime}</Text>
        </TouchableOpacity>
      </View>

      {/* Project Information Board */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{te.projectInfoBoard}</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationFormData('hasSignboard', 'no_signboard')}
          >
            <View style={[styles.checkbox, explorationFormData.hasSignboard === 'no_signboard' && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.noSignboard}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationFormData('hasSignboard', 'not_determined')}
          >
            <View style={[styles.checkbox, explorationFormData.hasSignboard === 'not_determined' && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.notDetermined}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationFormData('hasSignboard', 'yes')}
          >
            <View style={[styles.checkbox, explorationFormData.hasSignboard === 'yes' && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.projectName}</Text>
          </TouchableOpacity>
        </View>
        {explorationFormData.hasSignboard === 'yes' && (
          <TextInput 
            style={styles.textInput}
            value={explorationFormData.projectName}
            onChangeText={(text) => updateExplorationFormData('projectName', text)}
          />
        )}
      </View>

      {/* Activities Observed */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{te.activitiesObserved}</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('drilling', !explorationFormData.activities?.drilling)}
          >
            <View style={[styles.checkbox, explorationFormData.activities?.drilling && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.drilling}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('testPitting', !explorationFormData.activities?.testPitting)}
          >
            <View style={[styles.checkbox, explorationFormData.activities?.testPitting && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.testPitting}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('trenching', !explorationFormData.activities?.trenching)}
          >
            <View style={[styles.checkbox, explorationFormData.activities?.trenching && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.trenching}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('shaftSinking', !explorationFormData.activities?.shaftSinking)}
          >
            <View style={[styles.checkbox, explorationFormData.activities?.shaftSinking && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.shaftSinking}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('tunneling', !explorationFormData.activities?.tunneling)}
          >
            <View style={[styles.checkbox, explorationFormData.activities?.tunneling && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.tunneling}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('others', !explorationFormData.activities?.others)}
          >
            <View style={[styles.checkbox, explorationFormData.activities?.others && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.others}</Text>
          </TouchableOpacity>
        </View>
        {explorationFormData.activities?.others && (
          <TextInput 
            style={styles.textInput}
            value={explorationFormData.othersActivity}
            onChangeText={(text) => updateExplorationFormData('othersActivity', text)}
          />
        )}
      </View>

      {/* Name of Operator/s */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{te.operatorName}</Text>
        <TextInput 
          style={styles.textInput}
          value={explorationFormData.operatorName}
          onChangeText={(text) => updateExplorationFormData('operatorName', text)}
        />
      </View>

      {/* Address of Operator/s */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{te.operatorAddress}</Text>
        <TextInput 
          style={styles.textInput}
          value={explorationFormData.operatorAddress}
          onChangeText={(text) => updateExplorationFormData('operatorAddress', text)}
        />
      </View>

      {/* How did you determine the operator/s */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{te.operatorDetermination}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={explorationFormData.operatorDetermination}
          onChangeText={(text) => updateExplorationFormData('operatorDetermination', text)}
        />
      </View>

      {/* Additional Information */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{te.additionalInfo}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={explorationFormData.additionalInfo}
          onChangeText={(text) => updateExplorationFormData('additionalInfo', text)}
        />
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>{te.attachPhotos}</Text>
          <TouchableOpacity 
            style={[styles.uploadButton, isUploadingImages && styles.buttonDisabled]}
            onPress={handleImageUpload}
            disabled={isUploadingImages}
          >
            <Ionicons name="images-outline" size={20} color="white" />
            <Text style={styles.uploadText}>
              {isUploadingImages ? 'Uploading...' : te.uploadGallery}
            </Text>
          </TouchableOpacity>
          {uploadedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewTitle}>
                {language === 'english' 
                  ? `Uploaded Images (${uploadedImages.length})` 
                  : `Mga Na-upload na Larawan (${uploadedImages.length})`
                }
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                {uploadedImages.map((image, index) => (
                  <View key={image.id || `exploration_image_${index}_${Date.now()}`} style={styles.imagePreviewItem}>
                    <TouchableOpacity
                      onPress={() => openImagePreview(uploadedImages, index)}
                      style={styles.imagePreviewTouchable}
                    >
                      <Image 
                        source={{ uri: image.url || image.uri || image.preview }} 
                        style={styles.imagePreview}
                        onError={(error) => console.log('Image load error:', error)}
                      />
                      <View style={styles.imagePreviewOverlayIcon}>
                        <Ionicons name="eye" size={16} color="white" />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                    {image.geotagged && (
                      <View style={styles.geotaggedIndicator}>
                        <Ionicons name="location" size={12} color="white" />
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Certification Statement */}
      <View style={styles.certificationSection}>
        <Text style={styles.certificationTitle}>{te.certificationTitle}</Text>
        <Text style={styles.certificationText}>
          {te.certificationText1}
        </Text>
        <Text style={styles.certificationText}>
          {te.certificationText2}
        </Text>
      </View>

      {/* Save as Draft Button */}
      <TouchableOpacity 
        style={[styles.saveAsDraftButton, isSavingDraft && styles.submitButtonDisabled]} 
        onPress={handleSaveAsDraft}
        disabled={isSavingDraft || isSubmitting}
      >
        <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.saveAsDraftText}>
          {isSavingDraft ? 'Saving...' : (isEditingMode ? 'Update Draft' : 'Save as Draft')}
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitToMGBButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmitReport}
        disabled={isSubmitting}
      >
        <Text style={styles.submitToMGBText}>
          {isSubmitting ? 'Submitting...' : te.submitButton}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  ), [explorationFormData, updateExplorationFormData, updateExplorationActivityData, te, language]);

  const IllegalSmallScaleMiningChecklist = useMemo(() => (
    <ScrollView style={styles.checklistContent}>
      {/* GPS Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{ts.gpsLocation}</Text>
        <View style={styles.gpsRow}>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{ts.latitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={smallScaleMiningFormData.latitude}
              onChangeText={(text) => updateSmallScaleMiningFormData('latitude', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.coordinateInput}>
            <Text style={styles.coordinateLabel}>{ts.longitude}</Text>
            <TextInput 
              style={styles.coordinateField} 
              placeholder="0.0000"
              value={smallScaleMiningFormData.longitude}
              onChangeText={(text) => updateSmallScaleMiningFormData('longitude', text)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.getLocationButton, isLoadingSmallScaleMiningLocation && styles.buttonDisabled]}
          onPress={handleSmallScaleMiningGetCurrentLocation}
          disabled={isLoadingSmallScaleMiningLocation}
        >
          {isLoadingSmallScaleMiningLocation && (
            <ActivityIndicator size="small" color="#2196F3" style={styles.buttonSpinner} />
          )}
          <Text style={styles.getLocationText}>
            {isLoadingSmallScaleMiningLocation ? 'Getting Location...' : ts.getCoordinates}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{ts.location}</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder={ts.locationPlaceholder}
          value={smallScaleMiningFormData.location}
          onChangeText={(text) => updateSmallScaleMiningFormData('location', text)}
        />
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateInput}>
            <Text style={styles.sectionLabel}>{ts.date}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="mm/dd/yyyy"
              value={smallScaleMiningFormData.date}
              onChangeText={(text) => updateSmallScaleMiningFormData('date', text)}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.sectionLabel}>{ts.time}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="07:30 AM"
              value={smallScaleMiningFormData.time}
              onChangeText={(text) => updateSmallScaleMiningFormData('time', text)}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.usePhoneButton} onPress={handleSmallScaleMiningUsePhoneDateTime}>
          <Text style={styles.usePhoneText}>{ts.usePhoneDateTime}</Text>
        </TouchableOpacity>
      </View>

      {/* Project Information Board */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{ts.projectInfoBoard}</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateSmallScaleMiningFormData('hasSignboard', 'no_signboard')}
          >
            <View style={[styles.checkbox, smallScaleMiningFormData.hasSignboard === 'no_signboard' && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{ts.noSignboard}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateSmallScaleMiningFormData('hasSignboard', 'not_determined')}
          >
            <View style={[styles.checkbox, smallScaleMiningFormData.hasSignboard === 'not_determined' && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{ts.notDetermined}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateSmallScaleMiningFormData('hasSignboard', 'yes')}
          >
            <View style={[styles.checkbox, smallScaleMiningFormData.hasSignboard === 'yes' && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{ts.projectName}</Text>
          </TouchableOpacity>
        </View>
        {smallScaleMiningFormData.hasSignboard === 'yes' && (
          <TextInput 
            style={styles.textInput}
            value={smallScaleMiningFormData.projectName}
            onChangeText={(text) => updateSmallScaleMiningFormData('projectName', text)}
          />
        )}
      </View>

      {/* Commodity */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{ts.commodity}</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => {
              const commodityOptions = [
                'Sand and Gravel',
                'Filling Materials', 
                'Construction Aggregates',
                'Rocks',
                'Sand',
                'Boulders',
                'Base Course',
                'Common Soil',
                'Limestone',
                'Silica',
                'Others'
              ];
              
              const alertOptions = commodityOptions.map(option => ({
                text: option,
                onPress: () => {
                  updateSmallScaleMiningFormData('commodity', option);
                  if (option === 'Others') {
                    updateSmallScaleMiningFormData('commodityOther', '');
                  }
                }
              }));
              
              alertOptions.push({ text: 'X', style: 'cancel' });
              
              Alert.alert(
                'Commodity',
                'Select commodity ⮽',
                alertOptions
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {smallScaleMiningFormData.commodity || 'Select commodity'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Others input field */}
        {smallScaleMiningFormData.commodity === 'Others' && (
          <TextInput 
            style={[styles.textInput, { marginTop: 8 }]}
            placeholder="Please specify other commodity"
            value={smallScaleMiningFormData.commodityOther || ''}
            onChangeText={(text) => updateSmallScaleMiningFormData('commodityOther', text)}
          />
        )}
      </View>

      {/* Site Status */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{ts.siteStatus}</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => {
              Alert.alert(
                'Site Status',
                'Select status',
                [
                  { text: ts.operating, onPress: () => updateSmallScaleMiningFormData('siteStatus', 'operating') },
                  { text: ts.nonOperating, onPress: () => updateSmallScaleMiningFormData('siteStatus', 'nonOperating') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {smallScaleMiningFormData.siteStatus === 'operating' ? ts.operating : ts.nonOperating}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conditional Content Based on Site Status */}
      {smallScaleMiningFormData.siteStatus === 'operating' ? (
        <>
          {/* Activities Observed - Operating */}
          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>{ts.activitiesObserved}</Text>
            <Text style={styles.equipmentLabel}>{ts.equipmentUsed}</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('extraction', !smallScaleMiningFormData.activities?.extraction)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities?.extraction && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.extraction}</Text>
              </TouchableOpacity>
              {smallScaleMiningFormData.activities?.extraction && (
                <TextInput 
                  style={styles.equipmentInput}
                  placeholder={ts.extractionEquipment}
                  value={smallScaleMiningFormData.equipmentUsed?.extraction}
                  onChangeText={(text) => updateSmallScaleMiningEquipmentData('extraction', text)}
                />
              )}
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('disposition', !smallScaleMiningFormData.activities?.disposition)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities?.disposition && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.disposition}</Text>
              </TouchableOpacity>
              {smallScaleMiningFormData.activities?.disposition && (
                <TextInput 
                  style={styles.equipmentInput}
                  placeholder={ts.dispositionEquipment}
                  value={smallScaleMiningFormData.equipmentUsed?.disposition}
                  onChangeText={(text) => updateSmallScaleMiningEquipmentData('disposition', text)}
                />
              )}
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('mineralProcessing', !smallScaleMiningFormData.activities?.mineralProcessing)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities?.mineralProcessing && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.mineralProcessing}</Text>
              </TouchableOpacity>
              {smallScaleMiningFormData.activities?.mineralProcessing && (
                <TextInput 
                  style={styles.equipmentInput}
                  placeholder={ts.processingEquipment}
                  value={smallScaleMiningFormData.equipmentUsed?.mineralProcessing}
                  onChangeText={(text) => updateSmallScaleMiningEquipmentData('mineralProcessing', text)}
                />
              )}
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('tunneling', !smallScaleMiningFormData.activities?.tunneling)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities?.tunneling && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.tunneling}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('shaftSinking', !smallScaleMiningFormData.activities?.shaftSinking)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities?.shaftSinking && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.shaftSinking}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('goldPanning', !smallScaleMiningFormData.activities?.goldPanning)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities?.goldPanning && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.goldPanning}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('amalgamation', !smallScaleMiningFormData.activities?.amalgamation)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities?.amalgamation && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.amalgamation}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('others', !smallScaleMiningFormData.activities?.others)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities?.others && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.others}</Text>
              </TouchableOpacity>
              {smallScaleMiningFormData.activities?.others && (
                <TextInput 
                  style={styles.textInput}
                  value={smallScaleMiningFormData.othersActivity}
                  onChangeText={(text) => updateSmallScaleMiningFormData('othersActivity', text)}
                />
              )}
            </View>
          </View>
        </>
      ) : (
        <>
          {/* Observations - Non-Operating */}
          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>{ts.observationsInArea}</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningObservationData('excavations', !smallScaleMiningFormData.observations.excavations)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.observations.excavations && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.excavations}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningObservationData('stockpiles', !smallScaleMiningFormData.observations.stockpiles)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.observations.stockpiles && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.stockpiles}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningObservationData('tunnels', !smallScaleMiningFormData.observations.tunnels)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.observations.tunnels && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.tunnels}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningObservationData('mineShafts', !smallScaleMiningFormData.observations.mineShafts)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.observations.mineShafts && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.mineShafts}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningObservationData('accessRoad', !smallScaleMiningFormData.observations.accessRoad)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.observations.accessRoad && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.accessRoad}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningObservationData('processingFacility', !smallScaleMiningFormData.observations.processingFacility)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.observations.processingFacility && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.processingFacility}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Interview Section */}
          <View style={styles.checklistSection}>
            <Text style={styles.interviewNote}>{ts.interviewNote}</Text>
            <Text style={styles.sectionLabel}>{ts.conductedInterview}</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningFormData('conductedInterview', 'yes')}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.conductedInterview === 'yes' && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.yes}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningFormData('conductedInterview', 'no')}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.conductedInterview === 'no' && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.no}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guide Questions - Only show if interview was conducted */}
          {smallScaleMiningFormData.conductedInterview === 'yes' && (
            <View style={styles.checklistSection}>
              <Text style={styles.guideQuestionsTitle}>{ts.guideQuestions}</Text>
              
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>1. {ts.question1}</Text>
                <TextInput 
                  style={styles.answerInput}
                  placeholder={ts.answerHere}
                  value={smallScaleMiningFormData.interviewAnswers.question1}
                  onChangeText={(text) => updateSmallScaleMiningInterviewData('question1', text)}
                  multiline
                />
              </View>
              
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>2. {ts.question2}</Text>
                <TextInput 
                  style={styles.answerInput}
                  placeholder={ts.answerHere}
                  value={smallScaleMiningFormData.interviewAnswers.question2}
                  onChangeText={(text) => updateSmallScaleMiningInterviewData('question2', text)}
                  multiline
                />
              </View>
              
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>3. {ts.question3}</Text>
                <TextInput 
                  style={styles.answerInput}
                  placeholder={ts.answerHere}
                  value={smallScaleMiningFormData.interviewAnswers.question3}
                  onChangeText={(text) => updateSmallScaleMiningInterviewData('question3', text)}
                  multiline
                />
              </View>
              
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>4. {ts.question4}</Text>
                <TextInput 
                  style={styles.answerInput}
                  placeholder={ts.answerHere}
                  value={smallScaleMiningFormData.interviewAnswers.question4}
                  onChangeText={(text) => updateSmallScaleMiningInterviewData('question4', text)}
                  multiline
                />
              </View>
              
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>5. {ts.question5}</Text>
                <TextInput 
                  style={styles.answerInput}
                  placeholder={ts.answerHere}
                  value={smallScaleMiningFormData.interviewAnswers.question5}
                  onChangeText={(text) => updateSmallScaleMiningInterviewData('question5', text)}
                  multiline
                />
              </View>
              
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>6. {ts.question6}</Text>
                <TextInput 
                  style={styles.answerInput}
                  placeholder={ts.answerHere}
                  value={smallScaleMiningFormData.interviewAnswers.question6}
                  onChangeText={(text) => updateSmallScaleMiningInterviewData('question6', text)}
                  multiline
                />
              </View>
            </View>
          )}
        </>
      )}

      {/* Common Fields for Both Operating and Non-Operating */}
      {/* Name of Operator/s */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{ts.operatorName}</Text>
        <TextInput 
          style={styles.textInput}
          value={smallScaleMiningFormData.operatorName}
          onChangeText={(text) => updateSmallScaleMiningFormData('operatorName', text)}
        />
      </View>

      {/* Address of Operator/s */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{ts.operatorAddress}</Text>
        <TextInput 
          style={styles.textInput}
          value={smallScaleMiningFormData.operatorAddress}
          onChangeText={(text) => updateSmallScaleMiningFormData('operatorAddress', text)}
        />
      </View>

      {/* How did you determine the operator/s */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{ts.operatorDetermination}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          placeholder={ts.operatorDeterminationPlaceholder}
          multiline
          value={smallScaleMiningFormData.operatorDetermination}
          onChangeText={(text) => updateSmallScaleMiningFormData('operatorDetermination', text)}
        />
      </View>

      {/* Additional Information */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{ts.additionalInfo}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={smallScaleMiningFormData.additionalInfo}
          onChangeText={(text) => updateSmallScaleMiningFormData('additionalInfo', text)}
        />
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>{ts.attachPhotos}</Text>
          <TouchableOpacity 
            style={[styles.uploadButton, isUploadingImages && styles.buttonDisabled]}
            onPress={handleImageUpload}
            disabled={isUploadingImages}
          >
            <Ionicons name="images-outline" size={20} color="white" />
            <Text style={styles.uploadText}>
              {isUploadingImages ? 'Uploading...' : ts.uploadGallery}
            </Text>
          </TouchableOpacity>
          {uploadedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewTitle}>
                {language === 'english' 
                  ? `Uploaded Images (${uploadedImages.length})` 
                  : `Mga Na-upload na Larawan (${uploadedImages.length})`
                }
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                {uploadedImages.map((image, index) => (
                  <View key={image.id || `smallscale_image_${index}_${Date.now()}`} style={styles.imagePreviewItem}>
                    <TouchableOpacity
                      onPress={() => openImagePreview(uploadedImages, index)}
                      style={styles.imagePreviewTouchable}
                    >
                      <Image 
                        source={{ uri: image.url || image.uri || image.preview }} 
                        style={styles.imagePreview}
                        onError={(error) => console.log('Image load error:', error)}
                      />
                      <View style={styles.imagePreviewOverlayIcon}>
                        <Ionicons name="eye" size={16} color="white" />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                    {image.geotagged && (
                      <View style={styles.geotaggedIndicator}>
                        <Ionicons name="location" size={12} color="white" />
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Certification Statement */}
      <View style={styles.certificationSection}>
        <Text style={styles.certificationTitle}>{ts.certificationTitle}</Text>
        <Text style={styles.certificationText}>
          {ts.certificationText1}
        </Text>
        <Text style={styles.certificationText}>
          {ts.certificationText2}
        </Text>
      </View>

      {/* Save as Draft Button */}
      <TouchableOpacity 
        style={[styles.saveAsDraftButton, isSavingDraft && styles.submitButtonDisabled]} 
        onPress={handleSaveAsDraft}
        disabled={isSavingDraft || isSubmitting}
      >
        <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.saveAsDraftText}>
          {isSavingDraft ? 'Saving...' : (isEditingMode ? 'Update Draft' : 'Save as Draft')}
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitToMGBButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmitReport}
        disabled={isSubmitting}
      >
        <Text style={styles.submitToMGBText}>
          {isSubmitting ? 'Submitting...' : ts.submitButton}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  ), [smallScaleMiningFormData, updateSmallScaleMiningFormData, updateSmallScaleMiningActivityData, updateSmallScaleMiningEquipmentData, updateSmallScaleMiningObservationData, updateSmallScaleMiningInterviewData, ts, language]);

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
            <View style={{ width: 24 }} />
          </View>
          
          {selectedCategory?.id === 'illegal_mining' ? IllegalMiningChecklist : 
           selectedCategory?.id === 'illegal_transport' ? IllegalTransportationChecklist :
           selectedCategory?.id === 'illegal_processing' ? IllegalProcessingChecklist :
           selectedCategory?.id === 'illegal_trading' ? IllegalTradingChecklist :
           selectedCategory?.id === 'illegal_exploration' ? IllegalExplorationChecklist :
           selectedCategory?.id === 'illegal_smallscale' ? IllegalSmallScaleMiningChecklist : (
            <ScrollView style={styles.checklistContent}>
              <Text style={styles.placeholderText}>
                Checklist for {selectedCategory?.english} will be implemented here.
              </Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  ), [showChecklistModal, selectedCategory, language, IllegalMiningChecklist, IllegalTransportationChecklist, IllegalProcessingChecklist, IllegalTradingChecklist, IllegalExplorationChecklist, IllegalSmallScaleMiningChecklist]);

  // Image Preview Modal Component
  const ImagePreviewModal = () => {
    if (!showImagePreview || currentImages.length === 0) return null;

    const currentImage = currentImages[selectedImageIndex];

    return (
      <Modal visible={showImagePreview} transparent animationType="fade">
        <View style={styles.imagePreviewOverlay}>
          {/* Header */}
          <View style={styles.imagePreviewHeader}>
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {selectedImageIndex + 1} of {currentImages.length}
              </Text>
            </View>
            <View style={styles.imagePreviewActions}>
              <TouchableOpacity 
                style={styles.imageActionButton}
                onPress={() => setIsEditingImages(!isEditingImages)}
              >
                <Ionicons name={isEditingImages ? "checkmark" : "create"} size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.imageActionButton}
                onPress={closeImagePreview}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: currentImage.url || currentImage.uri || currentImage.preview }}
              style={styles.fullScreenImage}
              resizeMode="contain"
              onError={(error) => {
                console.log('Full screen image load error:', error.nativeEvent.error);
                console.log('Image URI:', currentImage.url || currentImage.uri || currentImage.preview);
              }}
            />
            
            {/* Navigation Arrows */}
            {currentImages.length > 1 && (
              <>
                {selectedImageIndex > 0 && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.prevButton]}
                    onPress={() => setSelectedImageIndex(selectedImageIndex - 1)}
                  >
                    <Ionicons name="chevron-back" size={30} color="white" />
                  </TouchableOpacity>
                )}
                {selectedImageIndex < currentImages.length - 1 && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.nextButton]}
                    onPress={() => setSelectedImageIndex(selectedImageIndex + 1)}
                  >
                    <Ionicons name="chevron-forward" size={30} color="white" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Bottom Actions (shown when editing) */}
          {isEditingImages && (
            <View style={styles.imageEditActions}>
              <TouchableOpacity 
                style={[styles.editActionButton, styles.deleteButton]}
                onPress={() => handleDeleteImageFromPreview(selectedImageIndex)}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.editActionText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editActionButton, styles.addButton]}
                onPress={handleAddNewImages}
                disabled={isUploadingNewImages}
              >
                <Ionicons name={isUploadingNewImages ? "hourglass" : "add"} size={20} color="white" />
                <Text style={styles.editActionText}>
                  {isUploadingNewImages ? "Adding..." : "Add New"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Thumbnail Strip */}
          {currentImages.length > 1 && (
            <View style={styles.thumbnailStrip}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {currentImages.map((image, index) => (
                  <TouchableOpacity
                    key={image.id || `preview_${index}_${image.url || image.uri || index}`}
                    style={[
                      styles.thumbnailStripItem,
                      index === selectedImageIndex && styles.activeThumbnail
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Image 
                      source={{ uri: image.url || image.uri || image.preview }}
                      style={styles.thumbnailStripImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Reports</Text>
            <Text style={styles.headerSubtitle}>Mining violations and incidents</Text>
          </View>
          
          {/* Network Status and Sync */}
          <View style={styles.headerActions}>
            {/* Network Status Indicator */}
            <View style={[styles.networkStatus, { backgroundColor: networkStatus.isOnline ? '#4CAF50' : '#F44336' }]}>
              <Ionicons 
                name={networkStatus.isOnline ? 'wifi' : 'wifi-outline'} 
                size={12} 
                color="white" 
              />
              <Text style={styles.networkStatusText}>
                {networkStatus.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
            
            {/* Sync Button */}
            {syncStatus.canSync && (
              <TouchableOpacity 
                style={styles.syncButton}
                onPress={handleSyncDrafts}
              >
                <Ionicons name="sync" size={16} color={COLORS.primary} />
                <Text style={styles.syncButtonText}>{syncStatus.unsyncedCount}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Ionicons 
            name={activeTab === 'reports' ? 'document-text' : 'document-text-outline'} 
            size={20} 
            color={activeTab === 'reports' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>My Reports</Text>
          {reports.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{reports.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drafts' && styles.activeTab]}
          onPress={() => setActiveTab('drafts')}
        >
          <Ionicons 
            name={activeTab === 'drafts' ? 'create' : 'create-outline'} 
            size={20} 
            color={activeTab === 'drafts' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'drafts' && styles.activeTabText]}>My Drafts</Text>
          {drafts.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{drafts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab === 'reports' ? 'reports' : 'drafts'}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Reports List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading {activeTab}...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredData()}
          keyExtractor={(item, index) => item._id || item.reportId || item.draftId || `item_${index}`}
          renderItem={({ item, index }) => <ReportCard item={item} index={index} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshReports}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name={activeTab === 'reports' ? 'document-outline' : 'create-outline'} 
                size={60} 
                color={COLORS.textSecondary} 
              />
              <Text style={styles.emptyText}>
                {activeTab === 'reports' ? 'No reports yet' : 'No drafts yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'reports' 
                  ? 'Submit your first report using the button below' 
                  : 'Start creating a report to save as draft'
                }
              </Text>
            </View>
          }
        />
      )}

      {/* New Report Button */}
      <TouchableOpacity
        style={styles.newReportButton}
        onPress={() => setShowCategoryModal(true)}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={styles.newReportButtonText}>{language === 'english' ? 'New Report' : 'Bagong Report'}</Text>
      </TouchableOpacity>

      {/* Modals */}
      <CategorySelectionModal />
      {ChecklistModal}
      <ReportDetailModal />
      <DraftDetailModal />
      <ImagePreviewModal />
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  networkStatusText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
  },
  syncButtonText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 8,
  },
  activeTab: {
    backgroundColor: `${COLORS.primary}15`,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  // Search and Filter Styles
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  // Loading Styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
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
    marginTop: 5,
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
  cardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  offlineBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  cardInfo: {
    gap: 8,
    marginBottom: 8,
  },
  cardFooter: {
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  draftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  draftActionText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  detailSectionTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
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
    marginVertical: 6,
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
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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
    flex: 1,
    marginHorizontal: 4,
  },
  coordinateLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginBottom: 4,
    fontWeight: '600',
  },
  coordinateField: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 45,
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
  },
  getLocationButton: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  getLocationText: {
    fontSize: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 4,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
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
  nonOperatingSection: {
    backgroundColor: '#FFF9E6',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  equipmentText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 24,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  observationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  observationText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  interviewNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  guideQuestionsSection: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  guideQuestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 20,
  },
  answerInput: {
    minHeight: 60,
    textAlignVertical: 'top',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  uploadText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  usePhoneText: {
    fontSize: 14,
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
  // GPS and Image Upload Styles
  gpsContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gpsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gpsField: {
    flex: 1,
  },
  gpsButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  gpsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  imageUploadButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  imageUploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imagePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  imageScrollView: {
    flexDirection: 'row',
  },
  imagePreviewItem: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreviewTouchable: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  imagePreviewOverlayIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    zIndex: 10,
  },
  geotaggedIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 2,
    zIndex: 5,
  },
  // Loading Animation Styles
  buttonSpinner: {
    marginRight: 8,
  },
  certificationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  saveAsDraftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 8,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  saveAsDraftText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  submitToMGBButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitToMGBText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
    coordinateInput: {
      flex: 1,
    },
    coordinateField: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 4,
      padding: 12,
      fontSize: 14,
      color: COLORS.textPrimary,
      backgroundColor: COLORS.white,
      minHeight: 45,
    },
    backgroundColor: COLORS.inputBackground,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    minHeight: 45,
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
  violationTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  documentTypes: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  subLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  // Detail Modal Styles
  detailModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  detailScrollView: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  detailSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  editDraftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  editDraftButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  
  // Image Preview Styles
  attachmentScrollView: {
    marginTop: 8,
  },
  attachmentThumbnail: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllImagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewAllImagesText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  // Full Screen Image Preview Styles
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 9999,
    elevation: 9999,
  },
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  imageCounter: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  imagePreviewActions: {
    flexDirection: 'row',
    gap: 15,
  },
  imageActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  imageEditActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  editActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  editActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  thumbnailStrip: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  thumbnailStripItem: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: COLORS.primary,
  },
  thumbnailStripImage: {
    width: '100%',
    height: '100%',
  },
  // Two-column layout for activities
  twoColumnContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  column: {
    flex: 1,
  },
  // Inline checkboxes
  inlineCheckboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  inlineCheckboxes: {
    flexDirection: 'row',
    gap: 20,
  },
  inlineCheckboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  // Compact activity row
  compactActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    marginBottom: 8,
  },
  compactActivityText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  // Justified text
  justifiedText: {
    textAlign: 'justify',
    lineHeight: 20,
  },
});
