import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
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
  SlidersHorizontal
} from 'lucide-react';

export default function ShopDiscoveryPage() {
  const [activeTab, setActiveTab] = useState('PRODUCTS'); // 'PRODUCTS' | 'SHOPS'
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categories matching wireframe 2 & specifications
  const categories = ['All', 'Fertilizer', 'Seeds', 'Pesticide', 'Tools', 'Machines', 'Others'];
  const locations = ['All', 'Vijayawada', 'Guntur', 'Mangalagiri'];

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          🏪 Agricultural Shops & Product Availability
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Find authorized local fertilizer, seed, and equipment shops with real-time stock verification.
        </p>
      </div>

      {/* Search & Filter Bar (Matches Wireframe 3: Search Product + Filter Icon) */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 bg-white space-y-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products (e.g. Urea, DAP, Cotton Seeds, Knapsack Sprayer)..."
              className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
            />
          </div>

          {/* Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 flex-shrink-0 ${
              filterDrawerOpen || locationFilter !== 'All' || categoryFilter !== 'All' || maxPrice || minRating
                ? 'bg-forest-50 text-forest-800 border-forest-400 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-forest-600" />
            <span>Filters {(locationFilter !== 'All' || categoryFilter !== 'All') ? '• Active' : ''}</span>
          </button>
        </div>

        {/* Filter Drawer / Accordion (Wireframe 3 Filter Box: Price, Location, Category, Rating, Reset) */}
        {filterDrawerOpen && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in text-xs">
            {/* 1. Category */}
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5 text-[10px]">
                Product Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none font-semibold text-xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Location */}
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5 text-[10px]">
                Shop Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none font-semibold text-xs"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Max Price */}
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5 text-[10px]">
                Max Price (₹)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none text-xs"
              />
            </div>

            {/* 4. Min Rating */}
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5 text-[10px]">
                Min Rating
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none font-semibold text-xs"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">⭐ 4.5+ Stars</option>
                  <option value="4.0">⭐ 4.0+ Stars</option>
                </select>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="Reset all filters"
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Switcher: Product Stock Availability vs Shop Centers */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'PRODUCTS'
                ? 'bg-forest-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Product Availability ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('SHOPS')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'SHOPS'
                ? 'bg-forest-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
        /* Section 34: Product Stock Comparison Across Shops */
        <div>
          {products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No matching products found"
              description="No agricultural products match your search or filter criteria. Try searching for 'Urea', 'DAP', or 'Seeds'."
              actionText="Reset Search"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((item) => {
                const prod = item.product || {};
                const shop = item.shop || {};
                const isOutOfStock = item.status === 'Out of Stock' || item.quantity === 0;

                return (
                  <div
                    key={item._id}
                    className="glass-card rounded-3xl p-5 border border-slate-200 flex flex-col justify-between group transition-all"
                  >
                    <div className="space-y-3">
                      {/* Product Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                          <img
                            src={item.imageUrl || prod.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80'}
                            alt={item.customName || prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-base text-slate-900 group-hover:text-forest-700 transition-colors truncate">
                            {item.customName || prod.name}
                          </h4>
                          <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">
                            {prod.category || 'General'}
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Live Stock Status (Prompt Section 34 Example) */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                          <span className="text-base font-extrabold text-forest-800">
                            {formatCurrency(item.price)}
                            <span className="text-xs font-normal text-slate-500">/{item.unit}</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Availability</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              isOutOfStock
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : item.status === 'Low Stock'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {isOutOfStock ? '🔴 Temporarily Out of Stock' : `🟢 ${item.status} (${item.quantity} ${item.unit})`}
                          </span>
                        </div>
                      </div>

                      {/* Store Details */}
                      <div className="space-y-1 text-xs text-slate-600 pt-1">
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-forest-600" />
                          {shop.shopName}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {shop.location} • {shop.address}
                        </p>
                      </div>
                    </div>

                    {/* Open Shop Link */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {shop.ratingAverage?.toFixed(1) || '4.5'}
                      </span>

                      <Link
                        to={`/farmer/shops/${shop._id}`}
                        className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
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
                  className="glass-card rounded-3xl overflow-hidden border border-slate-200 hover:border-forest-500 group transition-all"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={shop.imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80'}
                      alt={shop.shopName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{shop.ratingAverage?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-forest-700 transition-colors truncate">
                      {shop.shopName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-forest-800">
                      <MapPin className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
                      <span>{shop.location}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {shop.address}
                    </p>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-forest-700">
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
