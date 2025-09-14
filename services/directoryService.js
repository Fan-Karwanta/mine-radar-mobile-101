import { API_URL } from '../constants/api';

class DirectoryService {
  // Get Directory National records
  async getDirectoryNational(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.province) queryParams.append('province', params.province);
      if (params.status) queryParams.append('status', params.status);
      if (params.classification) queryParams.append('classification', params.classification);
      if (params.type) queryParams.append('type', params.type);

      const response = await fetch(`${API_URL}/directory/national?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Directory National:', error);
      throw error;
    }
  }

  // Get Directory Local records
  async getDirectoryLocal(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.province) queryParams.append('province', params.province);
      if (params.status) queryParams.append('status', params.status);
      if (params.classification) queryParams.append('classification', params.classification);
      if (params.type) queryParams.append('type', params.type);

      const response = await fetch(`${API_URL}/directory/local?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Directory Local:', error);
      throw error;
    }
  }

  // Get Directory Hotspots records
  async getDirectoryHotspots(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.province) queryParams.append('province', params.province);
      if (params.municipality) queryParams.append('municipality', params.municipality);

      const response = await fetch(`${API_URL}/directory/hotspots?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Directory Hotspots:', error);
      throw error;
    }
  }

  // Get single record by ID
  async getDirectoryNationalById(id) {
    try {
      const response = await fetch(`${API_URL}/directory/national/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Directory National record:', error);
      throw error;
    }
  }

  async getDirectoryLocalById(id) {
    try {
      const response = await fetch(`${API_URL}/directory/local/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Directory Local record:', error);
      throw error;
    }
  }

  async getDirectoryHotspotsById(id) {
    try {
      const response = await fetch(`${API_URL}/directory/hotspots/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Directory Hotspots record:', error);
      throw error;
    }
  }

  // Get directory statistics
  async getDirectoryStats() {
    try {
      const response = await fetch(`${API_URL}/directory/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching directory statistics:', error);
      throw error;
    }
  }

  // Seed database (admin function)
  async seedDatabase() {
    try {
      const response = await fetch(`${API_URL}/directory/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}

export default new DirectoryService();
