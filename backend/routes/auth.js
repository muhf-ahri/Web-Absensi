import express from 'express';
import { login, getMe, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateUserLogin, validatePasswordChange } from '../middleware/validation.js';

const router = express.Router();

router.post('/login', validateUserLogin, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, validatePasswordChange, changePassword);

export default router;