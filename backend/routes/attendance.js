import express from 'express';
import { checkIn, checkOut, getMyAttendance } from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';
import { validateAttendance, validateDateRange } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.post('/checkin', validateAttendance, checkIn);
router.post('/checkout', validateAttendance, checkOut);
router.get('/my-attendance', getMyAttendance);

export default router;