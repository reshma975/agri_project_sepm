import { Shop } from '../models/Shop.js';
import { ShopInventory } from '../models/ShopInventory.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';

// Helper to convert string to Title Case
const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// @desc    Get all distinct shop locations in database (normalized & deduplicated)
// @route   GET /api/shops/locations
// @access  Public
export const getShopLocations = async (req, res) => {
  try {
    const { state } = req.query;
    const filter = {};

    if (state && state !== 'All') {
      const s = state.trim();
      if (s.toLowerCase() === 'andhra pradesh' || s.toLowerCase() === 'ap') {
        filter.$or = [
          { state: { $regex: /andhra\s*pradesh|ap/i } },
          { state: { $exists: false } },
          { state: '' },
          { state: null }
        ];
      } else {
        filter.state = { $regex: new RegExp(`^${s}$`, 'i') };
      }
    }

    const locations = await Shop.distinct('location', filter);
    const seen = new Map();
    for (const loc of locations) {
      if (!loc) continue;
      const clean = loc.trim();
      if (!clean || clean.toLowerCase() === 'all') continue;
      const normalized = toTitleCase(clean);
      const lower = normalized.toLowerCase();
      if (!seen.has(lower)) {
        seen.set(lower, normalized);
      }
    }
    const uniqueLocations = Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
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

// @desc    Get all shops with search and location filters (strictly within same state, sorted by Village -> Mandal -> District -> State)
// @route   GET /api/shops
// @access  Public
export const getShops = async (req, res) => {
  try {
    const { search, location, minRating, village, mandal, district, state } = req.query;
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

    // Strict State Isolation: ensure we only return shops from the farmer's/requested state
    if (state && state !== 'All') {
      const s = state.trim();
      const stateClause = (s.toLowerCase() === 'andhra pradesh' || s.toLowerCase() === 'ap')
        ? {
            $or: [
              { state: { $regex: /andhra\s*pradesh|ap/i } },
              { state: { $exists: false } },
              { state: '' },
              { state: null }
            ]
          }
        : { state: { $regex: new RegExp(`^${s}$`, 'i') } };

      if (query.$and) {
        query.$and.push(stateClause);
      } else if (query.$or) {
        query.$and = [{ $or: query.$or }, stateClause];
        delete query.$or;
      } else {
        Object.assign(query, stateClause);
      }
    }

    let shops = await Shop.find(query).sort({ ratingAverage: -1, createdAt: -1 });

    // Proximity hierarchy sorting: Same Village (400) -> Same Mandal (300) -> Same District (200) -> Same State (100)
    if (village || mandal || district || state) {
      const v = (village || '').toLowerCase().trim();
      const m = (mandal || '').toLowerCase().trim();
      const d = (district || '').toLowerCase().trim();
      const s = (state || 'Andhra Pradesh').toLowerCase().trim();

      const cleanPlace = (name) => {
        if (!name) return '';
        return name
          .toLowerCase()
          .replace(/\b(village|gramam|town|mandal|tehsil|district|dist|city|state|ap|andhra|pradesh)\b/gi, '')
          .replace(/[^a-z0-9]/gi, '')
          .trim();
      };

      const cleanFarmerV = cleanPlace(v);
      const cleanFarmerM = cleanPlace(m);
      const cleanFarmerD = cleanPlace(d);

      const districtSynonyms = new Set([cleanFarmerD]);
      if (cleanFarmerD === 'ntr' || cleanFarmerD.includes('vijayawada') || cleanFarmerD.includes('krishna')) {
        districtSynonyms.add('ntr');
        districtSynonyms.add('vijayawada');
        districtSynonyms.add('krishna');
      }

      // Ensure no out-of-state shops leak through
      shops = shops.filter(shop => {
        const shopState = (shop.state || 'Andhra Pradesh').toLowerCase().trim();
        const normalizeState = (st) => {
          if (!st) return 'andhra pradesh';
          if (st === 'ap' || st.includes('andhra')) return 'andhra pradesh';
          if (st === 'ts' || st.includes('telangana')) return 'telangana';
          return st;
        };
        const shopAddress = (shop.address || '').toLowerCase();
        if (s.includes('andhra') && (shopAddress.includes('telangana') || shopAddress.includes('hyderabad'))) {
          return false;
        }
        return normalizeState(shopState) === normalizeState(s);
      });

      const scoredShops = await Promise.all(
        shops.map(async (shop) => {
          const productCount = await ShopInventory.countDocuments({ shopId: shop._id });
          const cleanShopV = cleanPlace(shop.village);
          const cleanShopLoc = cleanPlace(shop.location);
          const cleanShopM = cleanPlace(shop.mandal);
          const cleanShopD = cleanPlace(shop.district);

          const locCombined = `${shop.location || ''} ${shop.address || ''}`.toLowerCase();
          const tokens = locCombined.split(/[,;\s/]+/).map(cleanPlace).filter(Boolean);

          let score = 100; // Same State Base
          let proximityLevel = 'STATE';
          let proximityLabel = '📍 In Your State';

          // 3. Same District
          if (cleanFarmerD && (districtSynonyms.has(cleanShopD) || tokens.some(t => districtSynonyms.has(t)))) {
            score = 200;
            proximityLevel = 'DISTRICT';
            proximityLabel = '📍 In Your District';
          }

          // 2. Same Mandal
          if (cleanFarmerM && (cleanShopM === cleanFarmerM || tokens.includes(cleanFarmerM))) {
            score = 300;
            proximityLevel = 'MANDAL';
            proximityLabel = '📍 In Your Mandal';
          }

          // 1. Same Village (Highest Priority - Strict Match)
          if (cleanFarmerV && (cleanShopV === cleanFarmerV || cleanShopLoc === cleanFarmerV || tokens.includes(cleanFarmerV))) {
            score = 400;
            proximityLevel = 'VILLAGE';
            proximityLabel = '📍 In Your Village';
          }

          return {
            ...shop.toObject(),
            productCount,
            proximityScore: score,
            proximityLevel,
            proximityLabel
          };
        })
      );

      // Sort strictly by proximity hierarchy, then rating
      scoredShops.sort((a, b) => b.proximityScore - a.proximityScore || (b.ratingAverage || 0) - (a.ratingAverage || 0));
      return res.status(200).json({ success: true, count: scoredShops.length, shops: scoredShops });
    }

    const shopsWithCounts = await Promise.all(
      shops.map(async (shop) => {
        const productCount = await ShopInventory.countDocuments({ shopId: shop._id });
        return {
          ...shop.toObject(),
          productCount,
        };
      })
    );

    return res.status(200).json({ success: true, count: shopsWithCounts.length, shops: shopsWithCounts });
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

    let shops = await Shop.find(query).sort({ createdAt: -1 });

    // If shopkeeper has no Shop record in DB yet, auto-create one synced from ShopkeeperProfile
    if (shops.length === 0) {
      const { ShopkeeperProfile } = await import('../models/ShopkeeperProfile.js');
      const profile = await ShopkeeperProfile.findOne({ userId: req.user._id });
      if (profile) {
        const fullLocation = [profile.village, profile.mandal, profile.district].filter(Boolean).join(', ') || profile.primaryLocation || 'Vijayawada';
        const newShop = await Shop.create({
          shopId: `SHP${Math.floor(1000 + Math.random() * 9000)}`,
          ownerId: req.user._id,
          shopName: profile.businessName || `${req.user.name}'s Agro Store`,
          location: profile.village || profile.primaryLocation || fullLocation,
          village: profile.village || '',
          mandal: profile.mandal || '',
          district: profile.district || 'Vijayawada',
          address: profile.address || `${profile.village ? profile.village + ', ' : ''}${profile.mandal ? profile.mandal + ' Mandal, ' : ''}${profile.district || 'Vijayawada'}`,
          phone: req.user.phone || '',
          timings: profile.timings || {
            weekday: '7:30 AM - 8:00 PM',
            sunday: '7:30 AM - 1:00 PM',
            note: 'Timings may change on festival days'
          },
          ratingAverage: 4.5,
          ratingCount: 1,
        });
        shops = [newShop];
      }
    }

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

    const rawReviews = await Review.find({ shopId: shop._id }).sort({ updatedAt: -1, createdAt: -1 });

    // Enforce 1-on-1 rating per farmer per shop & exclude self-reviews by shop owner
    const seenFarmers = new Set();
    const reviews = [];
    const duplicateIds = [];
    const ownerIdStr = shop.ownerId?._id ? shop.ownerId._id.toString() : shop.ownerId?.toString();

    for (const r of rawReviews) {
      const reviewerId = r.farmerId ? r.farmerId.toString() : '';
      if (reviewerId && reviewerId === ownerIdStr) {
        duplicateIds.push(r._id);
        continue;
      }
      const key = reviewerId || r.farmerName;
      if (!seenFarmers.has(key)) {
        seenFarmers.add(key);
        reviews.push(r);
      } else {
        duplicateIds.push(r._id);
      }
    }

    // Clean up duplicate/self entries in background if any exist
    if (duplicateIds.length > 0) {
      Review.deleteMany({ _id: { $in: duplicateIds } }).catch((err) => console.error('Error cleaning duplicate reviews:', err));
      const avg = reviews.length > 0 ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length : 4.5;
      shop.ratingAverage = Number(avg.toFixed(1));
      shop.ratingCount = reviews.length;
      shop.save().catch((err) => console.error('Error updating shop rating:', err));
    }

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

// @desc    Create a new shop / branch
// @route   POST /api/shops
// @access  Private (SHOPKEEPER)
export const createShop = async (req, res) => {
  try {
    const { shopName, location, address, imageUrl, phone, village, mandal, district, state, timings } = req.body;

    if (!shopName || !address || (!location && !village)) {
      return res.status(400).json({ success: false, message: 'Shop name, village/location, and address are required' });
    }

    let formattedPhone = '';
    if (phone) {
      const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number. Must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
        });
      }
      formattedPhone = `+91 ${cleanPhone}`;
    } else if (req.user.phone) {
      const userCleanPhone = req.user.phone.replace(/\D/g, '').slice(-10);
      formattedPhone = userCleanPhone.length === 10 ? `+91 ${userCleanPhone}` : '+91 98480 12345';
    } else {
      formattedPhone = '+91 98480 12345';
    }

    const cleanLocation = location || (village ? (village.toLowerCase().includes('village') || village.toLowerCase().includes('town') ? village : `${village} Village`) : 'Vijayawada');

    const shop = await Shop.create({
      ownerId: req.user._id,
      shopName,
      location: cleanLocation,
      village: village || '',
      mandal: mandal || '',
      district: district || 'Vijayawada',
      state: state || 'Andhra Pradesh',
      address,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80',
      phone: formattedPhone,
      timings: timings || {
        weekday: '7:30 AM - 8:00 PM',
        sunday: '7:30 AM - 1:00 PM',
        note: 'Timings may change on festival days',
      },
      ratingAverage: 4.5,
      ratingCount: 1,
    });

    return res.status(201).json({ success: true, message: 'New shop branch registered successfully', shop });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update shop details (Location, Address, Name, Image, Timings)
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

    const { shopName, location, address, imageUrl, phone, timings, village, mandal, district, state } = req.body;
    if (shopName !== undefined) shop.shopName = shopName;
    if (location !== undefined) shop.location = location;
    if (village !== undefined) shop.village = village;
    if (mandal !== undefined) shop.mandal = mandal;
    if (district !== undefined) shop.district = district;
    if (state !== undefined) shop.state = state;
    if (address !== undefined) shop.address = address;
    if (imageUrl !== undefined) shop.imageUrl = imageUrl;
    if (timings !== undefined) shop.timings = timings;

    if (phone !== undefined && phone !== '') {
      const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number. Must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
        });
      }
      shop.phone = `+91 ${cleanPhone}`;
    }

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

