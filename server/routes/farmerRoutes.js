import express from 'express';
import {
  getFarmerProfile,
  getFarmerLands,
  createLand,
  getFarmerCrops,
  getCropById,
  registerCrop,
  updateCrop,
  uploadDocument
} from '../controllers/farmerController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected for authenticated users / Farmers
router.get('/profile', requireAuth, getFarmerProfile);
router.get('/lands', requireAuth, getFarmerLands);
router.post('/lands', requireAuth, requireRole('FARMER'), createLand);
router.get('/crops', requireAuth, getFarmerCrops);
router.get('/crops/:id', requireAuth, getCropById);
router.post('/crops', requireAuth, requireRole('FARMER'), registerCrop);
router.put('/crops/:id', requireAuth, requireRole('FARMER'), updateCrop);
router.post('/upload-document', requireAuth, requireRole('FARMER'), uploadDocument);

export default router;
