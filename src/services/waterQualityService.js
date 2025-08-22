// src/services/waterQualityService.js - NEW FILE
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://swift-jade.vercel.app';
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

class WaterQualityService {
  // Start recording for pool testing
  static async startRecording(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/device/start-recording`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error.response?.data || error;
    }
  }

  // Stop recording
  static async stopRecording(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/device/stop-recording`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error.response?.data || error;
    }
  }

  // Save test data
  static async saveTestData(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/pool-data/save-test-data`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving test data:', error);
      throw error.response?.data || error;
    }
  }

  // Get device status
  static async getDeviceStatus(poolId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/device/status/${poolId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting device status:', error);
      throw error.response?.data || error;
    }
  }

  // Get recent test data for a pool
  static async getRecentTestData(poolId, limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pool-data/recent/${poolId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recent test data:', error);
      throw error.response?.data || error;
    }
  }

  // Get pool testing statistics
  static async getPoolTestingStats(poolId, timeRange = 'week') {
    try {
      const response = await axios.get(`${API_BASE_URL}/pool-data/stats/${poolId}?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting pool testing stats:', error);
      throw error.response?.data || error;
    }
  }

  // Save water quality data to database
  static async saveWaterQualityData(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/water-quality/record`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving water quality data:', error);
      throw error.response?.data || error;
    }
  }

  // Get historical water quality data
  static async getHistoricalData(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await axios.get(`${API_BASE_URL}/water-quality/historical?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting historical data:', error);
      throw error.response?.data || error;
    }
  }

  // Simulate device data (for testing)
  static async simulateDeviceData(poolId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/pool-data/simulate/${poolId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error simulating device data:', error);
      throw error.response?.data || error;
    }
  }
}

export default WaterQualityService;