import express from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  bulkUpdateUsers 
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { 
  validateUserRegistration, 
  validateUserUpdate, 
  validateBulkOperations 
} from '../middleware/validation.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', validateUserRegistration, createUser);
router.put('/:id', validateUserUpdate, updateUser);
router.delete('/:id', deleteUser);
router.post('/bulk-update', validateBulkOperations, bulkUpdateUsers);

export default router;