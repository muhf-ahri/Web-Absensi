import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Mock data untuk fallback
const mockData = {
  users: [
    {
      _id: '1',
      name: 'Demo Admin',
      email: 'admin@company.com',
      role: 'admin',
      position: 'System Administrator',
      department: 'IT',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Demo User',
      email: 'user@company.com',
      role: 'user',
      position: 'Software Developer',
      department: 'Engineering',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  attendance: [
    {
      _id: '1',
      user: '1',
      date: new Date().toISOString(),
      checkIn: {
        time: new Date().toISOString(),
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jakarta, Indonesia'
        }
      },
      checkOut: null,
      workingHours: null,
      status: 'present'
    }
  ]
};

// Helper function untuk manage mock users di localStorage
const getMockUsers = () => {
  const storedUsers = localStorage.getItem('mockUsers');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  // Simpan initial mock users ke localStorage
  localStorage.setItem('mockUsers', JSON.stringify(mockData.users));
  return mockData.users;
};

const saveMockUsers = (users) => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
};

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const useMock = localStorage.getItem('useMock') === 'true';

    if (useMock) {
      // Return mock responses untuk demo mode
      config.adapter = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            let response = { data: { success: false, message: 'Mock endpoint not implemented' } };
            
            if (config.url.includes('/auth/me')) {
              response = { 
                data: { 
                  success: true, 
                  user: JSON.parse(localStorage.getItem('user') || '{}')
                } 
              };
            } 
            
            // === USER MANAGEMENT ENDPOINTS ===
            else if (config.url.includes('/users') && config.method === 'get') {
              const users = getMockUsers();
              response = { data: { success: true, data: users } };
            } else if (config.url.includes('/users') && config.method === 'post') {
              // Mock create user
              const newUser = {
                _id: 'mock-user-' + Date.now(),
                ...config.data,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              const users = getMockUsers();
              users.push(newUser);
              saveMockUsers(users);
              
              response = { 
                data: { 
                  success: true, 
                  message: 'User created successfully (Demo Mode)',
                  data: newUser
                } 
              };
            } else if (config.url.includes('/users/') && config.method === 'put') {
              // Mock update user
              const userId = config.url.split('/').pop();
              const users = getMockUsers();
              const userIndex = users.findIndex(u => u._id === userId);
              
              if (userIndex !== -1) {
                const updatedUser = {
                  ...users[userIndex],
                  ...config.data,
                  updatedAt: new Date().toISOString()
                };
                users[userIndex] = updatedUser;
                saveMockUsers(users);
                
                response = { 
                  data: { 
                    success: true, 
                    message: 'User updated successfully (Demo Mode)',
                    data: updatedUser
                  } 
                };
              } else {
                response = { 
                  data: { 
                    success: false, 
                    message: 'User not found' 
                  } 
                };
              }
            } else if (config.url.includes('/users/') && config.method === 'delete') {
              // Mock delete user
              const userId = config.url.split('/').pop();
              const users = getMockUsers();
              const userIndex = users.findIndex(u => u._id === userId);
              
              if (userIndex !== -1) {
                // Prevent deleting the current logged in user
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (users[userIndex]._id === currentUser._id) {
                  response = { 
                    data: { 
                      success: false, 
                      message: 'You cannot delete your own account' 
                    } 
                  };
                } else {
                  users.splice(userIndex, 1);
                  saveMockUsers(users);
                  
                  response = { 
                    data: { 
                      success: true, 
                      message: 'User deleted successfully (Demo Mode)'
                    } 
                  };
                }
              } else {
                response = { 
                  data: { 
                    success: false, 
                    message: 'User not found' 
                  } 
                };
              }
            } 
            
            // === ATTENDANCE ENDPOINTS ===
            else if (config.url.includes('/attendance/my-attendance')) {
              // Ambil dari localStorage dulu, kalau tidak ada pakai mock default
              const today = new Date().toISOString().split('T')[0];
              const savedAttendance = localStorage.getItem('todayAttendance');
              if (savedAttendance) {
                const attendanceData = JSON.parse(savedAttendance);
                const savedDate = new Date(attendanceData.date).toISOString().split('T')[0];
                if (today === savedDate) {
                  response = { data: { success: true, data: [attendanceData] } };
                } else {
                  response = { data: { success: true, data: mockData.attendance } };
                }
              } else {
                response = { data: { success: true, data: mockData.attendance } };
              }
            } else if (config.url.includes('/attendance/checkin') && config.method === 'post') {
              // Mock check-in response
              const checkInData = {
                _id: 'mock-checkin-' + Date.now(),
                user: '1',
                date: new Date().toISOString(),
                checkIn: {
                  time: new Date().toISOString(),
                  location: config.data
                },
                checkOut: null,
                workingHours: null,
                status: 'present'
              };
              
              // Simpan ke localStorage untuk persistensi
              localStorage.setItem('todayAttendance', JSON.stringify(checkInData));
              
              response = { 
                data: { 
                  success: true, 
                  message: 'Check-in successful (Demo Mode)',
                  data: checkInData
                } 
              };
            } else if (config.url.includes('/attendance/checkout') && config.method === 'post') {
              // Mock check-out response
              const savedAttendance = localStorage.getItem('todayAttendance');
              let checkInTime = new Date(Date.now() - 8 * 60 * 60 * 1000); // Default 8 jam yang lalu
              
              if (savedAttendance) {
                const existingData = JSON.parse(savedAttendance);
                if (existingData.checkIn && existingData.checkIn.time) {
                  checkInTime = new Date(existingData.checkIn.time);
                }
              }
              
              const checkOutTime = new Date();
              const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // dalam jam
              
              const checkOutData = {
                _id: 'mock-checkout-' + Date.now(),
                user: '1',
                date: new Date().toISOString(),
                checkIn: savedAttendance ? JSON.parse(savedAttendance).checkIn : {
                  time: checkInTime.toISOString(),
                  location: { latitude: -6.2088, longitude: 106.8456, address: 'Jakarta' }
                },
                checkOut: {
                  time: checkOutTime.toISOString(),
                  location: config.data
                },
                workingHours: workingHours,
                status: 'present'
              };
              
              // Update localStorage
              localStorage.setItem('todayAttendance', JSON.stringify(checkOutData));
              
              response = { 
                data: { 
                  success: true, 
                  message: 'Check-out successful (Demo Mode)',
                  data: checkOutData
                } 
              };
            } 
            
            // === AUTH ENDPOINTS ===
            else if (config.url.includes('/auth/login') && config.method === 'post') {
              // Mock login response
              const users = getMockUsers();
              const user = users.find(u => u.email === config.data.email);
              if (user && config.data.password === 'password123') {
                response = {
                  data: {
                    success: true,
                    token: 'demo-jwt-token',
                    user: user
                  }
                };
              } else {
                response = {
                  data: {
                    success: false,
                    message: 'Invalid credentials'
                  }
                };
              }
            } else if (config.url.includes('/auth/change-password') && config.method === 'put') {
              // Mock change password
              response = {
                data: {
                  success: true,
                  message: 'Password updated successfully (Demo Mode)'
                }
              };
            }
            
            resolve(response);
          }, 500); // Simulate network delay
        });
      };
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors and fallback to mock mode
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'NETWORK_ERROR' || error.response?.status === 0) {
      console.warn('Network error, suggesting mock mode');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;