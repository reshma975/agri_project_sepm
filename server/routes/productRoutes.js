import express from 'express';
import {
  searchProductsAcrossShops,
  updateProductInShop,
  deleteProductFromShop,
} from '../controllers/productController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Search products across shops (farmer product availability search)
router.get('/search', searchProductsAcrossShops);

// Manage inventory item
router.put('/inventory/:id', requireAuth, requireRole('SHOPKEEPER'), updateProductInShop);
router.delete('/inventory/:id', requireAuth, requireRole('SHOPKEEPER'), deleteProductFromShop);

export default router;
