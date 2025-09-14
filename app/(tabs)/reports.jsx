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

// Translation object for Illegal Mining
const illegalMiningTranslations = {
  english: {
    gpsLocation: 'GPS Location:',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    getCoordinates: 'Get Coordinates from Google Maps',
    location: 'Location:',
    locationPlaceholder: 'Sitio/Barangay/Municipality/City/Province',
    date: 'Date:',
    time: 'Time:',
    usePhoneDateTime: "Use phone's time and date",
    projectBoard: 'Is there a Project Information Board on Site? (check one box)',
    noSignboard: 'No signboard observed',
    notDetermined: 'Not determined',
    projectName: 'If yes, please indicate the name of the project:',
    commodity: 'Commodity:',
    commodityPlaceholder: 'Sand and Gravel/Filling Materials/Construction Aggregates/Rocks/Sand/Boulders/Base Course/Common Soil/Limestone/Silica/Others',
    siteStatus: 'Site Status during Verification: (dropdown box)',
    operating: 'Operating',
    nonOperating: 'Non-operating',
    operatingNote: '(If operating status, this checklist will appear)',
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
    nonOperatingNote: '(If non-operating status, this checklist will appear)',
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
    date: 'Petsa:',
    time: 'Oras:',
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
    operatingNote: '(Kung may operasyon, lalabas ang checklist na ito)',
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
    nonOperatingNote: '(Kung walang operasyon, lalabas ang checklist na ito)',
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
    date: 'Date:',
    time: 'Time:',
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
    date: 'Petsa:',
    time: 'Oras:',
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
    date: 'Date:',
    time: 'Time:',
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
    date: 'Petsa:',
    time: 'Oras:',
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
    date: 'Date:',
    time: 'Time:',
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
    date: 'Petsa:',
    time: 'Oras:',
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
      date: 'Date:',
      time: 'Time:',
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
      date: 'Petsa:',
      time: 'Oras:',
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

  // Form state for Illegal Mineral Processing checklist
  const [processingFormData, setProcessingFormData] = useState({
    latitude: '',
    longitude: '',
    location: '',
    date: '',
    time: '',
    hasSignboard: null, // null, true, false
    projectName: '',
    siteStatus: 'Operating', // 'Operating', 'Non-operating', 'Under construction'
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
        <TouchableOpacity style={styles.getLocationButton}>
          <Text style={styles.getLocationText}>{t.getCoordinates}</Text>
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
        <TouchableOpacity style={styles.usePhoneButton}>
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
        <TextInput 
          style={styles.textInput}
          placeholder={t.commodityPlaceholder}
          value={formData.commodity}
          onChangeText={(text) => updateFormData('commodity', text)}
          multiline
        />
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
                'Select site status',
                [
                  { text: t.operating, onPress: () => updateFormData('siteStatus', 'Operating') },
                  { text: t.nonOperating, onPress: () => updateFormData('siteStatus', 'Non-operating') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.dropdownText}>{formData.siteStatus === 'Operating' ? t.operating : t.nonOperating}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Operating Status Activities */}
      {formData.siteStatus === 'Operating' && (
        <View style={styles.operatingSection}>
          <Text style={styles.operatingNote}>{t.operatingNote}</Text>
          
          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>{t.activitiesObserved}</Text>
            <View style={styles.activitiesContainer}>
              <TouchableOpacity 
                style={styles.activityRow}
                onPress={() => updateNestedFormData('activities', 'extraction', !formData.activities.extraction)}
              >
                <View style={[styles.checkbox, formData.activities.extraction && styles.checkedBox]} />
                <Text style={styles.activityText}>{t.extraction}</Text>
                <Text style={styles.equipmentText}>{t.extractionEquipment}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.activityRow}
                onPress={() => updateNestedFormData('activities', 'disposition', !formData.activities.disposition)}
              >
                <View style={[styles.checkbox, formData.activities.disposition && styles.checkedBox]} />
                <Text style={styles.activityText}>{t.disposition}</Text>
                <Text style={styles.equipmentText}>{t.dispositionEquipment}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.activityRow}
                onPress={() => updateNestedFormData('activities', 'processing', !formData.activities.processing)}
              >
                <View style={[styles.checkbox, formData.activities.processing && styles.checkedBox]} />
                <Text style={styles.activityText}>{t.processing}</Text>
                <Text style={styles.equipmentText}>{t.processingEquipment}</Text>
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
      {formData.siteStatus === 'Non-operating' && (
        <View style={styles.nonOperatingSection}>
          <Text style={styles.operatingNote}>{t.nonOperatingNote}</Text>
          
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
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadText}>{t.uploadGallery}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton}>
            <Text style={styles.cameraText}>{t.useCamera}</Text>
          </TouchableOpacity>
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

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitToMGBButton} onPress={handleSubmitReport}>
        <Text style={styles.submitToMGBText}>{t.submitButton}</Text>
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
        <TouchableOpacity style={styles.getLocationButton}>
          <Text style={styles.getLocationText}>{tt.getCoordinates}</Text>
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
        <TouchableOpacity style={styles.usePhoneButton}>
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
          <TextInput 
            style={styles.textInput}
            placeholder="Specify document type"
            value={transportFormData.documentType}
            onChangeText={(text) => updateTransportFormData('documentType', text)}
          />
        )}
      </View>

      {/* Commodity */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.commodity}</Text>
        <TextInput 
          style={styles.textInput}
          placeholder={tt.commodityPlaceholder}
          value={transportFormData.commodity}
          onChangeText={(text) => updateTransportFormData('commodity', text)}
          multiline
        />
      </View>

      {/* Volume/Weight and Unit */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateInput}>
            <Text style={styles.sectionLabel}>{tt.volumeWeight}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="20"
              value={transportFormData.volumeWeight}
              onChangeText={(text) => updateTransportFormData('volumeWeight', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.sectionLabel}>{tt.unit}</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder={tt.unitPlaceholder}
              value={transportFormData.unit}
              onChangeText={(text) => updateTransportFormData('unit', text)}
            />
          </View>
        </View>
      </View>

      {/* Type of Vehicle */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{tt.vehicleType}</Text>
        <TextInput 
          style={styles.textInput}
          placeholder={tt.vehicleTypePlaceholder}
          value={transportFormData.vehicleType}
          onChangeText={(text) => updateTransportFormData('vehicleType', text)}
        />
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
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadText}>{tt.uploadGallery}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton}>
            <Text style={styles.cameraText}>{tt.useCamera}</Text>
          </TouchableOpacity>
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

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitToMGBButton} onPress={handleSubmitReport}>
        <Text style={styles.submitToMGBText}>{tt.submitButton}</Text>
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
        <TouchableOpacity style={styles.getLocationButton}>
          <Text style={styles.getLocationText}>{tp.getCoordinates}</Text>
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
        <TouchableOpacity style={styles.usePhoneButton}>
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
                  { text: tp.operating, onPress: () => updateProcessingFormData('siteStatus', 'Operating') },
                  { text: tp.nonOperating, onPress: () => updateProcessingFormData('siteStatus', 'Non-operating') },
                  { text: tp.underConstruction, onPress: () => updateProcessingFormData('siteStatus', 'Under construction') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {processingFormData.siteStatus === 'Operating' ? tp.operating : 
               processingFormData.siteStatus === 'Non-operating' ? tp.nonOperating : 
               processingFormData.siteStatus === 'Under construction' ? tp.underConstruction : tp.operating}
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
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadText}>{tp.uploadGallery}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton}>
            <Text style={styles.cameraText}>{tp.useCamera}</Text>
          </TouchableOpacity>
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

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitToMGBButton} onPress={handleSubmitReport}>
        <Text style={styles.submitToMGBText}>{tp.submitButton}</Text>
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
        <TouchableOpacity style={styles.getLocationButton}>
          <Text style={styles.getLocationText}>{td.getCoordinates}</Text>
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
        <TouchableOpacity style={styles.usePhoneButton}>
          <Text style={styles.usePhoneText}>{td.usePhoneDateTime}</Text>
        </TouchableOpacity>
      </View>

      {/* Type of Violation */}
      <View style={styles.checklistSection}>
        <Text style={styles.sectionLabel}>{td.violationType}</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateTradingFormData('violationType', !tradingFormData.violationType)}
          >
            <View style={[styles.checkbox, tradingFormData.violationType && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{td.tradingViolation}</Text>
          </TouchableOpacity>
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
        <TextInput 
          style={styles.textInput}
          placeholder={td.commodityPlaceholder}
          value={tradingFormData.commodity}
          onChangeText={(text) => updateTradingFormData('commodity', text)}
          multiline
        />
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
                'Select option',
                [
                  { text: td.yes, onPress: () => updateTradingFormData('stockpiledMaterials', 'yes') },
                  { text: td.no, onPress: () => updateTradingFormData('stockpiledMaterials', 'no') },
                  { text: td.none, onPress: () => updateTradingFormData('stockpiledMaterials', 'none') },
                  { text: td.notDetermined, onPress: () => updateTradingFormData('stockpiledMaterials', 'not_determined') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {tradingFormData.stockpiledMaterials === 'yes' ? td.yes :
               tradingFormData.stockpiledMaterials === 'no' ? td.no :
               tradingFormData.stockpiledMaterials === 'none' ? td.none :
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
        <Text style={styles.sectionLabel}>{td.additionalInfo}</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          multiline
          value={tradingFormData.additionalInfo}
          onChangeText={(text) => updateTradingFormData('additionalInfo', text)}
        />
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>{td.attachPhotos}</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadText}>{td.uploadGallery}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton}>
            <Text style={styles.cameraText}>{td.useCamera}</Text>
          </TouchableOpacity>
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

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitToMGBButton} onPress={handleSubmitReport}>
        <Text style={styles.submitToMGBText}>{td.submitButton}</Text>
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
        <TouchableOpacity style={styles.getLocationButton}>
          <Text style={styles.getLocationText}>{te.getCoordinates}</Text>
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
        <TouchableOpacity style={styles.usePhoneButton}>
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
            onPress={() => updateExplorationActivityData('drilling', !explorationFormData.activities.drilling)}
          >
            <View style={[styles.checkbox, explorationFormData.activities.drilling && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.drilling}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('testPitting', !explorationFormData.activities.testPitting)}
          >
            <View style={[styles.checkbox, explorationFormData.activities.testPitting && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.testPitting}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('trenching', !explorationFormData.activities.trenching)}
          >
            <View style={[styles.checkbox, explorationFormData.activities.trenching && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.trenching}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('shaftSinking', !explorationFormData.activities.shaftSinking)}
          >
            <View style={[styles.checkbox, explorationFormData.activities.shaftSinking && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.shaftSinking}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('tunneling', !explorationFormData.activities.tunneling)}
          >
            <View style={[styles.checkbox, explorationFormData.activities.tunneling && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.tunneling}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => updateExplorationActivityData('others', !explorationFormData.activities.others)}
          >
            <View style={[styles.checkbox, explorationFormData.activities.others && styles.checkedBox]} />
            <Text style={styles.checkboxText}>{te.others}</Text>
          </TouchableOpacity>
        </View>
        {explorationFormData.activities.others && (
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
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadText}>{te.uploadGallery}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton}>
            <Text style={styles.cameraText}>{te.useCamera}</Text>
          </TouchableOpacity>
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

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitToMGBButton} onPress={handleSubmitReport}>
        <Text style={styles.submitToMGBText}>{te.submitButton}</Text>
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
        <TouchableOpacity style={styles.getLocationButton}>
          <Text style={styles.getLocationText}>{ts.getCoordinates}</Text>
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
        <TouchableOpacity style={styles.usePhoneButton}>
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
        <TextInput 
          style={styles.textInput}
          placeholder={ts.commodityPlaceholder}
          value={smallScaleMiningFormData.commodity}
          onChangeText={(text) => updateSmallScaleMiningFormData('commodity', text)}
        />
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
                onPress={() => updateSmallScaleMiningActivityData('extraction', !smallScaleMiningFormData.activities.extraction)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities.extraction && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.extraction}</Text>
              </TouchableOpacity>
              {smallScaleMiningFormData.activities.extraction && (
                <TextInput 
                  style={styles.equipmentInput}
                  placeholder={ts.extractionEquipment}
                  value={smallScaleMiningFormData.equipmentUsed.extraction}
                  onChangeText={(text) => updateSmallScaleMiningEquipmentData('extraction', text)}
                />
              )}
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('disposition', !smallScaleMiningFormData.activities.disposition)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities.disposition && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.disposition}</Text>
              </TouchableOpacity>
              {smallScaleMiningFormData.activities.disposition && (
                <TextInput 
                  style={styles.equipmentInput}
                  placeholder={ts.dispositionEquipment}
                  value={smallScaleMiningFormData.equipmentUsed.disposition}
                  onChangeText={(text) => updateSmallScaleMiningEquipmentData('disposition', text)}
                />
              )}
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('mineralProcessing', !smallScaleMiningFormData.activities.mineralProcessing)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities.mineralProcessing && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.mineralProcessing}</Text>
              </TouchableOpacity>
              {smallScaleMiningFormData.activities.mineralProcessing && (
                <TextInput 
                  style={styles.equipmentInput}
                  placeholder={ts.processingEquipment}
                  value={smallScaleMiningFormData.equipmentUsed.mineralProcessing}
                  onChangeText={(text) => updateSmallScaleMiningEquipmentData('mineralProcessing', text)}
                />
              )}
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('tunneling', !smallScaleMiningFormData.activities.tunneling)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities.tunneling && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.tunneling}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('shaftSinking', !smallScaleMiningFormData.activities.shaftSinking)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities.shaftSinking && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.shaftSinking}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('goldPanning', !smallScaleMiningFormData.activities.goldPanning)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities.goldPanning && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.goldPanning}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('amalgamation', !smallScaleMiningFormData.activities.amalgamation)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities.amalgamation && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.amalgamation}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => updateSmallScaleMiningActivityData('others', !smallScaleMiningFormData.activities.others)}
              >
                <View style={[styles.checkbox, smallScaleMiningFormData.activities.others && styles.checkedBox]} />
                <Text style={styles.checkboxText}>{ts.others}</Text>
              </TouchableOpacity>
              {smallScaleMiningFormData.activities.others && (
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
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadText}>{ts.uploadGallery}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton}>
            <Text style={styles.cameraText}>{ts.useCamera}</Text>
          </TouchableOpacity>
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

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitToMGBButton} onPress={handleSubmitReport}>
        <Text style={styles.submitToMGBText}>{ts.submitButton}</Text>
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
            <TouchableOpacity onPress={() => Alert.alert('Profile', 'User profile options')}>
              <Ionicons name="person-circle-outline" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
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
        <Text style={styles.newReportButtonText}>{language === 'english' ? 'New Report' : 'Bagong Report'}</Text>
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
});
