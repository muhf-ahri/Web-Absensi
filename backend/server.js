// backend/server.js - SIMPLE VERSION
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route - PASTI WORK
app.get('/', (req, res) => {
  console.log('✅ Root endpoint hit!');
  res.json({ 
    message: 'Backend is WORKING!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Auth test route
app.get('/api/auth', (req, res) => {
  console.log('✅ Auth endpoint hit!');
  res.json({
    success: true,
    message: 'Auth API is working!',
    endpoints: [
      'POST /api/auth/login',
      'GET /api/auth/me'
    ]
  });
});

// Login route
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
  
  // Simple hardcoded login
  if (email === 'admin@company.com' && password === 'admin123') {
    return res.json({
      success: true,
      token: 'fake-jwt-token-12345',
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@company.com',
        role: 'admin',
        position: 'System Administrator',
        department: 'IT'
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Users route
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@company.com',
        role: 'admin',
        position: 'System Administrator',
        department: 'IT'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log('🎉 BACKEND JALAN BRO!');
  console.log(`🚀 http://localhost:${PORT}`);
  console.log(`✅ Test: http://localhost:${PORT}/`);
  console.log(`✅ Test: http://localhost:${PORT}/api/auth`);
});