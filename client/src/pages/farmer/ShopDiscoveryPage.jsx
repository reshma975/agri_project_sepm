import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import {
  Store,
  Search,
  MapPin,
  Star,
  Tag,
  Package,
  Layers,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeft,
  Navigation,
  Sparkles,
  CheckCircle2,
  Phone
} from 'lucide-react';

export default function ShopDiscoveryPage() {
  const { user } = useAuth();
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('PRODUCTS'); // 'PRODUCTS' | 'SHOPS'
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All'); // 'All' | specific location
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [rawProducts, setRawProducts] = useState([]);
  const [rawShops, setRawShops] = useState([]);
  const [locations, setLocations] = useState(['All']);
  const [loading, setLoading] = useState(true);

  // Fetch full farmer profile from API
  useEffect(() => {
    const fetchFarmerProfile = async () => {
      try {
        const res = await apiClient.get('/farmers/profile');
        if (res.data.success && res.data.profile) {
          setFarmerProfile(res.data.profile);
        }
      } catch (err) {
        console.error('Error loading farmer profile for discovery:', err);
      }
    };
    fetchFarmerProfile();
  }, [user]);

  // Farmer's registered location details
  const farmerVillage = farmerProfile?.village || user?.profile?.village || '';
  const farmerMandal = farmerProfile?.mandal || user?.profile?.mandal || '';
  const farmerDistrict = farmerProfile?.district || user?.profile?.district || '';
  const farmerState = farmerProfile?.state || user?.profile?.state || 'Andhra Pradesh';
  const hasFarmerLocation = Boolean(farmerVillage || farmerMandal || farmerDistrict);

  // Categories
  const categories = ['All', 'Fertilizer', 'Seeds', 'Pesticide', 'Tools', 'Machines', 'Others'];

  // Fetch distinct locations from shops database (scoped to farmer's state)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await apiClient.get('/shops/locations', {
          params: { state: farmerState }
        });
        if (res.data.success && res.data.locations?.length > 0) {
          const toTitleCase = (str) =>
            str
              .trim()
              .toLowerCase()
              .split(/\s+/)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

          const seen = new Map();
          for (const loc of res.data.locations) {
            if (!loc || loc === 'All') continue;
            const normalized = toTitleCase(loc);
            const lower = normalized.toLowerCase();
            if (!seen.has(lower)) {
              seen.set(lower, normalized);
            }
          }
          const list = ['All', ...Array.from(seen.values()).sort((a, b) => a.localeCompare(b))];
          setLocations(list);
        }
      } catch (err) {
        console.error('Error fetching dynamic locations:', err);
      }
    };
    fetchLocations();
  }, [farmerState]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch products strictly matching farmer's state and proximity
      const productParams = {
        state: farmerState,
        village: farmerVillage,
        mandal: farmerMandal,
        district: farmerDistrict
      };
      if (searchQuery) productParams.query = searchQuery;
      if (categoryFilter !== 'All') productParams.category = categoryFilter;
      if (maxPrice) productParams.maxPrice = maxPrice;
      if (minRating) productParams.minRating = minRating;

      const prodRes = await apiClient.get('/products/search', { params: productParams });
      if (prodRes.data.success) {
        setRawProducts(prodRes.data.results || []);
      }

      // Fetch shops strictly matching farmer's state and proximity
      const shopParams = {
        state: farmerState,
        village: farmerVillage,
        mandal: farmerMandal,
        district: farmerDistrict
      };
      if (searchQuery) shopParams.search = searchQuery;
      if (minRating) shopParams.minRating = minRating;

      const shopRes = await apiClient.get('/shops', { params: shopParams });
      if (shopRes.data.success) {
        setRawShops(shopRes.data.shops || []);
      }
    } catch (err) {
      console.error('Error discovering shops/products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, categoryFilter, maxPrice, minRating, farmerProfile]);

  // Clean and normalize a location token (strips punctuation and common suffixes)
  const cleanPlaceName = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/\b(village|gramam|town|mandal|tehsil|district|dist|city|state|ap|andhra|pradesh)\b/gi, '')
      .replace(/[^a-z0-9]/gi, '')
      .trim();
  };

  const isVillageMatch = (shop, fVillage) => {
    const cleanFarmerV = cleanPlaceName(fVillage);
    if (!cleanFarmerV || cleanFarmerV.length < 2) return false;

    const cleanShopV = cleanPlaceName(shop.village);
    const cleanShopLoc = cleanPlaceName(shop.location);

    if (cleanShopV && cleanShopV === cleanFarmerV) return true;
    if (cleanShopLoc && cleanShopLoc === cleanFarmerV) return true;

    if (shop.address) {
      const addrTokens = shop.address.toLowerCase().split(/[,;\s/]+/).map(cleanPlaceName).filter(Boolean);
      if (addrTokens.includes(cleanFarmerV)) return true;
    }
    return false;
  };

  const isMandalMatch = (shop, fMandal) => {
    const cleanFarmerM = cleanPlaceName(fMandal);
    if (!cleanFarmerM || cleanFarmerM.length < 2) return false;

    const cleanShopM = cleanPlaceName(shop.mandal);
    if (cleanShopM && cleanShopM === cleanFarmerM) return true;

    const locCombined = `${shop.location || ''} ${shop.address || ''}`.toLowerCase();
    const tokens = locCombined.split(/[,;\s/]+/).map(cleanPlaceName).filter(Boolean);
    return tokens.includes(cleanFarmerM);
  };

  const isDistrictMatch = (shop, fDistrict) => {
    const cleanFarmerD = cleanPlaceName(fDistrict);
    if (!cleanFarmerD || cleanFarmerD.length < 2) return false;

    const synonyms = new Set([cleanFarmerD]);
    if (cleanFarmerD === 'ntr' || cleanFarmerD.includes('vijayawada') || cleanFarmerD.includes('krishna')) {
      synonyms.add('ntr');
      synonyms.add('vijayawada');
      synonyms.add('krishna');
    }

    const cleanShopD = cleanPlaceName(shop.district);
    if (cleanShopD && synonyms.has(cleanShopD)) return true;

    const locCombined = `${shop.location || ''} ${shop.address || ''}`.toLowerCase();
    const tokens = locCombined.split(/[,;\s/]+/).map(cleanPlaceName).filter(Boolean);
    return tokens.some((t) => synonyms.has(t));
  };

  // Proximity Calculation (Strict Hierarchy: Same Village (400) -> Same Mandal (300) -> Same District (200) -> Same State (100) -> Out of state excluded)
  const getProximity = (shop) => {
    if (!shop) {
      return { score: 0, rank: 999, level: 'EXCLUDED', label: '', badgeClass: '', isNearby: false, isOutOfState: true };
    }

    const normalizeState = (st) => {
      const clean = (st || '').toLowerCase().trim();
      if (!clean || clean === 'ap' || clean.includes('andhra')) return 'andhra pradesh';
      if (clean === 'ts' || clean.includes('telangana')) return 'telangana';
      return clean;
    };

    const sState = normalizeState(shop.state || 'Andhra Pradesh');
    const fState = normalizeState(farmerState || 'Andhra Pradesh');

    // Strict state isolation: Reject any shops with an address in a different state
    const shopAddress = (shop.address || '').toLowerCase();
    if (fState === 'andhra pradesh' && (shopAddress.includes('telangana') || shopAddress.includes('hyderabad') || sState !== 'andhra pradesh')) {
      return { score: 0, rank: 999, level: 'OUT_OF_STATE', label: '', badgeClass: 'hidden', isNearby: false, isOutOfState: true };
    }

    if (sState !== fState) {
      return { score: 0, rank: 999, level: 'OUT_OF_STATE', label: '', badgeClass: 'hidden', isNearby: false, isOutOfState: true };
    }

    // 1. Same Village / Town (Rank 1 - Highest Priority)
    if (isVillageMatch(shop, farmerVillage)) {
      return {
        score: 400,
        rank: 1,
        level: 'VILLAGE',
        label: '📍 In Your Village',
        badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-sm ring-1 ring-emerald-400/30',
        isNearby: true,
        isOutOfState: false,
      };
    }

    // 2. Same Mandal / Tehsil (Rank 2)
    if (isMandalMatch(shop, farmerMandal)) {
      return {
        score: 300,
        rank: 2,
        level: 'MANDAL',
        label: '📍 In Your Mandal',
        badgeClass: 'bg-teal-950/90 text-teal-300 border-teal-500/50 shadow-sm',
        isNearby: true,
        isOutOfState: false,
      };
    }

    // 3. Same District (Rank 3)
    if (isDistrictMatch(shop, farmerDistrict)) {
      return {
        score: 200,
        rank: 3,
        level: 'DISTRICT',
        label: '📍 In Your District',
        badgeClass: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50 shadow-sm',
        isNearby: true,
        isOutOfState: false,
      };
    }

    // 4. Same State (Rank 4 - Standard within state)
    return {
      score: 100,
      rank: 4,
      level: 'STATE',
      label: '📍 In Your State',
      badgeClass: 'bg-[#030b0e] text-slate-300 border-slate-700 shadow-xs',
      isNearby: false,
      isOutOfState: false,
    };
  };

  // Helper to determine stock score (In Stock = 2, Low Stock = 1, Out of Stock = 0)
  const getStockScore = (item) => {
    const isOut = item.status === 'Out of Stock' || item.status === 'Empty' || item.stock === 0 || item.quantity === 0;
    if (isOut) return 0;
    const isLow = item.status === 'Low Stock' || item.status === 'Low' || (typeof item.stock === 'number' && item.stock <= 5);
    if (isLow) return 1;
    return 2; // In Stock
  };

  const getStockCount = (item) => {
    if (item.status === 'Out of Stock' || item.status === 'Empty') return 0;
    if (typeof item.stock === 'number') return item.stock;
    if (typeof item.quantity === 'number') return item.quantity;
    if (item.status === 'In Stock' || item.status === 'Full') return 100;
    return 10;
  };

  // Processed Products with Strict Same State & Smart Prioritization (Village -> Mandal -> District -> State)
  const processedProducts = useMemo(() => {
    let list = rawProducts
      .map((item) => ({
        ...item,
        proximity: getProximity(item.shop),
        stockScore: getStockScore(item),
        stockCount: getStockCount(item),
      }))
      .filter((item) => !item.proximity.isOutOfState); // Exclude other states entirely

    if (locationFilter !== 'All') {
      const target = locationFilter.toLowerCase();
      list = list.filter((item) => {
        const text = `${item.shop?.village || ''} ${item.shop?.mandal || ''} ${item.shop?.district || ''} ${item.shop?.location || ''} ${item.shop?.address || ''}`.toLowerCase();
        return text.includes(target);
      });
    }

    // Sort: 1. Proximity Hierarchy (Village -> Mandal -> District -> State) -> 2. In Stock First -> 3. Quantity -> 4. Price
    return list.sort((a, b) => {
      if (b.proximity.score !== a.proximity.score) {
        return b.proximity.score - a.proximity.score;
      }
      if (b.stockScore !== a.stockScore) {
        return b.stockScore - a.stockScore;
      }
      if (b.stockCount !== a.stockCount) {
        return b.stockCount - a.stockCount;
      }
      return (a.price || 0) - (b.price || 0);
    });
  }, [rawProducts, locationFilter, farmerVillage, farmerMandal, farmerDistrict, farmerState]);

  // Processed Shops with Strict Same State & Smart Prioritization (Village -> Mandal -> District -> State)
  const processedShops = useMemo(() => {
    let scored = rawShops
      .map((shop) => {
        const matchedFromProducts = rawProducts.filter(
          (p) => (p.shop?._id === shop._id || p.shop === shop._id)
        ).length;
        const count = typeof shop.productCount === 'number' ? shop.productCount : matchedFromProducts;

        return {
          ...shop,
          productCount: count,
          proximity: getProximity(shop),
        };
      })
      .filter((shop) => !shop.proximity.isOutOfState); // Exclude other states entirely

    if (locationFilter === 'All') {
      // Sort by proximity score (Village -> Mandal -> District -> State) then by rating
      return scored.sort((a, b) => b.proximity.score - a.proximity.score || (b.ratingAverage || 0) - (a.ratingAverage || 0));
    } else {
      // Filter by specific location selected in dropdown
      const target = locationFilter.toLowerCase();
      return scored.filter((shop) => {
        const text = `${shop.village || ''} ${shop.mandal || ''} ${shop.district || ''} ${shop.location || ''} ${shop.address || ''}`.toLowerCase();
        return text.includes(target);
      });
    }
  }, [rawShops, rawProducts, locationFilter, farmerVillage, farmerMandal, farmerDistrict, farmerState]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setLocationFilter('All');
    setCategoryFilter('All');
    setMinRating('');
    setMaxPrice('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Back Navigation */}
      <div>
        <Link
          to="/farmer/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 transition-all mb-3 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          🏪 Agricultural Shops & Product Availability
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          Find authorized local fertilizer, seed, and equipment shops with real-time stock verification.
        </p>
      </div>

      {/* Location Bar */}
      {hasFarmerLocation && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#05181f]/95 border border-teal-500/30 shadow-md">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div className="text-xs font-semibold text-slate-300 flex flex-wrap items-center gap-1.5">
              <span>Your Location:</span>
              <span className="text-teal-300 font-bold bg-[#030b0e] px-2.5 py-0.5 rounded-md border border-teal-500/30">
                {[farmerVillage, farmerMandal, farmerDistrict].filter(Boolean).join(' • ')}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-teal-300/80 font-medium">
            ✨ Nearby stores in your village & mandal are sorted to the top
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="rounded-3xl p-4 sm:p-5 bg-[#06151a]/95 space-y-4 shadow-xl border border-slate-700">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-teal-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products (e.g. Neem Oil, Urea, DAP, Cotton Seeds, Knapsack Sprayer)..."
              className="w-full pl-11 pr-4 py-3 text-sm text-white font-bold bg-[#030b0e] border border-slate-700 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 rounded-2xl outline-none placeholder:text-slate-500 placeholder:font-medium transition-all shadow-inner"
            />
          </div>

          {/* Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 flex-shrink-0 shadow-sm cursor-pointer ${
              filterDrawerOpen || categoryFilter !== 'All' || maxPrice || minRating || locationFilter !== 'All'
                ? 'bg-teal-950/80 text-teal-300 border-teal-500/50 ring-2 ring-teal-400/20'
                : 'bg-[#030b0e] hover:bg-[#0c242c] text-white border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-teal-400" />
            <span>Filters</span>
            {(categoryFilter !== 'All' || maxPrice || minRating || locationFilter !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Collapsible Filter Options Panel */}
        {filterDrawerOpen && (
          <div className="pt-4 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Location Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Filter by Location / City
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{ backgroundColor: '#030b0e', color: '#ffffff' }}
                className="w-full px-3.5 py-2.5 text-xs font-bold text-white bg-[#030b0e] border border-slate-700 rounded-xl focus:border-teal-400 outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#06151a] text-white font-bold">All Locations (Nearby First)</option>
                {locations.filter(l => l !== 'All').map((loc) => (
                  <option key={loc} value={loc} className="bg-[#06151a] text-white font-semibold">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Product Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ backgroundColor: '#030b0e', color: '#ffffff' }}
                className="w-full px-3.5 py-2.5 text-xs font-bold text-white bg-[#030b0e] border border-slate-700 rounded-xl focus:border-teal-400 outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#06151a] text-white font-semibold">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Max Price (₹)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3.5 py-2.5 text-xs font-bold text-white bg-[#030b0e] border border-slate-700 rounded-xl focus:border-teal-400 outline-none"
              />
            </div>

            {/* Min Shop Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                style={{ backgroundColor: '#030b0e', color: '#ffffff' }}
                className="w-full px-3.5 py-2.5 text-xs font-bold text-white bg-[#030b0e] border border-slate-700 rounded-xl focus:border-teal-400 outline-none cursor-pointer"
              >
                <option value="" className="bg-[#06151a] text-white">Any Rating</option>
                <option value="4.5" className="bg-[#06151a] text-white">4.5+ Stars ★★★★★</option>
                <option value="4.0" className="bg-[#06151a] text-white">4.0+ Stars ★★★★</option>
                <option value="3.5" className="bg-[#06151a] text-white">3.5+ Stars ★★★</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Switcher: Products Availability vs Agro Shops */}
      <div className="flex items-center gap-2 p-1.5 bg-[#06151a] rounded-2xl border border-slate-700 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('PRODUCTS')}
          className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'PRODUCTS'
              ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-[#0c242c]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Availability ({processedProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SHOPS')}
          className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'SHOPS'
              ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-[#0c242c]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Agro Shops ({processedShops.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Searching verified agricultural stores..." fullScreen={false} />
      ) : activeTab === 'PRODUCTS' ? (
        /* ========================================================================= */
        /* TAB 1: PRODUCT AVAILABILITY CARDS                                          */
        /* ========================================================================= */
        processedProducts.length === 0 ? (
          <div className="glass-card bg-[#051419]/95 rounded-3xl p-10 sm:p-14 border border-dashed border-teal-500/30 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-teal-950/90 border border-teal-400/40 text-teal-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(45,212,191,0.15)]">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-black text-white">
                No Matching Products Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No agricultural products matched your current search or category filter. Try changing the keywords or resetting filters.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#071d24] hover:bg-[#0b2b35] text-teal-300 rounded-xl text-xs font-bold border border-teal-500/40 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedProducts.map((item) => (
              <div
                key={item._id}
                className="glass-card bg-[#051419]/95 rounded-2xl p-4 border border-slate-700/80 hover:border-teal-400/80 transition-all shadow-lg flex flex-col justify-between group space-y-3"
              >
                {/* Image & Badges */}
                <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-[#030b0e] border border-slate-700/80 flex items-center justify-center p-2">
                  <img
                    src={item.imageUrl || item.product?.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=400&q=80'}
                    alt={item.customName || item.product?.name}
                    className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.proximity?.label && (
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${item.proximity.badgeClass}`}>
                      {item.proximity.label}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-[#030b0e]/90 text-teal-300 border border-teal-500/40">
                    {item.product?.category || 'Fertilizer'}
                  </span>

                  {/* Stock Availability Badge on Image */}
                  {(() => {
                    const qty = typeof item.stock === 'number' ? item.stock : (typeof item.quantity === 'number' ? item.quantity : undefined);
                    const isOut = item.status === 'Out of Stock' || item.status === 'Empty' || qty === 0;
                    const isLow = item.status === 'Low Stock' || item.status === 'Low' || (qty !== undefined && qty > 0 && qty <= 5);
                    return (
                      <span
                        className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold border flex items-center gap-1 shadow-xs ${
                          isOut
                            ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                            : isLow
                            ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                            : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOut ? 'bg-rose-400' : isLow ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                          }`}
                        />
                        <span>
                          {isOut
                            ? 'Out of Stock'
                            : isLow
                            ? `Low Stock (${qty || 1} left)`
                            : `In Stock (${qty !== undefined && qty > 0 ? `${qty} in stock` : 'Available'})`}
                        </span>
                      </span>
                    );
                  })()}
                </div>

                {/* Info */}
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                    {item.customName || item.product?.name}
                  </h3>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {item.product?.description || 'Government certified agricultural input.'}
                  </p>
                </div>

                {/* Shop Reference Card */}
                <div className="p-2.5 rounded-xl bg-[#030b0e] border border-slate-700/70 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-medium flex-shrink-0 text-[11px]">Available At:</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-extrabold text-white text-xs truncate">{item.shop?.shopName}</span>
                      {item.shop?.ratingAverage && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 flex-shrink-0">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {item.shop.ratingAverage.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Location:</span>
                    <span className="text-teal-300 font-semibold">{item.shop?.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Stock Status:</span>
                    {(() => {
                      const qty = typeof item.stock === 'number' ? item.stock : (typeof item.quantity === 'number' ? item.quantity : undefined);
                      const isOut = item.status === 'Out of Stock' || item.status === 'Empty' || qty === 0;
                      const isLow = item.status === 'Low Stock' || item.status === 'Low' || (qty !== undefined && qty > 0 && qty <= 5);
                      return (
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOut ? 'bg-rose-400' : isLow ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                            }`}
                          />
                          {isOut
                            ? 'Out of Stock'
                            : isLow
                            ? `Low Stock (${qty || 1} ${item.unit || 'left'})`
                            : `In Stock (${qty !== undefined && qty > 0 ? `${qty} ` : ''}${item.unit || 'units'})`}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 text-[11px]">Price:</span>
                    <span className="text-sm font-black text-white">
                      ₹{item.price}<span className="text-[10px] text-slate-400 font-normal">/{item.unit || 'kg'}</span>
                    </span>
                  </div>
                </div>

                {/* View Shop Button */}
                <Link
                  to={`/farmer/shops/${item.shop?._id}`}
                  className="w-full py-2 px-3 bg-[#071d24] hover:bg-teal-500 hover:text-slate-950 text-teal-300 text-xs font-bold rounded-xl border border-teal-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Dealer & Inventory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ========================================================================= */
        /* TAB 2: AGRO SHOPS DIRECTORY                                               */
        /* ========================================================================= */
        processedShops.length === 0 ? (
          <div className="glass-card bg-[#051419]/95 rounded-3xl p-10 sm:p-14 border border-dashed border-teal-500/30 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-teal-950/90 border border-teal-400/40 text-teal-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(45,212,191,0.15)]">
              <Store className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-black text-white">
                No Agro Shops Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No authorized dealers matched your location or search filter. Try resetting your search filters to explore all available shops.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#071d24] hover:bg-[#0b2b35] text-teal-300 rounded-xl text-xs font-bold border border-teal-500/40 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedShops.map((shop) => (
              <div
                key={shop._id}
                className="glass-card bg-[#051419]/95 rounded-2xl p-4 border border-slate-700/80 hover:border-teal-400/80 transition-all shadow-lg flex flex-col justify-between group space-y-3"
              >
                {/* Shop Cover Image & Proximity Badge */}
                <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-[#030b0e] border border-slate-700/80 flex items-center justify-center">
                  <img
                    src={shop.imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80'}
                    alt={shop.shopName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {shop.proximity?.label && (
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${shop.proximity.badgeClass}`}>
                      {shop.proximity.label}
                    </span>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-extrabold text-amber-300 bg-[#030b0e]/90 px-2 py-0.5 rounded-md border border-slate-700">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{shop.ratingAverage ? shop.ratingAverage.toFixed(1) : '4.5'}</span>
                  </div>
                </div>

                {/* Shop Info */}
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                    {shop.shopName}
                  </h3>
                  <p className="text-[11px] text-slate-300 flex items-start gap-1 line-clamp-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>{shop.address || shop.location}</span>
                  </p>
                </div>

                {/* Shop Details */}
                <div className="p-2.5 rounded-xl bg-[#030b0e] border border-slate-700/70 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Package className="w-3.5 h-3.5 text-teal-400" />
                    <span><strong>{shop.productCount || 0}</strong> Products listed</span>
                  </div>
                  {shop.phone && (
                    <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Phone className="w-3 h-3 text-teal-400" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                </div>

                {/* View Shop Button */}
                <Link
                  to={`/farmer/shops/${shop._id}`}
                  className="w-full py-2 px-3 btn-glow-primary text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
                >
                  <span>Visit Shop & Browse Stock ➔</span>
                </Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
