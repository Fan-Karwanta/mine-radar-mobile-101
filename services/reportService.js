import { API_BASE_URL } from '../constants/api';

class ReportService {
  // Submit a new report
  async submitReport(reportData, attachments = []) {
    try {
      const formData = new FormData();
      
      // Map frontend report types to backend expected types
      const reportTypeMapping = {
        'illegal_mining': 'illegal_mining',
        'illegal_transportation': 'illegal_transport',
        'illegal_processing': 'illegal_processing',
        'illegal_trading': 'illegal_trading',
        'illegal_exploration': 'illegal_exploration',
        'illegal_small_scale_mining': 'illegal_smallscale'
      };
      
      // Add basic report data
      formData.append('reportType', reportTypeMapping[reportData.type] || reportData.type);
      formData.append('language', reportData.language || 'english');
      formData.append('submittedBy', reportData.reporterId || reportData.submittedBy);
      
      // Add GPS location
      formData.append('gpsLocation', JSON.stringify({
        latitude: parseFloat(reportData.latitude) || 0,
        longitude: parseFloat(reportData.longitude) || 0
      }));
      
      // Add common fields
      formData.append('location', reportData.location || '');
      formData.append('incidentDate', reportData.date || '');
      formData.append('incidentTime', reportData.time || '');
      
      // Handle commodity - if "Others" is selected, use commodityOther value
      const commodityValue = reportData.commodity === 'Others' && reportData.commodityOther 
        ? reportData.commodityOther 
        : reportData.commodity || '';
      formData.append('commodity', commodityValue);
      
      formData.append('additionalInfo', reportData.additionalInfo || '');
      
      // Add project info if applicable
      if (reportData.hasSignboard !== undefined || reportData.projectName) {
        formData.append('projectInfo', JSON.stringify({
          hasSignboard: reportData.hasSignboard === true ? 'yes' : 
                       reportData.hasSignboard === false ? 'no' : 'not_determined',
          projectName: reportData.projectName || ''
        }));
      }
      
      // Add operator info if applicable
      if (reportData.operatorName || reportData.operatorAddress || reportData.operatorDetermination) {
        formData.append('operatorInfo', JSON.stringify({
          name: reportData.operatorName || '',
          address: reportData.operatorAddress || '',
          determinationMethod: reportData.operatorDetermination || ''
        }));
      }
      
      // Add type-specific data based on report type
      const mappedReportType = reportTypeMapping[reportData.type] || reportData.type;
      switch (mappedReportType) {
        case 'illegal_mining':
          formData.append('siteStatus', reportData.siteStatus || 'operating');
          formData.append('miningData', JSON.stringify(this.prepareMiningData(reportData)));
          break;
          
        case 'illegal_transport':
          formData.append('transportData', JSON.stringify(this.prepareTransportData(reportData)));
          break;
          
        case 'illegal_processing':
          formData.append('siteStatus', reportData.siteStatus || 'operating');
          formData.append('processingData', JSON.stringify(this.prepareProcessingData(reportData)));
          break;
          
        case 'illegal_trading':
          formData.append('tradingData', JSON.stringify(this.prepareTradingData(reportData)));
          break;
          
        case 'illegal_exploration':
          formData.append('explorationData', JSON.stringify(this.prepareExplorationData(reportData)));
          break;
          
        case 'illegal_smallscale':
          formData.append('siteStatus', reportData.siteStatus || 'operating');
          formData.append('smallScaleData', JSON.stringify(this.prepareSmallScaleData(reportData)));
          break;
      }
      
      // Add attachments from reportData.attachments (already uploaded to Cloudinary)
      if (reportData.attachments && reportData.attachments.length > 0) {
        // Send as JSON string since images are already uploaded to Cloudinary
        formData.append('cloudinaryAttachments', JSON.stringify(
          reportData.attachments.map(att => ({
            filename: att.publicId || `image_${Date.now()}`,
            path: att.url, // Cloudinary URL
            uploadedAt: att.uploadedAt || new Date().toISOString(),
            geotagged: att.geotagged || false
          }))
        ));
      }
      
      // Add legacy attachments parameter if provided (for backward compatibility)
      if (attachments && attachments.length > 0) {
        attachments.forEach((attachment, index) => {
          if (attachment.uri) {
            formData.append('attachments', {
              uri: attachment.uri,
              type: attachment.type || 'image/jpeg',
              name: attachment.name || `attachment_${index}.jpg`
            });
          }
        });
      }
      
      console.log('🌐 Sending report to:', `${API_BASE_URL}/reports`);
      
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let fetch handle it for FormData
      });
      
