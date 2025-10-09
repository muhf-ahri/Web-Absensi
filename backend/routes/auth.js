import express from 'express';
import bcrypt from 'bcryptjs';
import { readDB } from '../utils/database.js';
import { generateToken } from '../utils/helpers.js';

const router = express.Router();

// @desc    Test route - GET /api/auth
// @route   GET /api/auth
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API is working!',
    endpoints: {
      'POST /login': 'Login user',
      'GET /me': 'Get current user (Protected)',
      'GET /test': 'Test route'
    },
    timestamp: new Date().toISOString()
  });
});

// @desc    Test login page - GET /api/auth/login
// @route   GET /api/auth/login
// @access  Public
router.get('/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint - Use POST method with email and password',
    example_request: {
      method: 'POST',
      url: '/api/auth/login',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: 'admin@company.com',
        password: 'admin123'
      }
    },
    available_users: [
      {
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        email: 'user@company.com', 
        password: 'admin123',
        role: 'user'
      }
    ]
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const db = await readDB();
    console.log('📋 Users in DB:', db.users.map(u => ({ email: u.email, role: u.role })));

    const user = db.users.find(u => u.email === email && u.isActive);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials - user not found'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials - wrong password'
      });
    }

    const token = generateToken(user._id);

    console.log('🎉 Login successful for:', user.email);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        department: user.department
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Simple implementation for demo
    const db = await readDB();
    const user = db.users[0]; // Default to first user
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Test route
// @route   GET /api/auth/test
// @access  Public
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth test route is working! 🎉',
    timestamp: new Date().toISOString(),
    instructions: 'Use POST /api/auth/login to login'
  });
});

// @desc    Health check
// @route   GET /api/auth/health
// @access  Public
router.get('/health', async (req, res) => {
  try {
    const db = await readDB();
    res.json({
      success: true,
      status: 'healthy',
      users_count: db.users.length,
      attendance_count: db.attendance.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;