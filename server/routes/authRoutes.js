import express from 'express';
import {
  registerUser,
  loginUser,
  switchRole,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  checkIdentity,
  addRoleToAccount
} from '../controllers/authController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/switch-role', requireAuth, switchRole);
router.post('/reset-password', resetPassword);
router.post('/check-identity', checkIdentity);
router.post('/add-role', optionalAuth, addRoleToAccount);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.put('/change-password', requireAuth, changePassword);

export default router;

