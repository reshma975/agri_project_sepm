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
  const hasFarmerLocation = Boolean(farmerVillage || farmerMandal || farmerDistrict);

  // Categories
  const categories = ['All', 'Fertilizer', 'Seeds', 'Pesticide', 'Tools', 'Machines', 'Others'];

  // Fetch distinct locations from shops database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await apiClient.get('/shops/locations');
        if (res.data.success && res.data.locations?.length > 0) {
          const list = ['All', ...res.data.locations.filter(l => l !== 'All')];
          setLocations([...new Set(list)]);
        }
      } catch (err) {
        console.error('Error fetching dynamic locations:', err);
      }
    };
    fetchLocations();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch products
      const productParams = {};
      if (searchQuery) productParams.query = searchQuery;
      if (categoryFilter !== 'All') productParams.category = categoryFilter;
      if (maxPrice) productParams.maxPrice = maxPrice;
      if (minRating) productParams.minRating = minRating;

      const prodRes = await apiClient.get('/products/search', { params: productParams });
      if (prodRes.data.success) {
        setRawProducts(prodRes.data.results || []);
      }

      // Fetch shops
      const shopParams = {};
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
  }, [searchQuery, categoryFilter, maxPrice, minRating]);

  // Helper to extract keywords from location strings
  const extractTokens = (str = '') => {
    if (!str) return [];
    return str
      .toLowerCase()
      .split(/[,;\s/]+/)
      .map(t => t.replace(/[^a-z0-9]/gi, '').trim())
      .filter(t => t.length >= 3 && !['village', 'mandal', 'town', 'district', 'dist', 'state', 'andhra', 'pradesh', 'ap'].includes(t));
  };

  // Proximity Calculation (Prioritize Same Village -> Same Mandal -> Same District -> All Other Shops)
  const getProximity = (shop) => {
    if (!shop || !hasFarmerLocation) {
      return { score: 10, rank: 99, level: 'ALL', label: '', badgeClass: '', isNearby: false };
    }

    const shopCombined = `${shop.location || ''} ${shop.address || ''} ${shop.shopName || ''}`.toLowerCase();

    const vTokens = extractTokens(farmerVillage);
    const mTokens = extractTokens(farmerMandal);
    const dTokens = extractTokens(farmerDistrict);

    // Expand district synonyms (e.g. NTR -> Vijayawada / Krishna)
    if (dTokens.includes('ntr') || dTokens.includes('vijayawada') || dTokens.includes('krishna')) {
      dTokens.push('ntr', 'vijayawada', 'krishna');
    }

    // 1. Same Village / Town (Rank 1 - Highest Priority)
    if (vTokens.length > 0 && vTokens.some(t => shopCombined.includes(t))) {
      return {
        score: 300,
        rank: 1,
        level: 'VILLAGE',
        label: '📍 In Your Village',
        badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-sm ring-1 ring-emerald-400/30',
        isNearby: true
      };
    }

    // 2. Same Mandal / Tehsil (Rank 2)
    if (mTokens.length > 0 && mTokens.some(t => shopCombined.includes(t))) {
      return {
        score: 200,
        rank: 2,
        level: 'MANDAL',
        label: '📍 In Your Mandal',
        badgeClass: 'bg-teal-950/90 text-teal-300 border-teal-500/50 shadow-sm',
        isNearby: true
      };
    }

    // 3. Same District (Rank 3)
    if (dTokens.length > 0 && dTokens.some(t => shopCombined.includes(t))) {
      return {
        score: 100,
        rank: 3,
        level: 'DISTRICT',
        label: '📍 In Your District',
        badgeClass: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50 shadow-sm',
        isNearby: true
      };
    }

    // Default: Show all shops with standard priority
    return {
      score: 10,
      rank: 99,
      level: 'ALL',
      label: '',
      badgeClass: '',
      isNearby: false
    };
  };

  // Processed Products with Smart Prioritization
  const processedProducts = useMemo(() => {
    const scored = rawProducts.map((item) => ({
      ...item,
      proximity: getProximity(item.shop)
    }));

    if (locationFilter === 'All') {
      // Sort by proximity score (Closest shops first) then by price
      return scored.sort((a, b) => b.proximity.score - a.proximity.score || a.price - b.price);
    } else {
      // Filter by specific location selected in dropdown
      const target = locationFilter.toLowerCase();
      return scored.filter((item) => {
        const text = `${item.shop?.location || ''} ${item.shop?.address || ''}`.toLowerCase();
        return text.includes(target);
      });
    }
  }, [rawProducts, locationFilter, farmerVillage, farmerMandal, farmerDistrict]);

  // Processed Shops with Smart Prioritization
  const processedShops = useMemo(() => {
    const scored = rawShops.map((shop) => ({
      ...shop,
      proximity: getProximity(shop)
    }));

    if (locationFilter === 'All') {
      // Sort by proximity score (Closest shops first) then by rating
      return scored.sort((a, b) => b.proximity.score - a.proximity.score || (b.ratingAverage || 0) - (a.ratingAverage || 0));
    } else {
      // Filter by specific location selected in dropdown
      const target = locationFilter.toLowerCase();
      return scored.filter((shop) => {
        const text = `${shop.location || ''} ${shop.address || ''}`.toLowerCase();
        return text.includes(target);
      });
    }
  }, [rawShops, locationFilter, farmerVillage, farmerMandal, farmerDistrict]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedProducts.map((item) => (
              <div
                key={item._id}
                className="glass-card bg-[#051419]/95 rounded-3xl p-5 border border-slate-700/80 hover:border-teal-400/80 transition-all shadow-xl flex flex-col justify-between group space-y-4"
              >
                {/* Image & Badges */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-[#030b0e] border border-slate-700/80 flex items-center justify-center p-2">
                  <img
                    src={item.imageUrl || item.product?.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=400&q=80'}
                    alt={item.customName || item.product?.name}
                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.proximity?.label && (
                    <span className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${item.proximity.badgeClass}`}>
                      {item.proximity.label}
                    </span>
                  )}
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#030b0e]/90 text-teal-300 border border-teal-500/40">
                    {item.product?.category || 'Fertilizer'}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base font-black text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                    {item.customName || item.product?.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.product?.description || 'Government certified agricultural input.'}
                  </p>
                </div>

                {/* Shop Reference Card */}
                <div className="p-3 rounded-2xl bg-[#030b0e] border border-slate-700/70 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Available At:</span>
                    <span className="font-extrabold text-white line-clamp-1">{item.shop?.shopName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Location:</span>
                    <span className="text-teal-300 font-semibold">{item.shop?.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Price:</span>
                    <span className="text-base font-black text-white">
                      ₹{item.price}<span className="text-[10px] text-slate-400 font-normal">/{item.unit || 'kg'}</span>
                    </span>
                  </div>
                </div>

                {/* View Shop Button */}
                <Link
                  to={`/farmer/shops/${item.shop?._id}`}
                  className="w-full py-2.5 px-4 bg-[#071d24] hover:bg-teal-500 hover:text-slate-950 text-teal-300 text-xs font-bold rounded-xl border border-teal-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedShops.map((shop) => (
              <div
                key={shop._id}
                className="glass-card bg-[#051419]/95 rounded-3xl p-5 border border-slate-700/80 hover:border-teal-400/80 transition-all shadow-xl flex flex-col justify-between group space-y-4"
              >
                {/* Shop Cover Image & Proximity Badge */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-[#030b0e] border border-slate-700/80 flex items-center justify-center">
                  <img
                    src={shop.imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80'}
                    alt={shop.shopName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {shop.proximity?.label && (
                    <span className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${shop.proximity.badgeClass}`}>
                      {shop.proximity.label}
                    </span>
                  )}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-extrabold text-amber-300 bg-[#030b0e]/90 px-2 py-0.5 rounded-lg border border-slate-700">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{shop.ratingAverage ? shop.ratingAverage.toFixed(1) : '4.5'}</span>
                  </div>
                </div>

                {/* Shop Info */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                    {shop.shopName}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-start gap-1 line-clamp-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>{shop.address || shop.location}</span>
                  </p>
                </div>

                {/* Shop Details */}
                <div className="p-3 rounded-2xl bg-[#030b0e] border border-slate-700/70 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-teal-400" />
                    <span><strong>{shop.productCount || 0}</strong> Products listed</span>
                  </div>
                  {shop.phone && (
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Phone className="w-3 h-3 text-teal-400" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                </div>

                {/* View Shop Button */}
                <Link
                  to={`/farmer/shops/${shop._id}`}
                  className="w-full py-2.5 px-4 btn-glow-primary text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
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
