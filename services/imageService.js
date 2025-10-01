import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../constants/api';

class ImageService {
  async requestPermissions() {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Media library access is required to upload images. Please enable this permission in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async pickImageFromGallery(options = {}) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const defaultOptions = {
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
        exif: true, // Include EXIF data for geotagging
      };

      const result = await ImagePicker.launchImageLibraryAsync({
        ...defaultOptions,
        ...options
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      
      return {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize,
        width: asset.width,
        height: asset.height,
        exif: asset.exif || null,
        geotagged: this.hasGeoData(asset.exif)
      };
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return null;
    }
  }

  async pickMultipleImages(maxImages = 5) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return [];

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
        exif: true,
      });

      if (result.canceled) {
        return [];
      }

      // Return images with preview data
      return result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
        size: asset.fileSize,
        width: asset.width,
        height: asset.height,
        exif: asset.exif || null,
        geotagged: this.hasGeoData(asset.exif),
        // Add preview data
        preview: asset.uri, // Use the same URI for preview
        isUploaded: false,
        uploadProgress: 0
      }));
    } catch (error) {
      console.error('Error picking multiple images:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
      return [];
    }
  }

  // Method to pick images for preview without immediate upload
  async pickImagesForPreview(maxImages = 5) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return [];

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
        exif: true,
      });

      if (result.canceled) {
        return [];
      }

      // Return images with preview data, ready for display
      return result.assets.map((asset, index) => ({
        id: `preview_${Date.now()}_${index}`,
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
        size: asset.fileSize,
        width: asset.width,
        height: asset.height,
        exif: asset.exif || null,
        geotagged: this.hasGeoData(asset.exif),
        preview: asset.uri,
        isUploaded: false,
        uploadProgress: 0,
        error: null
      }));
    } catch (error) {
      console.error('Error picking images for preview:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
      return [];
    }
  }

  hasGeoData(exif) {
    if (!exif) return false;
    return !!(exif.GPS && (exif.GPS.Latitude || exif.GPS.Longitude));
  }

  extractGeoData(exif) {
    if (!this.hasGeoData(exif)) return null;
    
    try {
      const gps = exif.GPS;
      return {
        latitude: gps.Latitude || null,
        longitude: gps.Longitude || null,
        altitude: gps.Altitude || null,
        timestamp: gps.TimeStamp || null
      };
    } catch (error) {
      console.error('Error extracting geo data:', error);
      return null;
    }
  }

  async uploadToCloudinary(imageData) {
    try {
      console.log('🌐 Uploading via backend to Cloudinary...');
      console.log('📦 Image:', imageData.name);
      console.log('📍 URI:', imageData.uri);

      // Prepare form data fields
      const uploadOptions = {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'image',
        headers: {
          'Accept': 'application/json',
        },
      };

      // Add geo data if available
      if (imageData.geotagged && imageData.exif) {
        const geoData = this.extractGeoData(imageData.exif);
        if (geoData) {
          uploadOptions.parameters = {
            geoData: JSON.stringify(geoData)
          };
        }
      }

      console.log('📡 Uploading to:', `${API_BASE_URL}/upload/image`);

      // Use FileSystem.uploadAsync for proper React Native file upload
      const uploadResult = await FileSystem.uploadAsync(
        `${API_BASE_URL}/upload/image`,
        imageData.uri,
        uploadOptions
      );

      console.log('📨 Upload response status:', uploadResult.status);
      console.log('📨 Upload response body:', uploadResult.body);

      if (uploadResult.status !== 200) {
        throw new Error(`Upload failed with status ${uploadResult.status}`);
      }

      const result = JSON.parse(uploadResult.body);

      if (!result.success) {
        console.error('❌ Backend error:', result);
        throw new Error(result.message || 'Failed to upload image');
      }

      console.log('✅ Upload successful:', result.url);

      return {
        success: true,
        url: result.url,
        publicId: result.publicId,
        geotagged: result.geotagged || imageData.geotagged,
        originalName: imageData.name,
        size: imageData.size,
        uploadedAt: result.uploadedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error uploading:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  }

  async uploadMultipleImages(images) {
    try {
      const uploadPromises = images.map(image => this.uploadToCloudinary(image));
      const results = await Promise.all(uploadPromises);
      
      const successful = results.filter(result => result.success);
      const failed = results.filter(result => !result.success);
      
      return {
        successful,
        failed,
        totalUploaded: successful.length,
        totalFailed: failed.length
      };
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      return {
        successful: [],
        failed: images.map(img => ({ success: false, error: error.message, originalName: img.name })),
        totalUploaded: 0,
        totalFailed: images.length
      };
    }
  }

  validateImageSize(imageData, maxSizeMB = 10) {
    if (!imageData.size) return { valid: true };
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (imageData.size > maxSizeBytes) {
      return {
        valid: false,
        message: `Image size (${(imageData.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of ${maxSizeMB}MB`
      };
    }
    
    return { valid: true };
  }

  getImageDimensions(imageData) {
    return {
      width: imageData.width || 0,
      height: imageData.height || 0,
      aspectRatio: imageData.width && imageData.height ? imageData.width / imageData.height : 1
    };
  }
}

export default new ImageService();
