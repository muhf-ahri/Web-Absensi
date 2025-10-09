import express from 'express';
import { readDB, writeDB, generateId } from '../utils/database.js';
import { getTodayDate, formatDate } from '../utils/helpers.js';

const router = express.Router();

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private
router.post('/checkin', async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const today = getTodayDate();

    const db = await readDB();
    
    // Find today's attendance for the user (using first user for demo)
    const existingAttendance = db.attendance.find(att => 
      att.user === '1' && formatDate(att.date) === today
    );

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today'
      });
    }

    let attendance;
    if (existingAttendance) {
      attendance = existingAttendance;
    } else {
      attendance = {
        _id: generateId(),
        user: '1', // Using first user for demo
        date: new Date().toISOString(),
        checkIn: null,
        checkOut: null,
        workingHours: null,
        status: 'present'
      };
      db.attendance.push(attendance);
    }

    attendance.checkIn = {
      time: new Date().toISOString(),
      location: { latitude, longitude, address }
    };

    const success = await writeDB(db);
    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save attendance'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Check-in successful',
      data: attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Check out
// @route   POST /api/attendance/checkout
// @access  Private
router.post('/checkout', async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const today = getTodayDate();

    const db = await readDB();
    
    const attendance = db.attendance.find(att => 
      att.user === '1' && formatDate(att.date) === today
    );

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You need to check in first before checking out'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today'
      });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkIn.time);
    const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    attendance.checkOut = {
      time: checkOutTime.toISOString(),
      location: { latitude, longitude, address }
    };
    attendance.workingHours = workingHours;

    const success = await writeDB(db);
    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save attendance'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Check-out successful',
      data: attendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get my attendance
// @route   GET /api/attendance/my-attendance
// @access  Private
router.get('/my-attendance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const db = await readDB();
    let attendance = db.attendance.filter(att => att.user === '1'); // Using first user for demo
    
    if (startDate && endDate) {
      attendance = attendance.filter(att => {
        const attDate = formatDate(att.date);
        return attDate >= formatDate(startDate) && attDate <= formatDate(endDate);
      });
    }

    // Sort by date descending
    attendance.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;