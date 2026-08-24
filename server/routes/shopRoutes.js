import express from 'express';
import {
  getShops,
  getShopLocations,
  getMyShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
  addShopReview,
} from '../controllers/shopController.js';
import { addProductToShop } from '../controllers/productController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public & Farmer routes
router.get('/', getShops);
router.get('/locations', getShopLocations);
router.get('/my-shops', requireAuth, requireRole('SHOPKEEPER'), getMyShops);
router.get('/:id', getShopById);
router.post('/:id/reviews', requireAuth, addShopReview);

// Shopkeeper management routes
router.post('/', requireAuth, requireRole('SHOPKEEPER'), createShop);
router.put('/:id', requireAuth, requireRole('SHOPKEEPER'), updateShop);
router.delete('/:id', requireAuth, requireRole('SHOPKEEPER'), deleteShop);

// Add product to this shop
router.post('/:shopId/products', requireAuth, requireRole('SHOPKEEPER'), addProductToShop);

export default router;
