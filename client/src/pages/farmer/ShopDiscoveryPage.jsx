import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/helpers';
import {
  Store,
  Search,
  Filter,
  MapPin,
  Star,
  Tag,
  Package,
  Layers,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeft,
  Navigation
} from 'lucide-react';

export default function ShopDiscoveryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('PRODUCTS'); // 'PRODUCTS' | 'SHOPS'
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [locations, setLocations] = useState(['All', 'Vijayawada', 'Guntur', 'Mangalagiri']);
  const [loading, setLoading] = useState(true);

  // Farmer's registered location
  const farmerVillage = user?.profile?.village || '';
  const farmerDistrict = user?.profile?.district || '';
  const farmerLocation = farmerVillage || farmerDistrict || '';

  // Categories matching specifications
  const categories = ['All', 'Fertilizer', 'Seeds', 'Pesticide', 'Tools', 'Machines', 'Others'];

  // Fetch dynamic locations from database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await apiClient.get('/shops/locations');
        if (res.data.success && res.data.locations?.length > 0) {
          setLocations(['All', ...res.data.locations]);
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
      // Fetch products across shops
      const productParams = {};
      if (searchQuery) productParams.query = searchQuery;
      if (locationFilter !== 'All') productParams.location = locationFilter;
      if (categoryFilter !== 'All') productParams.category = categoryFilter;
      if (maxPrice) productParams.maxPrice = maxPrice;
      if (minRating) productParams.minRating = minRating;

      const prodRes = await apiClient.get('/products/search', { params: productParams });
      if (prodRes.data.success) {
        setProducts(prodRes.data.results);
      }

      // Fetch shops
      const shopParams = {};
      if (searchQuery) shopParams.search = searchQuery;
      if (locationFilter !== 'All') shopParams.location = locationFilter;
      if (minRating) shopParams.minRating = minRating;

      const shopRes = await apiClient.get('/shops', { params: shopParams });
      if (shopRes.data.success) {
        setShops(shopRes.data.shops);
      }
    } catch (err) {
      console.error('Error discovering shops/products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, locationFilter, categoryFilter, maxPrice, minRating]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setLocationFilter('All');
    setCategoryFilter('All');
    setMinRating('');
    setMaxPrice('');
  };

  const isNearby = (shopLoc = '', shopAddr = '') => {
    if (!farmerLocation) return false;
    const combined = `${shopLoc} ${shopAddr}`.toLowerCase();
    const stopWords = new Set(['town', 'city', 'district', 'distrcit', 'dist', 'near', 'mandal', 'village', 'state', 'andhra', 'pradesh']);
    const tokens = `${farmerVillage} ${farmerDistrict} ${farmerLocation}`
      .split(/[,;\s/]+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length >= 2 && !stopWords.has(t));

    return tokens.some(t => combined.includes(t));
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

      {/* Farmer Location Banner */}
      {farmerLocation && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-teal-950/60 border border-teal-500/30 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center flex-shrink-0 border border-teal-500/30">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Farmer Registered Location:{' '}
                <span className="text-teal-300 font-extrabold">
                  {farmerVillage ? `${farmerVillage}, ` : ''}{farmerDistrict || 'Vijayawada'}
                </span>
              </p>
              <p className="text-[11px] text-slate-300">
                {locationFilter === 'All'
                  ? 'Showing all verified agricultural centers. Nearby shops are highlighted below.'
                  : `Currently filtered by "${locationFilter}".`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {locationFilter !== (farmerDistrict || farmerVillage) && (
              <button
                type="button"
                onClick={() => setLocationFilter(farmerDistrict || farmerVillage || 'Vijayawada')}
                className="px-3 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Show Nearby Only</span>
              </button>
            )}
            {locationFilter !== 'All' && (
              <button
                type="button"
                onClick={() => setLocationFilter('All')}
                className="px-3 py-1.5 bg-[#06171c] hover:bg-[#0c242c] text-slate-300 text-xs font-semibold rounded-xl border border-teal-500/30 transition-all cursor-pointer"
              >
                Show All Locations
              </button>
            )}
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
              filterDrawerOpen || locationFilter !== 'All' || categoryFilter !== 'All' || maxPrice || minRating
                ? 'bg-teal-950/80 text-teal-300 border-teal-500/50 ring-2 ring-teal-400/20'
                : 'bg-[#030b0e] hover:bg-[#0c242c] text-white border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-teal-400" />
            <span>Filters {(locationFilter !== 'All' || categoryFilter !== 'All') ? '• Active' : ''}</span>
          </button>
        </div>

        {/* Filter Drawer */}
        {filterDrawerOpen && (
          <div className="pt-4 border-t border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[10px]">Product Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#030b0e] border border-slate-700 rounded-xl focus:border-teal-400 outline-none font-bold text-white text-xs shadow-2xs cursor-pointer"
              >
                {categories.map((c) => <option key={c} value={c} className="bg-[#06151a] text-white">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[10px]">Shop Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#030b0e] border border-slate-700 rounded-xl focus:border-teal-400 outline-none font-bold text-white text-xs shadow-2xs cursor-pointer"
              >
                {locations.map((loc) => <option key={loc} value={loc} className="bg-[#06151a] text-white">{loc}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[10px]">Max Price (₹)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 bg-[#030b0e] border border-slate-700 rounded-xl focus:border-teal-400 outline-none font-bold text-white text-xs shadow-2xs placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[10px]">Min Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-3 py-2 bg-[#030b0e] border border-slate-700 rounded-xl focus:border-teal-400 outline-none font-bold text-white text-xs shadow-2xs cursor-pointer"
              >
                <option value="" className="bg-[#06151a] text-white">Any Rating</option>
                <option value="4" className="bg-[#06151a] text-white">⭐ 4.0 & above</option>
                <option value="4.5" className="bg-[#06151a] text-white">⭐ 4.5 & above</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {(searchQuery || locationFilter !== 'All' || categoryFilter !== 'All' || maxPrice || minRating) && (
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-700">
            <span>
              Showing results for:{' '}
              {categoryFilter !== 'All' && <strong className="text-teal-400 font-bold">{categoryFilter} • </strong>}
              {locationFilter !== 'All' && <strong className="text-teal-400 font-bold">{locationFilter} • </strong>}
              {searchQuery && <strong className="text-teal-400 font-bold">"{searchQuery}"</strong>}
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
            </button>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="pt-3 border-t border-slate-700 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'PRODUCTS'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-[#030b0e] hover:bg-[#0c242c] text-slate-300'
            }`}
          >
            Product Availability ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('SHOPS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'SHOPS'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-[#030b0e] hover:bg-[#0c242c] text-slate-300'
            }`}
          >
            Agro Shops ({shops.length})
          </button>
        </div>
      </div>

      {/* Main Results View */}
      {loading ? (
        <LoadingSpinner message="Searching shops and live stock..." />
      ) : activeTab === 'PRODUCTS' ? (
        <div>
          {products.length === 0 ? (
            shops.length > 0 ? (
              <div className="glass-card bg-[#06151a]/90 rounded-3xl border border-teal-500/20 p-8 text-center space-y-4 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-teal-950 text-teal-400 mx-auto flex items-center justify-center border border-teal-500/30">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {shops.length} Agro Shop{shops.length > 1 ? 's' : ''} Found in Your Area
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                    The local dealer(s) are registered in this area, but haven't listed individual item-level product stock yet. Click below to view the shops and contact them directly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('SHOPS')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4" /> View Agro Shops ({shops.length})
                </button>
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No matching products found"
                description="No agricultural products match your search or filter criteria. Try searching for 'Urea', 'DAP', or 'Seeds'."
                actionText="Reset Search"
                onAction={handleResetFilters}
              />
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((item) => {
                const prod = item.product || {};
                const shop = item.shop || {};
                const isOutOfStock = item.status === 'Out of Stock' || item.quantity === 0;

                return (
                  <div
                    key={item._id}
                    className="glass-card rounded-3xl p-5 border border-slate-700 bg-[#06151a]/95 flex flex-col justify-between group transition-all hover:border-teal-400/50 shadow-xl"
                  >
                    <div className="space-y-3">
                      {/* Product Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700">
                          <img
                            src={item.imageUrl || prod.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80'}
                            alt={item.customName || prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-base text-white group-hover:text-teal-300 transition-colors truncate">
                            {item.customName || prod.name}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="inline-block text-[11px] font-semibold text-slate-300 bg-[#030b0e] border border-slate-700 px-2 py-0.5 rounded-md">
                              {prod.category || 'General'}
                            </span>
                            {isNearby(shop.location || shop.address) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-300 bg-teal-950/80 border border-teal-700 px-2 py-0.5 rounded-md">
                                📍 Near Your Farm
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Live Stock Status */}
                      <div className="p-3 bg-[#030b0e] rounded-2xl border border-slate-700 flex items-center justify-between shadow-2xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                          <span className="text-base font-black text-white">
                            {formatCurrency(item.price)}
                            <span className="text-xs font-medium text-slate-500">/{item.unit}</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Availability</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              item.status === 'Out of Stock' || item.status === 'Empty'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-900'
                                : item.status === 'Low Stock'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-900'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-900'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {item.status === 'Out of Stock' || item.status === 'Empty'
                              ? `🔴 Out of Stock (${item.quantity} ${item.unit})`
                              : item.status === 'Low Stock'
                              ? `🟠 Low Stock (${item.quantity} ${item.unit})`
                              : `🟢 ${item.status} (${item.quantity} ${item.unit})`}
                          </span>
                        </div>
                      </div>

                      {/* Store Details */}
                      <div className="space-y-1 text-xs text-slate-300 pt-1">
                        <p className="font-bold text-white flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-teal-400" />
                          {shop.shopName}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {shop.location} • {shop.address}
                        </p>
                      </div>
                    </div>

                    {/* Open Shop Link */}
                    <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {shop.ratingAverage?.toFixed(1) || '4.5'}
                      </span>

                      <Link
                        to={`/farmer/shops/${shop._id}`}
                        className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        View Shop Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Shops Grid View (Wireframe 3: Shop cards with rating) */
        <div>
          {shops.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No agricultural shops found"
              description="No authorized shops found matching your search location."
              actionText="Reset Filter"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <Link
                  key={shop._id}
                  to={`/farmer/shops/${shop._id}`}
                  className="glass-card rounded-3xl overflow-hidden border border-slate-700 hover:border-teal-400 bg-[#06151a]/95 group transition-all shadow-xl"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={shop.imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80'}
                      alt={shop.shopName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {isNearby(shop.location || shop.address) && (
                      <div className="absolute top-3 left-3 bg-[#030b0e]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-teal-300 border border-slate-700 flex items-center gap-1 shadow-md">
                        📍 Near Your Farm
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-[#030b0e]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-300 border border-slate-700 flex items-center gap-1 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{shop.ratingAverage?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-teal-300 transition-colors truncate">
                      {shop.shopName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                      <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <span>{shop.location}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {shop.address}
                    </p>
                    <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs font-bold text-teal-300">
                      <span>Browse Store Inventory</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
