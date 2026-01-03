import express from 'express';
import { 
  register, 
  login, 
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.delete('/profile', authenticateToken, deleteAccount);

export default router;
