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
  const [mockMode, setMockMode] = useState(false);

  // Mock data langsung di sini
  const mockUsers = [
    {
      _id: '1',
      name: 'Demo Admin',
      email: 'admin@company.com',
      role: 'admin',
      position: 'System Administrator',
      department: 'IT',
      isActive: true
    },
    {
      _id: '2',
      name: 'Demo User',
      email: 'user@company.com',
      role: 'user',
      position: 'Software Developer',
      department: 'Engineering',
      isActive: true
    }
  ];

  const mockAuth = {
    success: true,
    token: 'demo-jwt-token-12345',
    user: mockUsers[0]
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const useMock = localStorage.getItem('useMock') === 'true';

    console.log('Auth init - mockMode:', useMock, 'token:', !!token);

    setMockMode(useMock);

    if (useMock) {
      // Mock mode - gunakan user dari localStorage atau default
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // Set default demo user
        setUser(mockUsers[0]);
        localStorage.setItem('user', JSON.stringify(mockUsers[0]));
        localStorage.setItem('token', 'demo-token');
      }
      setLoading(false);
    } else if (token && userData) {
      // Real mode - verify token dengan backend
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authService.getMe();
      setUser(response.user);
    } catch (error) {
      console.warn('Backend unavailable, switching to mock mode');
      enableMockMode();
    } finally {
      setLoading(false);
    }
  };

  const enableMockMode = () => {
    console.log('Enabling mock mode');
    setMockMode(true);
    localStorage.setItem('useMock', 'true');
    // Set default user untuk mock mode
    if (!localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify(mockUsers[0]));
      localStorage.setItem('token', 'demo-token');
      setUser(mockUsers[0]);
    }
  };

  const disableMockMode = () => {
    setMockMode(false);
    localStorage.setItem('useMock', 'false');
  };

  const login = async (email, password) => {
    console.log('Login attempt:', email, 'mockMode:', mockMode);
    
    // Always allow demo credentials, regardless of mockMode
    if (email === 'admin@company.com' && password === 'password123') {
      console.log('Using demo credentials');
      const mockResponse = {
        ...mockAuth,
        user: mockUsers[0]
      };
      
      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      localStorage.setItem('useMock', 'true');
      setUser(mockResponse.user);
      setMockMode(true);
      
      return mockResponse;
    }

    if (email === 'user@company.com' && password === 'password123') {
      console.log('Using demo user credentials');
      const mockResponse = {
        ...mockAuth,
        user: mockUsers[1]
      };
      
      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      localStorage.setItem('useMock', 'true');
      setUser(mockResponse.user);
      setMockMode(true);
      
      return mockResponse;
    }

    if (mockMode) {
      // Mock login - cari user di mock data
      const mockUser = mockUsers.find(u => u.email === email);
      if (mockUser && password === 'password123') {
        const mockResponse = {
          ...mockAuth,
          user: mockUser
        };
        
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        localStorage.setItem('useMock', 'true');
        setUser(mockResponse.user);
        setMockMode(true);
        
        return mockResponse;
      } else {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }
    }
    
    // Real login dengan backend
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('useMock', 'false');
        setUser(response.user);
        setMockMode(false);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Jika backend error, tawarkan mock mode
      if (error.code === 'NETWORK_ERROR' || error.response?.status === 0) {
        return {
          success: false,
          message: 'Backend unavailable. Use demo mode?',
          offerMock: true
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('useMock');
    setUser(null);
    setMockMode(false);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    mockMode,
    enableMockMode,
    disableMockMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};