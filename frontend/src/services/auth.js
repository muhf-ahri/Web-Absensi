import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const authService = {
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login to:', `${API_BASE_URL}/auth/login`);
      
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });
      
      console.log('✅ Login response received');
      return response.data;
    } catch (error) {
      console.error('❌ Auth service error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Re-throw with more context
      const enhancedError = new Error(error.message);
      enhancedError.code = error.code;
      enhancedError.response = error.response;
      throw enhancedError;
    }
  },
  
  getMe: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get me error:', error);
      throw error;
    }
  },

  // Test backend connection
  checkBackend: async () => {
    try {
      const response = await axios.get('http://localhost:5000', { timeout: 5000 });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};