// @desc    Add or update review to shop (1-on-1 rating per farmer)
// @route   POST /api/shops/:id/reviews
// @access  Private (FARMER)
export const addShopReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    // Prevent shop owner from rating their own shop
    const ownerIdStr = shop.ownerId?._id ? shop.ownerId._id.toString() : shop.ownerId?.toString();
    if (ownerIdStr === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are the registered owner of this shop. Store owners cannot submit ratings or reviews for their own store.'
      });
    }

    if (!rating || !comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Rating and review comment are required' });
    }

    const ratingNum = Math.min(5, Math.max(1, Number(rating) || 5));

    // One-on-one: Check if this farmer has already rated this shop
    let review = await Review.findOne({
      farmerId: req.user._id,
      shopId: shop._id
    });

    let isUpdate = false;
    if (review) {
      isUpdate = true;
      review.rating = ratingNum;
      review.comment = comment.trim();
      review.farmerName = req.user.name;
      await review.save();
    } else {
      review = await Review.create({
        farmerId: req.user._id,
        farmerName: req.user.name,
        shopId: shop._id,
        rating: ratingNum,
        comment: comment.trim()
      });
    }

    // Clean up any other duplicates for this farmer/shop
    await Review.deleteMany({
      shopId: shop._id,
      farmerId: req.user._id,
      _id: { $ne: review._id }
    });

    // Recompute average rating and rating count
    const allReviews = await Review.find({ shopId: shop._id });
    const avg = allReviews.length > 0
      ? allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length
      : 4.5;
    shop.ratingAverage = Number(avg.toFixed(1));
    shop.ratingCount = allReviews.length;
    await shop.save();

    return res.status(200).json({
      success: true,
      message: isUpdate ? 'Your review has been updated successfully.' : 'Thank you! Your review has been recorded.',
      review,
      shopRating: shop.ratingAverage,
      ratingCount: shop.ratingCount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
