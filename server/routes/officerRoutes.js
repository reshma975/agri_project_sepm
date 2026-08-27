import express from 'express';
import {
  getOfficerDashboard,
  getOfficerVerifications,
  getCropApplicationDetails,
  getFarmerDossier,
  verifyCrop,
  returnCropForCorrection,
  rejectCrop,
  verifyFarmerDossier,
  returnFarmerDossier,
  getMandalDeadline,
  setMandalDeadline,
  searchFarmers,
  exportVerifiedReport
} from '../controllers/officerController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all officer routes with requireAuth & requireRole('OFFICER')
router.use(requireAuth);
router.use(requireRole('OFFICER'));

router.get('/dashboard', getOfficerDashboard);
router.get('/verifications', getOfficerVerifications);
router.get('/crops/:id', getCropApplicationDetails);
router.put('/crops/:id/verify', verifyCrop);
router.put('/crops/:id/return', returnCropForCorrection);
router.put('/crops/:id/reject', rejectCrop);

// Farmer-centric verification endpoints
router.get('/farmers/:id/dossier', getFarmerDossier);
router.put('/farmers/:id/verify', verifyFarmerDossier);
router.put('/farmers/:id/return', returnFarmerDossier);

// Deadline management
router.get('/deadline', getMandalDeadline);
router.post('/deadline', setMandalDeadline);

router.get('/farmers/search', searchFarmers);
router.get('/export', exportVerifiedReport);

export default router;
