import express from 'express';
import {
  getGovernmentUpdates,
  getGovernmentUpdateById,
} from '../controllers/govtUpdatesController.js';

const router = express.Router();

router.get('/', getGovernmentUpdates);
router.get('/:id', getGovernmentUpdateById);

export default router;