      console.log('📨 Response status:', response.status);
      
      // Try to parse response as JSON
      let result;
      try {
        const responseText = await response.text();
        console.log('📨 Response body:', responseText);
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        console.error('❌ Server error:', result);
        throw new Error(result.message || `Server error: ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error submitting report:', error);
      console.error('Error message:', error.message);
      throw error;
    }
  }
  
  // Get all reports with filtering
  async getReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/reports?${queryParams}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch reports');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }
  
  // Get reports by user
  async getUserReports(userId, page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/user/${userId}?page=${page}&limit=${limit}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch user reports');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching user reports:', error);
      throw error;
    }
  }
  
  // Get drafts by user
  async getUserDrafts(userId, page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/reportdrafts/user/${userId}?page=${page}&limit=${limit}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch user drafts');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching user drafts:', error);
      throw error;
    }
  }
  
  // Get report statistics
  async getReportStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/stats`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch report statistics');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      throw error;
    }
  }
  
  // Save report as draft
  async saveDraft(reportData, attachments = []) {
    try {
      const formData = new FormData();
      
      // Map frontend report types to backend expected types
      const reportTypeMapping = {
        'illegal_mining': 'illegal_mining',
        'illegal_transportation': 'illegal_transport',
        'illegal_processing': 'illegal_processing',
        'illegal_trading': 'illegal_trading',
        'illegal_exploration': 'illegal_exploration',
        'illegal_small_scale_mining': 'illegal_smallscale'
      };
      
      // Add basic report data
      formData.append('reportType', reportTypeMapping[reportData.type] || reportData.type);
      formData.append('language', reportData.language || 'english');
      formData.append('submittedBy', reportData.reporterId || reportData.submittedBy);
      formData.append('status', 'draft');
      formData.append('isDraft', 'true');
      
      // Add GPS location
      formData.append('gpsLocation', JSON.stringify({
        latitude: parseFloat(reportData.latitude) || 0,
        longitude: parseFloat(reportData.longitude) || 0
      }));
      
      // Add common fields
      formData.append('location', reportData.location || '');
      formData.append('incidentDate', reportData.date || '');
      formData.append('incidentTime', reportData.time || '');
      
      // Handle commodity - if "Others" is selected, use commodityOther value
      const commodityValue = reportData.commodity === 'Others' && reportData.commodityOther 
        ? reportData.commodityOther 
        : reportData.commodity || '';
      formData.append('commodity', commodityValue);
      
      formData.append('additionalInfo', reportData.additionalInfo || '');
      
      // Add project info if applicable
      if (reportData.hasSignboard !== undefined || reportData.projectName) {
        formData.append('projectInfo', JSON.stringify({
          hasSignboard: reportData.hasSignboard === true ? 'yes' : 
                       reportData.hasSignboard === false ? 'no' : 'not_determined',
          projectName: reportData.projectName || ''
        }));
      }
      
      // Add operator info if applicable
      if (reportData.operatorName || reportData.operatorAddress || reportData.operatorDetermination) {
        formData.append('operatorInfo', JSON.stringify({
          name: reportData.operatorName || '',
          address: reportData.operatorAddress || '',
          determinationMethod: reportData.operatorDetermination || ''
        }));
      }
      
      // Add type-specific data
      const mappedReportType = reportTypeMapping[reportData.type] || reportData.type;
      switch (mappedReportType) {
        case 'illegal_mining':
          formData.append('siteStatus', reportData.siteStatus || 'operating');
          formData.append('miningData', JSON.stringify(this.prepareMiningData(reportData)));
          break;
        case 'illegal_transport':
          formData.append('transportData', JSON.stringify(this.prepareTransportData(reportData)));
          break;
        case 'illegal_processing':
          formData.append('siteStatus', reportData.siteStatus || 'operating');
          formData.append('processingData', JSON.stringify(this.prepareProcessingData(reportData)));
          break;
        case 'illegal_trading':
          formData.append('tradingData', JSON.stringify(this.prepareTradingData(reportData)));
          break;
        case 'illegal_exploration':
          formData.append('explorationData', JSON.stringify(this.prepareExplorationData(reportData)));
          break;
        case 'illegal_smallscale':
          formData.append('siteStatus', reportData.siteStatus || 'operating');
          formData.append('smallScaleData', JSON.stringify(this.prepareSmallScaleData(reportData)));
          break;
      }
      
      // Add attachments from reportData.attachments
      if (reportData.attachments && reportData.attachments.length > 0) {
        reportData.attachments.forEach((attachment, index) => {
          if (attachment.uri) {
            formData.append('attachments', {
              uri: attachment.uri,
              type: attachment.type || 'image/jpeg',
              name: attachment.name || `attachment_${index}.jpg`
            });
          }
        });
      }
      
      // Add legacy attachments parameter if provided
      if (attachments && attachments.length > 0) {
        attachments.forEach((attachment, index) => {
          formData.append('attachments', {
            uri: attachment.uri,
            type: attachment.type || 'image/jpeg',
            name: attachment.name || `attachment_${index}.jpg`
          });
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/reportdrafts`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save draft');
      }
      
      return result;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }
  
  // Update existing draft
  async updateDraft(draftId, reportData, attachments = []) {
    try {
      const formData = new FormData();
      
      // Map frontend report types to backend expected types
      const reportTypeMapping = {
        'illegal_mining': 'illegal_mining',
        'illegal_transportation': 'illegal_transport',
        'illegal_processing': 'illegal_processing',
        'illegal_trading': 'illegal_trading',
        'illegal_exploration': 'illegal_exploration',
        'illegal_small_scale_mining': 'illegal_smallscale'
      };
      
      // Add basic report data
      formData.append('reportType', reportTypeMapping[reportData.type] || reportData.type);
      formData.append('language', reportData.language || 'english');
      formData.append('submittedBy', reportData.reporterId || reportData.submittedBy);
      formData.append('status', 'draft');
      formData.append('isDraft', 'true');
      
      // Add GPS location
      formData.append('gpsLocation', JSON.stringify({
        latitude: parseFloat(reportData.latitude) || 0,
        longitude: parseFloat(reportData.longitude) || 0
      }));
      
      // Add common fields
      formData.append('location', reportData.location || '');
      formData.append('incidentDate', reportData.date || '');
      formData.append('incidentTime', reportData.time || '');
      
      // Handle commodity - if "Others" is selected, use commodityOther value
      const commodityValue = reportData.commodity === 'Others' && reportData.commodityOther 
        ? reportData.commodityOther 
        : reportData.commodity || '';
      formData.append('commodity', commodityValue);
      
      formData.append('additionalInfo', reportData.additionalInfo || '');
      
      // Add project info if applicable
      if (reportData.hasSignboard !== undefined || reportData.projectName) {
        formData.append('projectInfo', JSON.stringify({
          hasSignboard: reportData.hasSignboard === true ? 'yes' : 
                       reportData.hasSignboard === false ? 'no' : 'not_determined',
          projectName: reportData.projectName || ''
        }));
      }
      
      // Add operator info if applicable
      if (reportData.operatorName || reportData.operatorAddress || reportData.operatorDetermination) {
        formData.append('operatorInfo', JSON.stringify({
          name: reportData.operatorName || '',
          address: reportData.operatorAddress || '',
          determinationMethod: reportData.operatorDetermination || ''
        }));
      }
      
      // Add type-specific data
      const mappedReportType = reportTypeMapping[reportData.type] || reportData.type;
      switch (mappedReportType) {
        case 'illegal_mining':
          formData.append('siteStatus', reportData.siteStatus || 'operating');
          formData.append('miningData', JSON.stringify(this.prepareMiningData(reportData)));
          break;
        case 'illegal_transport':
          formData.append('transportData', JSON.stringify(this.prepareTransportData(reportData)));
          break;
        case 'illegal_processing':
          formData.append('siteStatus', reportData.siteStatus || 'operating');
          formData.append('processingData', JSON.stringify(this.prepareProcessingData(reportData)));
          break;
        case 'illegal_trading':
          formData.append('tradingData', JSON.stringify(this.prepareTradingData(reportData)));
          break;
        case 'illegal_exploration':
          formData.append('explorationData', JSON.stringify(this.prepareExplorationData(reportData)));
          break;
        case 'illegal_smallscale':
          formData.append('siteStatus', reportData.siteStatus || 'operating');
          formData.append('smallScaleData', JSON.stringify(this.prepareSmallScaleData(reportData)));
          break;
      }
      
      // Add attachments
      if (reportData.attachments && reportData.attachments.length > 0) {
        reportData.attachments.forEach((attachment, index) => {
          if (attachment.uri) {
            formData.append('attachments', {
              uri: attachment.uri,
              type: attachment.type || 'image/jpeg',
              name: attachment.name || `attachment_${index}.jpg`
            });
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/reportdrafts/${draftId}`, {
        method: 'PUT',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update draft');
      }
      
      return result;
    } catch (error) {
      console.error('Error updating draft:', error);
      throw error;
    }
  }
  
  // Delete draft
  async deleteDraft(draftId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reportdrafts/${draftId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete draft');
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  }
  
  // Helper methods to prepare type-specific data
  prepareMiningData(reportData) {
    // Convert equipment strings to arrays by splitting on common delimiters
    const parseEquipment = (equipmentString) => {
      if (!equipmentString || equipmentString.trim() === '') return [];
      return equipmentString.split(/[,/]/).map(item => item.trim()).filter(item => item.length > 0);
    };

    return {
      operatingActivities: {
        extraction: {
          active: reportData.activities?.extraction || false,
          equipment: parseEquipment(reportData.equipmentUsed?.extraction || '')
        },
        disposition: {
          active: reportData.activities?.disposition || false,
          equipment: parseEquipment(reportData.equipmentUsed?.disposition || '')
        },
        processing: {
          active: reportData.activities?.processing || false,
          equipment: parseEquipment(reportData.equipmentUsed?.processing || '')
        }
      },
      nonOperatingObservations: reportData.nonOperatingObservations || {
        excavations: false,
        accessRoad: false,
        processingFacility: false
      },
      interview: {
        conducted: reportData.conductedInterview || false,
        responses: reportData.guideQuestions || {}
      }
    };
  }
  
  prepareTransportData(reportData) {
    return {
      violationType: reportData.violationType,
      documentType: reportData.documentType || '',
      materialInfo: {
        volumeWeight: reportData.volumeWeight || '',
        unit: reportData.unit || ''
      },
      vehicleInfo: {
        type: reportData.vehicleType || '',
        description: reportData.vehicleDescription || '',
        bodyColor: reportData.vehicleBodyColor || '',
        plateNumber: reportData.plateNumber || ''
      },
      ownerOperator: {
        name: reportData.ownerOperator || '',
        address: reportData.ownerAddress || ''
      },
      driver: {
        name: reportData.driver || '',
        address: reportData.driverAddress || ''
      },
      sourceOfMaterials: reportData.sourceOfMaterials || '',
      actionsTaken: reportData.actionsTaken || ''
    };
  }
  
  prepareProcessingData(reportData) {
    return {
      facilityInfo: {
        type: reportData.facilityType || '',
        processingProducts: reportData.processingProducts || ''
      },
      rawMaterials: {
        sourceName: reportData.rawMaterialsName || '',
        sourceLocation: reportData.rawMaterialsLocation || '',
        determinationMethod: reportData.rawMaterialsDetermination || ''
      }
    };
  }
  
  prepareTradingData(reportData) {
    return {
      violationType: 'trading_without_permit',
      businessInfo: {
        name: reportData.businessName || '',
        owner: reportData.businessOwner || '',
        location: reportData.businessLocation || ''
      },
      commoditySource: {
        name: reportData.sourceOfCommodityName || '',
        location: reportData.sourceOfCommodityLocation || '',
        determinationMethod: reportData.sourceOfCommodityDetermination || ''
      },
      stockpiledMaterials: reportData.stockpiledMaterials || 'not_determined',
      dtiRegistration: reportData.dtiRegistration || 'not_determined'
    };
  }
  
  prepareExplorationData(reportData) {
    return {
      activities: reportData.activities || {
        drilling: false,
        testPitting: false,
        trenching: false,
        shaftSinking: false,
        tunneling: false,
        others: false
      },
      othersActivity: reportData.othersActivity || ''
    };
  }
  
  prepareSmallScaleData(reportData) {
    return {
      operatingActivities: reportData.activities || {
        extraction: false,
        disposition: false,
        mineralProcessing: false,
        tunneling: false,
        shaftSinking: false,
        goldPanning: false,
        amalgamation: false,
        others: false
      },
      equipmentUsed: reportData.equipmentUsed || {
        extraction: '',
        disposition: '',
        mineralProcessing: ''
      },
      othersActivity: reportData.othersActivity || '',
      nonOperatingObservations: reportData.observations || {
        excavations: false,
        stockpiles: false,
        tunnels: false,
        mineShafts: false,
        accessRoad: false,
        processingFacility: false
      },
      interview: {
        conducted: reportData.interviewConducted || false,
        responses: reportData.interviewAnswers || {}
      }
    };
  }
}

export default new ReportService();
