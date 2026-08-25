import { Shop } from '../models/Shop.js';
import { ShopInventory } from '../models/ShopInventory.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';

// @desc    Get all distinct shop locations in database
// @route   GET /api/shops/locations
// @access  Public
export const getShopLocations = async (req, res) => {
  try {
    const locations = await Shop.distinct('location');
    const cleanLocations = locations.filter(Boolean).map(l => l.trim());
    const uniqueLocations = [...new Set(cleanLocations)].sort();
    return res.status(200).json({ success: true, locations: uniqueLocations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to build flexible multi-word location query
const buildLocationMatch = (locString, prefix = '') => {
  if (!locString || locString === 'All') return null;
  const stopWords = new Set(['town', 'city', 'district', 'distrcit', 'dist', 'near', 'mandal', 'village', 'state', 'andhra', 'pradesh']);
  const tokens = locString
    .split(/[,;\s/]+/)
    .map(t => t.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(t => t.length >= 2 && !stopWords.has(t.toLowerCase()));

  const locField = prefix ? `${prefix}.location` : 'location';
  const addrField = prefix ? `${prefix}.address` : 'address';

  if (tokens.length === 0) {
    return {
      $or: [
        { [locField]: { $regex: locString.trim(), $options: 'i' } },
        { [addrField]: { $regex: locString.trim(), $options: 'i' } }
      ]
    };
  }

  return {
    $or: tokens.flatMap(token => [
      { [locField]: { $regex: token, $options: 'i' } },
      { [addrField]: { $regex: token, $options: 'i' } }
    ])
  };
};

// @desc    Get all shops with search and location filters
// @route   GET /api/shops
// @access  Public
export const getShops = async (req, res) => {
  try {
    const { search, location, minRating } = req.query;
    const query = {};

    if (search) {
      query.shopName = { $regex: search, $options: 'i' };
    }

    if (location && location !== 'All') {
      const locMatch = buildLocationMatch(location);
      if (locMatch) {
        if (query.$or) {
          query.$and = [{ $or: query.$or }, locMatch];
          delete query.$or;
        } else {
          query.$or = locMatch.$or;
        }
      }
    }

    if (minRating) {
      query.ratingAverage = { $gte: Number(minRating) };
    }

    const shops = await Shop.find(query).sort({ ratingAverage: -1, createdAt: -1 });
    return res.status(200).json({ success: true, count: shops.length, shops });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get shops owned by current shopkeeper
// @route   GET /api/shops/my-shops
// @access  Private (SHOPKEEPER)
export const getMyShops = async (req, res) => {
  try {
    const { location } = req.query;
    const query = { ownerId: req.user._id };

    if (location && location !== 'All') {
      const locMatch = buildLocationMatch(location);
      if (locMatch) {
        query.$and = locMatch.$or ? [{ $or: locMatch.$or }] : [];
      }
    }

    const shops = await Shop.find(query).sort({ createdAt: -1 });

    // Populate product count for each shop
    const shopsWithCounts = await Promise.all(
      shops.map(async (shop) => {
        const productCount = await ShopInventory.countDocuments({ shopId: shop._id });
        return {
          ...shop.toObject(),
          productCount,
        };
      })
    );

    return res.status(200).json({ success: true, shops: shopsWithCounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single shop by ID with products inventory and reviews
// @route   GET /api/shops/:id
// @access  Public
export const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('ownerId', 'name phone email');
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const inventory = await ShopInventory.find({ shopId: shop._id })
      .populate('productId')
      .sort({ createdAt: -1 });

    const reviews = await Review.find({ shopId: shop._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      shop,
      products: inventory,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new shop
// @route   POST /api/shops
// @access  Private (SHOPKEEPER)
export const createShop = async (req, res) => {
  try {
    const { shopName, location, address, imageUrl, phone } = req.body;

    if (!shopName || !location || !address) {
      return res.status(400).json({ success: false, message: 'Shop name, location, and address are required' });
    }

    const shop = await Shop.create({
      ownerId: req.user._id,
      shopName,
      location,
      address,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80',
      phone: phone || req.user.phone || '+91 98480 12345',
      ratingAverage: 4.5,
      ratingCount: 1
    });

    return res.status(201).json({ success: true, message: 'Shop created successfully', shop });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update shop details (Location, Address, Name, Image)
// @route   PUT /api/shops/:id
// @access  Private (SHOPKEEPER)
export const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this shop' });
    }

    const { shopName, location, address, imageUrl, phone, timings } = req.body;
    if (shopName) shop.shopName = shopName;
    if (location) shop.location = location;
    if (address) shop.address = address;
    if (imageUrl) shop.imageUrl = imageUrl;
    if (phone) shop.phone = phone;
    if (timings) shop.timings = timings;


    await shop.save();
    return res.status(200).json({ success: true, message: 'Shop updated successfully', shop });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a shop and its inventory
// @route   DELETE /api/shops/:id
// @access  Private (SHOPKEEPER)
export const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this shop' });
    }

    await ShopInventory.deleteMany({ shopId: shop._id });
    await Review.deleteMany({ shopId: shop._id });
    await Shop.findByIdAndDelete(shop._id);

    return res.status(200).json({ success: true, message: 'Shop and inventory deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review to shop
// @route   POST /api/shops/:id/reviews
// @access  Private (FARMER)
export const addShopReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const review = await Review.create({
      farmerId: req.user._id,
      farmerName: req.user.name,
      shopId: shop._id,
      rating: Number(rating),
      comment
    });

    // Recompute average rating
    const allReviews = await Review.find({ shopId: shop._id });
    const avg = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;
    shop.ratingAverage = Number(avg.toFixed(1));
    shop.ratingCount = allReviews.length;
    await shop.save();

    return res.status(201).json({ success: true, message: 'Review added successfully', review, shopRating: shop.ratingAverage });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
