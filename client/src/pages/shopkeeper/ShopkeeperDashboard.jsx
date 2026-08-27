import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import AddProductModal from '../../components/shopkeeper/AddProductModal';
import CategoriesModal from '../../components/shopkeeper/CategoriesModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Store,
  MapPin,
  Star,
  Plus,
  Package,
  Layers,
  ShoppingCart,
  Clock,
  Phone,
  Mail,
  Calendar,
  Edit2,
  ArrowRight,
  Info,
  CheckCircle2,
  Tag,
  Save,
  X,
  Sparkles
} from 'lucide-react';

export function getShopOpenStatus(timings) {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1-6 = Mon-Sat
    const isSunday = dayOfWeek === 0;

    const timingStr = isSunday
      ? (timings?.sunday || '7:30 AM - 1:00 PM')
      : (timings?.weekday || '7:30 AM - 8:00 PM');

    const parts = timingStr.split('-').map((p) => p.trim());
    if (parts.length !== 2) {
      return {
        isOpen: true,
        label: 'Open',
        detail: 'Open today',
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
        dotClass: 'bg-emerald-400 animate-pulse',
      };
    }

    const parseTimeToMinutes = (tStr) => {
      const match = tStr.match(/(\d+):?(\d+)?\s*(AM|PM)/i);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      const meridiem = match[3].toUpperCase();

      if (meridiem === 'PM' && hours !== 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const openMinutes = parseTimeToMinutes(parts[0]);
    const closeMinutes = parseTimeToMinutes(parts[1]);

    if (openMinutes === null || closeMinutes === null) {
      return {
        isOpen: true,
        label: 'Open',
        detail: `Open until ${parts[1]}`,
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
        dotClass: 'bg-emerald-400 animate-pulse',
      };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      return {
        isOpen: true,
        label: 'Open',
        detail: `Open until ${parts[1]}`,
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
        dotClass: 'bg-emerald-400 animate-pulse',
      };
    } else {
      const nextDayIsSunday = (dayOfWeek + 1) % 7 === 0;
      const nextOpenStr = currentMinutes < openMinutes
        ? parts[0]
        : (nextDayIsSunday
            ? (timings?.sunday || '7:30 AM - 1:00 PM').split('-')[0].trim()
            : (timings?.weekday || '7:30 AM - 8:00 PM').split('-')[0].trim());

      const nextDayLabel = currentMinutes < openMinutes ? '' : (nextDayIsSunday ? ' (Sun)' : ' (tomorrow)');

      return {
        isOpen: false,
        label: 'Closed',
        detail: `Opens at ${nextOpenStr}${nextDayLabel}`,
        badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
        dotClass: 'bg-rose-400',
      };

    }
  } catch (err) {
    return {
      isOpen: true,
      label: 'Open',
      detail: 'Open today',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      dotClass: 'bg-emerald-400 animate-pulse',
    };
  }
}

export default function ShopkeeperDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  // Editable Header state (Shop name, location, address)
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerData, setHeaderData] = useState({
    shopName: 'kumari dealers kanumuru',
    location: 'kanumuru village',
    address: 'opposite to ramalayam,main road , Kanumuru, Andhra Pradesh - 533215',
  });

  // Editable Timings state
  const [isEditingTimings, setIsEditingTimings] = useState(false);
  const [timingsData, setTimingsData] = useState({
    weekday: '7:30 AM - 8:00 PM',
    sunday: '7:30 AM - 1:00 PM',
    note: 'Timings may change on festival days',
  });


  const fetchShopData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/shops/my-shops');
      if (res.data.success && res.data.shops.length > 0) {
        const myShop = res.data.shops[0];
        setShop(myShop);
        setHeaderData({
          shopName: myShop.shopName || 'kumari dealers kanumuru',
          location: myShop.location || 'kanumuru village',
          address: myShop.address || 'opposite to ramalayam,main road , Kanumuru, Andhra Pradesh - 533215',
        });

        if (myShop.timings) {
          setTimingsData({
            weekday: myShop.timings.weekday || '7:30 AM - 8:00 PM',
            sunday: myShop.timings.sunday || '7:30 AM - 1:00 PM',
            note: myShop.timings.note || 'Timings may change on festival days',
          });
        }

        // Fetch products of this shop
        const prodRes = await apiClient.get(`/shops/${myShop._id}`);
        if (prodRes.data.success) {
          setProducts(prodRes.data.products || []);
        }
      } else {
        // Fallback default state matching screenshot 2
        setShop({
          _id: 'default_shop',
          shopName: 'kumari dealers kanumuru',
          location: 'kanumuru village',
          address: 'opposite to ramalayam,main road , Kanumuru, Andhra Pradesh - 533215',
          ratingAverage: 4.5,
          ratingCount: 12,
          imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1200&q=80',
          timings: {
            weekday: '7:30 AM - 8:00 PM',
            sunday: '7:30 AM - 1:00 PM',
            note: 'Timings may change on festival days',
          }
        });
      }
    } catch (err) {
      console.error('Error loading shop dashboard data:', err);
      setShop({
        _id: 'default_shop',
        shopName: 'kumari dealers kanumuru',
        location: 'kanumuru village',
        address: 'opposite to ramalayam,main road , Kanumuru, Andhra Pradesh - 533215',
        ratingAverage: 4.5,
        ratingCount: 12,
        imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1200&q=80',
        timings: {
          weekday: '7:30 AM - 8:00 PM',
          sunday: '7:30 AM - 1:00 PM',
          note: 'Timings may change on festival days',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const handleSaveHeader = async () => {
    if (shop && shop._id && shop._id !== 'default_shop') {
      try {
        await apiClient.put(`/shops/${shop._id}`, headerData);
      } catch (err) {
        console.error('Failed to update shop details in DB:', err);
      }
    }
    setShop((prev) => ({ ...prev, ...headerData }));
    setIsEditingHeader(false);
  };

  const handleSaveTimings = async () => {
    if (shop && shop._id && shop._id !== 'default_shop') {
      try {
        await apiClient.put(`/shops/${shop._id}`, { timings: timingsData });
      } catch (err) {
        console.error('Failed to update shop timings in DB:', err);
      }
    }
    setShop((prev) => ({ ...prev, timings: timingsData }));
    setIsEditingTimings(false);
  };

  const handleAddProduct = async (formData) => {
    if (shop && shop._id && shop._id !== 'default_shop') {
      try {
        const res = await apiClient.post(`/shops/${shop._id}/products`, formData);
        if (res.data.success) {
          fetchShopData();
          return { success: true };
        }
      } catch (err) {
        console.error('Error adding product:', err);
      }
    }
    fetchShopData();
    return { success: true };
  };

  if (loading) {
    return <LoadingSpinner message="Loading shop overview..." fullScreen />;
  }

  const inventoryCategories = [...new Set(products.map(p => p.category || p.productId?.category).filter(Boolean))];
  const activeProductsCount = products.length;
  const categoriesCount = inventoryCategories.length;
  const ordersCount = 342;
  const shopRating = shop?.ratingAverage ? shop.ratingAverage.toFixed(1) : '4.5';
  const reviewsCount = shop?.ratingCount || 12;



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. SHOP HERO / PROFILE CARD (MATCHING SCREENSHOT 2)                      */}
      {/* ========================================================================= */}
      <div className="glass-card bg-[#051419]/95 rounded-3xl p-5 sm:p-7 border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Shop Image on Left */}
          <div className="w-full lg:w-72 h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0 shadow-lg relative group">
            <img
              src={shop?.imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80'}
              alt={shop?.shopName || 'Shop Storefront'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030b0e]/60 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Shop Information in Middle */}
          <div className="flex-1 space-y-3 w-full">
            {!isEditingHeader ? (
              <>
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {shop?.shopName || 'kumari dealers kanumuru'}
                  </h1>

                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm sm:text-base">
                    <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>{shop?.location || 'kanumuru village'}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingHeader(true)}
                      title="Edit Location & Address"
                      className="p-1 text-slate-400 hover:text-teal-300 rounded-lg hover:bg-[#0c2830] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    {shop?.address || 'opposite to ramalayam,main road , Kanumuru, Andhra Pradesh - 533215'}
                  </p>
                </div>

                {/* Dynamic Timing & Open/Closed Status Badges */}
                {(() => {
                  const openStatus = getShopOpenStatus(timingsData);
                  return (
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-xs ${openStatus.badgeClass}`}>
                        <span className={`w-2 h-2 rounded-full ${openStatus.dotClass}`} />
                        {openStatus.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#030b0e] text-slate-300 border border-slate-700/80">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        {openStatus.detail}
                      </span>
                    </div>
                  );
                })()}
              </>

            ) : (
              <div className="space-y-3 bg-[#030b0e] p-4 rounded-2xl border border-slate-700">
                <input
                  type="text"
                  value={headerData.shopName}
                  onChange={(e) => setHeaderData({ ...headerData, shopName: e.target.value })}
                  placeholder="Shop Name"
                  className="w-full px-3 py-2 text-sm bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none font-bold"
                />
                <input
                  type="text"
                  value={headerData.location}
                  onChange={(e) => setHeaderData({ ...headerData, location: e.target.value })}
                  placeholder="Location / Village"
                  className="w-full px-3 py-2 text-sm bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none"
                />
                <textarea
                  rows={2}
                  value={headerData.address}
                  onChange={(e) => setHeaderData({ ...headerData, address: e.target.value })}
                  placeholder="Detailed Address"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveHeader}
                    className="px-4 py-1.5 btn-glow-primary text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingHeader(false)}
                    className="px-3 py-1.5 bg-[#06151a] hover:bg-[#0c242c] text-slate-300 border border-slate-700 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action & Rating */}
          <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 flex-shrink-0">
            {/* Rating Tag */}
            <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-white">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Rating: <strong className="text-white">{shopRating}</strong></span>
              <span className="text-xs text-slate-400 font-normal">({reviewsCount})</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setAddProductOpen(true)}
                className="px-5 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Add New Product</span>
              </button>

              {/* Prominent "Go to Products Page" button */}
              <button
                type="button"
                onClick={() => navigate('/shopkeeper/products')}
                className="px-5 py-2.5 bg-[#030b0e] hover:bg-[#0c2830] text-teal-300 hover:text-white border border-teal-500/40 text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Package className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>Go to Products Page</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STAT CARDS ROW (TOTAL PRODUCTS, CATEGORIES, SHOP RATING)               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Products */}
        <div
          onClick={() => navigate('/shopkeeper/products')}
          className="glass-card bg-[#051419]/95 rounded-2xl p-5 border border-slate-700/80 shadow-md flex items-center gap-4 cursor-pointer hover:border-teal-400 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Products</span>
            <div className="text-2xl font-black text-white">{activeProductsCount}</div>
            <span className="text-[11px] text-slate-400">Active in stock</span>
          </div>
        </div>

        {/* Categories (Clicking opens Categories Modal as Cards!) */}
        <div
          onClick={() => setCategoriesModalOpen(true)}
          className="glass-card bg-[#051419]/95 rounded-2xl p-5 border border-teal-500/40 shadow-md flex items-center gap-4 cursor-pointer hover:border-teal-300 hover:bg-[#081a20] transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-950/90 border border-teal-400/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(45,212,191,0.15)]">
            <Tag className="w-6 h-6 text-teal-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold block">Categories</span>
              <span className="text-[10px] text-teal-400 font-extrabold group-hover:underline">View All →</span>
            </div>
            <div className="text-2xl font-black text-[#2dd4bf] text-glow-teal">{categoriesCount}</div>
            <span className="text-[11px] text-teal-300/80">Click to explore cards</span>
          </div>
        </div>

        {/* Shop Rating */}
        <div className="glass-card bg-[#051419]/95 rounded-2xl p-5 border border-slate-700/80 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Shop Rating</span>
            <div className="text-2xl font-black text-white">{shopRating}</div>
            <span className="text-[11px] text-slate-400">From {reviewsCount} reviews</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ROW: ABOUT SHOP & EDITABLE SHOP TIMINGS (MATCHING SCREENSHOT 2) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: About Shop */}
        <div className="glass-card bg-[#051419]/95 rounded-3xl p-6 sm:p-7 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-teal-300 flex items-center gap-2">
              About Shop
            </h2>
            <Link
              to="/shopkeeper/profile"
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>Edit Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            We provide quality fertilizers, seeds, pesticides, and agriculture tools for all types of crops.
          </p>

          <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>{user?.phone || '+91 9876543210'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>{user?.email || 'kumaridealers@email.com'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <Calendar className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>
                Member since{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : shop?.createdAt
                  ? new Date(shop.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>

          </div>
        </div>

        {/* Card 2: Shop Timings (FULLY EDITABLE) */}
        <div className="glass-card bg-[#051419]/95 rounded-3xl p-6 sm:p-7 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-teal-300 flex items-center gap-2">
              Shop Timings
            </h2>
            {!isEditingTimings && (
              <button
                type="button"
                onClick={() => setIsEditingTimings(true)}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#030b0e] border border-teal-500/30 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Timings</span>
              </button>
            )}
          </div>

          {!isEditingTimings ? (
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Monday - Saturday</span>
                </div>
                <span className="font-bold text-white">{timingsData.weekday}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Sunday</span>
                </div>
                <span className="font-bold text-white">{timingsData.sunday}</span>
              </div>

              {/* Festival timings alert callout */}
              <div className="p-3 bg-[#030b0e] rounded-2xl border border-teal-900/60 text-xs text-teal-300/90 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>{timingsData.note}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-[#030b0e] p-4 rounded-2xl border border-slate-700">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Monday - Saturday Timings
                </label>
                <input
                  type="text"
                  value={timingsData.weekday}
                  onChange={(e) => setTimingsData({ ...timingsData, weekday: e.target.value })}
                  placeholder="e.g. 7:30 AM - 8:00 PM"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Sunday Timings
                </label>
                <input
                  type="text"
                  value={timingsData.sunday}
                  onChange={(e) => setTimingsData({ ...timingsData, sunday: e.target.value })}
                  placeholder="e.g. 7:30 AM - 1:00 PM"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Festival / Holiday Note
                </label>
                <input
                  type="text"
                  value={timingsData.note}
                  onChange={(e) => setTimingsData({ ...timingsData, note: e.target.value })}
                  placeholder="e.g. Timings may change on festival days"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveTimings}
                  className="px-4 py-1.5 btn-glow-primary text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Timings
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTimings(false)}
                  className="px-3 py-1.5 bg-[#06151a] hover:bg-[#0c242c] text-slate-300 border border-slate-700 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Categories Popup Modal (Showing inventory product categories as cards) */}
      <CategoriesModal
        isOpen={categoriesModalOpen}
        onClose={() => setCategoriesModalOpen(false)}
        products={products}
        onAddNewProduct={() => setAddProductOpen(true)}
        onSelectCategory={(categoryId) => {
          navigate(`/shopkeeper/products?category=${encodeURIComponent(categoryId)}`);
        }}
      />
    </div>
  );
}

