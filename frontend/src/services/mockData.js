export const mockUsers = [
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

export const mockAttendance = [
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
];

export const mockAuth = {
  success: true,
  token: 'demo-jwt-token-12345',
  user: mockUsers[0]
};