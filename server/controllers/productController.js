import { Product } from '../models/Product.js';
import { ShopInventory } from '../models/ShopInventory.js';
import { Shop } from '../models/Shop.js';

// @desc    Search products across all shops to check availability & compare prices
// @route   GET /api/products/search
// @access  Public
export const searchProductsAcrossShops = async (req, res) => {
  try {
    const { query, category, location, minPrice, maxPrice, status, minRating, village, mandal, district, state } = req.query;

    const inventories = await ShopInventory.find({})
      .populate('productId')
      .populate('shopId')
      .sort({ price: 1 })
      .lean();

    let results = inventories
      .filter((item) => item.productId && item.shopId)
      .map((item) => ({
        _id: item._id,
        customName: item.customName,
        price: item.price,
        stock: item.stock,
        unit: item.unit || 'per unit',
        status: item.status,
        discountPrice: item.discountPrice,
        product: item.productId,
        shop: item.shopId,
      }));

    // State isolation: strictly filter out products from shops in different states
    const targetState = (state || 'Andhra Pradesh').toLowerCase().trim();
    const normalizeState = (st) => {
      if (!st) return 'andhra pradesh';
      const clean = st.toLowerCase().trim();
      if (clean === 'ap' || clean.includes('andhra')) return 'andhra pradesh';
      if (clean === 'ts' || clean.includes('telangana')) return 'telangana';
      return clean;
    };

    results = results.filter((r) => {
      const s = r.shop?.state || 'Andhra Pradesh';
      return normalizeState(s) === normalizeState(targetState);
    });

    if (query) {
      const q = query.toLowerCase().trim();
      results = results.filter((r) =>
        r.product?.name?.toLowerCase().includes(q) ||
        r.customName?.toLowerCase().includes(q) ||
        r.product?.description?.toLowerCase().includes(q) ||
        r.shop?.shopName?.toLowerCase().includes(q) ||
        r.shop?.location?.toLowerCase().includes(q) ||
        r.shop?.address?.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      results = results.filter((r) => r.product?.category?.toLowerCase() === category.toLowerCase());
    }

    if (location && location !== 'All') {
      const targetLoc = location.toLowerCase().trim();
      results = results.filter((r) => {
        const fullLoc = `${r.shop?.location || ''} ${r.shop?.address || ''} ${r.shop?.village || ''} ${r.shop?.mandal || ''} ${r.shop?.district || ''}`.toLowerCase();
        return fullLoc.includes(targetLoc);
      });
    }

    if (minPrice) {
      results = results.filter((r) => r.price >= Number(minPrice));
    }
    if (maxPrice) {
      results = results.filter((r) => r.price <= Number(maxPrice));
    }

    if (status && status !== 'All') {
      results = results.filter((r) => r.status === status);
    }

    if (minRating) {
      results = results.filter((r) => (r.shop?.ratingAverage || 4.5) >= Number(minRating));
    }

    // Proximity hierarchy scoring & sorting
    if (village || mandal || district || state) {
      const v = (village || '').toLowerCase().trim();
      const m = (mandal || '').toLowerCase().trim();
      const d = (district || '').toLowerCase().trim();

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

      results = results.map((r) => {
        const cleanShopV = cleanPlace(r.shop?.village);
        const cleanShopLoc = cleanPlace(r.shop?.location);
        const cleanShopM = cleanPlace(r.shop?.mandal);
        const cleanShopD = cleanPlace(r.shop?.district);

        const locCombined = `${r.shop?.location || ''} ${r.shop?.address || ''}`.toLowerCase();
        const tokens = locCombined.split(/[,;\s/]+/).map(cleanPlace).filter(Boolean);

        let score = 100;
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
          ...r,
          proximityScore: score,
          proximityLevel,
          proximityLabel,
        };
      });

      // Sort by proximity hierarchy, then price/rating
      results.sort((a, b) => b.proximityScore - a.proximityScore || (a.price || 0) - (b.price || 0));
    }

    return res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    console.error('searchProductsAcrossShops error:', error);
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

    // Accept status directly from shopkeeper request, defaulting to 'In Stock'
    const finalStatus = req.body.status || (Number(quantity) === 0 ? 'Out of Stock' : 'In Stock');

    const inventoryItem = await ShopInventory.create({
      shopId: shop._id,
      productId: product._id,
      customName: name,
      price: Number(price),
      quantity: Number(quantity),
      unit: unit || product.defaultUnit || 'kg',
      status: finalStatus,
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
