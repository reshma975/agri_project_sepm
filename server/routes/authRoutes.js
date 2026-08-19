import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.put('/change-password', requireAuth, changePassword);

export default router;
