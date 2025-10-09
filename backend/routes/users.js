import express from 'express';
import bcrypt from 'bcryptjs';
import { readDB, writeDB, generateId } from '../utils/database.js';

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const db = await readDB();
    const users = db.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, position, department } = req.body;

    if (!name || !email || !password || !position || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const db = await readDB();
    
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      _id: generateId(),
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      position,
      department,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    const success = await writeDB(db);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, position, department, isActive } = req.body;

    const db = await readDB();
    const userIndex = db.users.findIndex(u => u._id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is taken by another user
    if (email) {
      const emailExists = db.users.some(u => u.email === email && u._id !== id);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered by another user'
        });
      }
    }

    const updatedUser = {
      ...db.users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(position && { position }),
      ...(department && { department }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString()
    };

    db.users[userIndex] = updatedUser;
    const success = await writeDB(db);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const db = await readDB();
    const userIndex = db.users.findIndex(u => u._id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting the first admin user
    if (db.users[userIndex]._id === '1') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the primary admin user'
      });
    }

    db.users.splice(userIndex, 1);
    const success = await writeDB(db);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;