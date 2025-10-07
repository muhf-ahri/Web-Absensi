import Attendance from '../models/Attendance.js';

export const checkIn = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance && existingAttendance.checkIn.time) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah check-in hari ini'
      });
    }

    let attendance;
    if (existingAttendance) {
      attendance = existingAttendance;
    } else {
      attendance = new Attendance({
        user: req.user.id,
        date: new Date()
      });
    }

    attendance.checkIn = {
      time: new Date(),
      location: { latitude, longitude, address }
    };

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Check-in berhasil',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!attendance || !attendance.checkIn.time) {
      return res.status(400).json({
        success: false,
        message: 'Anda belum check-in hari ini'
      });
    }

    if (attendance.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah check-out hari ini'
      });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkIn.time);
    const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    attendance.checkOut = {
      time: checkOutTime,
      location: { latitude, longitude, address }
    };
    attendance.workingHours = workingHours;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Check-out berhasil',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { user: req.user.id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('user', 'name email position department');

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};