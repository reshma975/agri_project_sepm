import express from 'express';
import {
  getGovernmentUpdates,
  getGovernmentNewsUpdates,
  getGovernmentUpdateById,
} from '../controllers/govtUpdatesController.js';

const router = express.Router();

// Live News API endpoint (must precede /:id)
router.get('/news', getGovernmentNewsUpdates);

// Officer & Platform Verified Database Updates
router.get('/', getGovernmentUpdates);
router.get('/:id', getGovernmentUpdateById);

export default router;

