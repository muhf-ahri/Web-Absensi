import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'online', 'offline'

  useEffect(() => {
    checkBackendConnection();
    checkAuth();
  }, []);

  // Check if backend is running
  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setBackendStatus('online');
        console.log('✅ Backend is running');
      } else {
        setBackendStatus('offline');
        console.log('❌ Backend returned error status:', response.status);
      }
    } catch (error) {
      setBackendStatus('offline');
      console.log('🚨 Backend connection failed:', error.message);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // Only try to get user data if backend is online
        if (backendStatus === 'online') {
          const response = await authService.getMe();
          setUser(response.user);
        } else {
          // Use cached user data if backend is offline
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Don't logout immediately, keep cached data
        if (error.message.includes('Network') || error.message.includes('backend')) {
          console.log('Using cached user data due to backend connection issue');
          setUser(JSON.parse(userData));
        } else {
          logout();
        }
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('🔄 Starting login process...');
      
      // Check backend connection first
      await checkBackendConnection();
      if (backendStatus === 'offline') {
        return {
          success: false,
          message: 'Backend server is not running. Please make sure the backend server is started on port 5000.'
        };
      }

      const response = await authService.login(email, password);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setBackendStatus('online');
        console.log('✅ Login successful, user:', response.user.name);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      let message = 'Login failed';
      
      // Specific error handling
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        message = 'Cannot connect to backend server. Please check if the backend is running on http://localhost:5000';
      } else if (error.code === 'ECONNREFUSED') {
        message = 'Connection refused. Backend server is not running on port 5000.';
      } else if (error.response?.status === 0) {
        message = 'Backend server is not accessible. Please start the backend server.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      setBackendStatus('offline');
      
      return {
        success: false,
        message,
        backendStatus: 'offline'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('👋 User logged out');
  };

  const retryBackendConnection = async () => {
    setBackendStatus('checking');
    await checkBackendConnection();
  };

  const value = {
    user,
    login,
    logout,
    loading,
    backendStatus,
    retryBackendConnection
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};