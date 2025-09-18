import * as Location from 'expo-location';
import { Alert } from 'react-native';

class LocationService {
  async getCurrentLocation() {
    try {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get GPS coordinates. Please enable location access in your device settings.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 10000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      };
    } catch (error) {
      console.error('Error getting location:', error);
      
      let errorMessage = 'Unable to get your current location. ';
      
      if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage += 'Location request timed out. Please make sure GPS is enabled and try again.';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage += 'Location services are not available. Please enable GPS and try again.';
      } else {
        errorMessage += 'Please check your GPS settings and try again.';
      }
      
      Alert.alert('Location Error', errorMessage, [{ text: 'OK' }]);
      return null;
    }
  }

  async getLocationFromCoordinates(latitude, longitude) {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        return {
          street: location.street || '',
          city: location.city || '',
          region: location.region || '',
          country: location.country || '',
          postalCode: location.postalCode || '',
          formattedAddress: this.formatAddress(location)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  formatAddress(location) {
    const parts = [];
    
    if (location.street) parts.push(location.street);
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    
    return parts.join(', ');
  }

  validateCoordinates(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return { valid: false, message: 'Coordinates must be valid numbers' };
    }
    
    if (lat < -90 || lat > 90) {
      return { valid: false, message: 'Latitude must be between -90 and 90' };
    }
    
    if (lng < -180 || lng > 180) {
      return { valid: false, message: 'Longitude must be between -180 and 180' };
    }
    
    return { valid: true };
  }

  formatCoordinates(latitude, longitude, decimals = 6) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return { latitude: '', longitude: '' };
    }
    
    return {
      latitude: lat.toFixed(decimals),
      longitude: lng.toFixed(decimals)
    };
  }
}

export default new LocationService();
