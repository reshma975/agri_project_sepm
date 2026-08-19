import { Product } from '../models/Product.js';
import { ShopInventory } from '../models/ShopInventory.js';
import { Shop } from '../models/Shop.js';

// @desc    Search products across all shops to check availability & compare prices
// @route   GET /api/products/search
// @access  Public
export const searchProductsAcrossShops = async (req, res) => {
  try {
    const { query, category, location, minPrice, maxPrice, status, minRating } = req.query;

    const inventoryPipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'shops',
          localField: 'shopId',
          foreignField: '_id',
          as: 'shop',
        },
      },
      { $unwind: '$shop' },
    ];

    const matchConditions = {};

    if (query) {
      matchConditions.$or = [
        { 'product.name': { $regex: query, $options: 'i' } },
        { customName: { $regex: query, $options: 'i' } },
        { 'product.description': { $regex: query, $options: 'i' } },
        { 'shop.shopName': { $regex: query, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      matchConditions['product.category'] = category;
    }

    if (location && location !== 'All') {
      matchConditions['shop.location'] = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      matchConditions.price = {};
      if (minPrice) matchConditions.price.$gte = Number(minPrice);
      if (maxPrice) matchConditions.price.$lte = Number(maxPrice);
    }

    if (status && status !== 'All') {
      matchConditions.status = status;
    }

    if (minRating) {
      matchConditions['shop.ratingAverage'] = { $gte: Number(minRating) };
    }

    if (Object.keys(matchConditions).length > 0) {
      inventoryPipeline.push({ $match: matchConditions });
    }

    inventoryPipeline.push({ $sort: { price: 1 } });

    const results = await ShopInventory.aggregate(inventoryPipeline);

    return res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product to a shop's inventory
// @route   POST /api/shops/:shopId/products
// @access  Private (SHOPKEEPER)
export const addProductToShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { name, category, price, quantity, unit, imageUrl, description, rating } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this shop' });
    }

    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product name, price, and stock quantity are required' });
    }

    // Find or create base product
    let product = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!product) {
      product = await Product.create({
        name,
        category: category || 'Fertilizer',
        description: description || '',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
        defaultUnit: unit || 'kg',
      });
    }

    // Determine status
    let status = 'In Stock';
    const numQty = Number(quantity);
    if (numQty === 0) status = 'Out of Stock';
    else if (numQty <= 5) status = 'Low Stock';
    else if (numQty >= 100) status = 'Full';

    const inventoryItem = await ShopInventory.create({
      shopId: shop._id,
      productId: product._id,
      customName: name,
      price: Number(price),
      quantity: numQty,
      unit: unit || product.defaultUnit || 'kg',
      rating: rating ? Number(rating) : 4.5,
      status,
      imageUrl: imageUrl || product.imageUrl,
    });

    const populated = await ShopInventory.findById(inventoryItem._id).populate('productId');

    return res.status(201).json({
      success: true,
      message: 'Product added to shop inventory successfully',
      item: populated,
    });
  } catch (error) {
    console.error('Add product error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product in shop inventory (price, stock, category, status)
// @route   PUT /api/products/inventory/:id
// @access  Private (SHOPKEEPER)
export const updateProductInShop = async (req, res) => {
  try {
    const item = await ShopInventory.findById(req.params.id).populate('shopId');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    if (item.shopId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this item' });
    }

    const { name, category, price, quantity, unit, status, imageUrl } = req.body;

    if (price !== undefined) item.price = Number(price);
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit !== undefined) item.unit = unit;
    if (status !== undefined) item.status = status;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (name !== undefined) item.customName = name;

    // If quantity is zero, set out of stock automatically
    if (item.quantity === 0) {
      item.status = 'Out of Stock';
    }

    await item.save();

    // If category or name was updated, update product model
    if (category || name) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        if (category) prod.category = category;
        if (name) prod.name = name;
        await prod.save();
      }
    }

    const updated = await ShopInventory.findById(item._id).populate('productId');

    return res.status(200).json({
      success: true,
      message: 'Product inventory updated successfully',
      item: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product from shop inventory
// @route   DELETE /api/products/inventory/:id
// @access  Private (SHOPKEEPER)
export const deleteProductFromShop = async (req, res) => {
  try {
    const item = await ShopInventory.findById(req.params.id).populate('shopId');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    if (item.shopId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await ShopInventory.findByIdAndDelete(item._id);

    return res.status(200).json({
      success: true,
      message: 'Product removed from shop inventory successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
