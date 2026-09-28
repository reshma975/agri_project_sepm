import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import AddProductModal from '../../components/shopkeeper/AddProductModal';
import CategoriesModal from '../../components/shopkeeper/CategoriesModal';
import UpdateShopPhotoModal from '../../components/shopkeeper/UpdateShopPhotoModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getShopOpenStatus } from './ShopkeeperDashboard';
import {
  Store,
  MapPin,
  Phone,
  Star,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  Package,
  Clock,
  Tag,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  ArrowRight,
  Info
} from 'lucide-react';

export default function ShopDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Editable header state
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerData, setHeaderData] = useState({
    shopName: '',
    location: '',
    village: '',
    mandal: '',
    district: '',
    state: 'Andhra Pradesh',
    address: '',
    phone: '',
  });

  // Editable timings state
  const [isEditingTimings, setIsEditingTimings] = useState(false);
  const [timingsData, setTimingsData] = useState({
    weekday: '7:30 AM - 8:00 PM',
    sunday: '7:30 AM - 1:00 PM',
    note: 'Timings may change on festival days',
  });

  // Modal states
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  // Delete shop confirmation
  const [deleteShopConfirmOpen, setDeleteShopConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get(`/shops/${id}`);
      if (res.data.success) {
        setShop(res.data.shop);
        setProducts(res.data.products || []);
        setReviews(res.data.reviews || []);

        const rawPhone = res.data.shop.phone || '';
        const digits = rawPhone.replace(/\D/g, '');
        const phone10 = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : (digits.length > 10 ? digits.slice(-10) : digits);

        setHeaderData({
          shopName: res.data.shop.shopName || '',
          location: res.data.shop.location || '',
          village: res.data.shop.village || res.data.shop.location || '',
          mandal: res.data.shop.mandal || '',
          district: res.data.shop.district || '',
          state: res.data.shop.state || 'Andhra Pradesh',
          address: res.data.shop.address || '',
          phone: phone10,
        });
        if (res.data.shop.timings) {
          setTimingsData({
            weekday: res.data.shop.timings.weekday || '7:30 AM - 8:00 PM',
            sunday: res.data.shop.timings.sunday || '7:30 AM - 1:00 PM',
            note: res.data.shop.timings.note || 'Timings may change on festival days',
          });
        }
      }
    } catch (err) {
      console.error('Error fetching shop details:', err);
      setError('Failed to load shop details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, [id]);

  // Save Header edits (Shop Name, Location, Address, Phone)
  const handleSaveHeader = async () => {
    try {
      const rawDigits = (headerData.phone || '').replace(/\D/g, '');
      const cleanPhone = rawDigits.length === 12 && rawDigits.startsWith('91') 
        ? rawDigits.slice(2) 
        : (rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits);

      if (cleanPhone && cleanPhone.length > 0) {
        if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
          setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
          return;
        }
      }

      const cleanLocation = headerData.village ? headerData.village.trim() : (headerData.location || '');
      
      const payload = {
        shopName: headerData.shopName.trim(),
        village: cleanLocation,
        mandal: (headerData.mandal || '').trim(),
        district: (headerData.district || '').trim(),
        state: (headerData.state || 'Andhra Pradesh').trim(),
        location: cleanLocation,
        address: (headerData.address || '').trim(),
        phone: cleanPhone ? `+91 ${cleanPhone}` : headerData.phone,
      };

      const res = await apiClient.put(`/shops/${id}`, payload);
      if (res.data.success) {
        setShop(res.data.shop);
        setIsEditingHeader(false);
        setSuccess('Shop details updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update shop header:', err);
      setError(err.response?.data?.message || 'Failed to update shop details.');
    }
  };

  // Save Timings edits
  const handleSaveTimings = async () => {
    try {
      const res = await apiClient.put(`/shops/${id}`, { timings: timingsData });
      if (res.data.success) {
        setShop((prev) => ({ ...prev, timings: timingsData }));
        setIsEditingTimings(false);
        setSuccess('Shop operating timings updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update timings:', err);
      setError('Failed to update shop timings.');
    }
  };

  // Save Photo
  const handleSavePhoto = async (newImageUrl) => {
    try {
      const res = await apiClient.put(`/shops/${id}`, { imageUrl: newImageUrl });
      if (res.data.success) {
        setShop((prev) => ({ ...prev, imageUrl: newImageUrl }));
        setSuccess('Store photo updated successfully!');
        return { success: true };
      }
      return { success: false, message: 'Failed to update photo' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error updating photo' };
    }
  };

  // Add Product to shop
  const handleAddProduct = async (formData) => {
    try {
      const res = await apiClient.post(`/shops/${id}/products`, formData);
      if (res.data.success) {
        setSuccess('Product added to inventory successfully!');
        fetchShopData();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add product',
      };
    }
  };

  // Delete shop confirmation
  const handleConfirmDeleteShop = async () => {
    setActionLoading(true);
    try {
      const res = await apiClient.delete(`/shops/${id}`);
      if (res.data.success) {
        navigate('/shopkeeper/dashboard');
      }
    } catch (err) {
      console.error('Delete shop error:', err);
      setError(err.response?.data?.message || 'Failed to delete shop');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading shop branch details and overview..." fullScreen />;
  }

  if (!shop) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-slate-300">Shop branch not found.</p>
        <Link to="/shopkeeper/dashboard" className="text-xs font-bold text-teal-400 mt-2 inline-block">
          ← Back to My Shops
        </Link>
      </div>
    );
  }

  const openStatus = getShopOpenStatus(shop.timings);

  // Compute unique categories
  const categoriesMap = new Map();
  products.forEach((p) => {
    const cat = p.productId?.category || 'Fertilizer';
    categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
  });
  const categoriesList = Array.from(categoriesMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Back Action & Delete Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/shopkeeper/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-teal-300 bg-[#06151a]/90 hover:bg-[#0c242c] border border-slate-700 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Shops
        </Link>

        <button
          type="button"
          onClick={() => setDeleteShopConfirmOpen(true)}
          className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06151a]/90 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Shop</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3.5 bg-emerald-950/70 text-emerald-300 rounded-2xl text-xs border border-emerald-500/40 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-950/70 text-rose-300 rounded-2xl text-xs border border-rose-800/60 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-white text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Hero Shop Card (Matching Photo 3) */}
      <div className="glass-card bg-[#06151a]/95 rounded-3xl p-5 sm:p-7 border border-slate-700/80 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Thumbnail with Change Photo Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto flex-1">
            <div className="relative w-full sm:w-56 h-40 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0 shadow-lg">
              <img
                src={shop.imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80'}
                alt={shop.shopName}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 bg-[#030b0e]/90 text-[10px] font-bold text-white px-2 py-0.5 rounded-lg border border-slate-700">
                <Camera className="w-2.5 h-2.5 text-teal-400" />
                Store Photo
              </span>
              <button
                type="button"
                onClick={() => setPhotoModalOpen(true)}
                className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-0.5 bg-[#030b0e]/90 hover:bg-teal-950 text-[10px] font-bold text-teal-300 hover:text-white px-2.5 py-0.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                Change →
              </button>
            </div>

            {/* Shop Details */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                  {shop.shopName}
                </h2>
                {/* Rating badge */}
                <div className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300 bg-[#030b0e] px-2.5 py-1 rounded-xl border border-slate-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Rating: {shop.ratingAverage ? shop.ratingAverage.toFixed(1) : '4.5'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({reviews.length || shop.ratingCount || 1})</span>
                </div>
              </div>

              {/* Location with inline edit trigger */}
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-teal-300">
                <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>{shop.location}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingHeader(!isEditingHeader)}
                  title="Edit Location & Address"
                  className="p-1 text-slate-400 hover:text-teal-300 rounded-lg hover:bg-[#0c242c] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Address */}
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {shop.address}
              </p>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${openStatus.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${openStatus.dotClass}`} />
                  {openStatus.label}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-[#030b0e] px-3 py-1 rounded-full border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  {openStatus.detail}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-700">
            <button
              type="button"
              onClick={() => setAddProductOpen(true)}
              className="px-5 py-3 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add New Product</span>
            </button>

            <Link
              to="/shopkeeper/products"
              className="px-5 py-2.5 bg-[#030b0e] hover:bg-[#081d24] text-teal-300 font-bold rounded-full text-xs sm:text-sm border border-teal-900/60 hover:border-teal-400/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4 text-teal-400" />
              <span>Go to Products Page →</span>
            </Link>
          </div>
        </div>

        {/* Inline Edit Header Form */}
        {isEditingHeader && (
          <div className="p-4 bg-[#030b0e] rounded-2xl border border-teal-500/40 space-y-3 animate-fade-in">
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              Edit Shop Branch Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  value={headerData.shopName}
                  onChange={(e) => setHeaderData({ ...headerData, shopName: e.target.value })}
                  placeholder="Shop Name"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Village / Town *
                </label>
                <input
                  type="text"
                  value={headerData.village}
                  onChange={(e) => setHeaderData({ ...headerData, village: e.target.value, location: e.target.value })}
                  placeholder="e.g. Anumullanka Village"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none font-semibold text-teal-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Mandal / Tehsil *
                </label>
                <input
                  type="text"
                  value={headerData.mandal}
                  onChange={(e) => setHeaderData({ ...headerData, mandal: e.target.value })}
                  placeholder="e.g. Gampalagudem"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  District *
                </label>
                <input
                  type="text"
                  value={headerData.district}
                  onChange={(e) => setHeaderData({ ...headerData, district: e.target.value })}
                  placeholder="e.g. NTR District"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={headerData.state || 'Andhra Pradesh'}
                  onChange={(e) => setHeaderData({ ...headerData, state: e.target.value })}
                  placeholder="e.g. Andhra Pradesh"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Specific Address (Landmark / Road / Door No.) *
              </label>
              <textarea
                rows={2}
                value={headerData.address}
                onChange={(e) => setHeaderData({ ...headerData, address: e.target.value })}
                placeholder="Specific Address"
                className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Contact Phone Number (10 Digits)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 top-2 text-xs font-bold text-teal-400 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={headerData.phone || ''}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setHeaderData({ ...headerData, phone: digits });
                    setError('');
                  }}
                  placeholder="98480 12345"
                  className="w-full pl-12 pr-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white font-mono rounded-xl outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-950/70 text-rose-300 rounded-xl text-xs border border-rose-800/60 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveHeader}
                className="px-4 py-1.5 btn-glow-primary text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" /> Save Details
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingHeader(false);
                  setError('');
                }}
                className="px-3 py-1.5 bg-[#06151a] hover:bg-[#0c242c] text-slate-300 border border-slate-700 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3 Stat Cards (Matching Photo 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Products */}
        <Link
          to="/shopkeeper/products"
          className="glass-card bg-[#06151a]/95 rounded-3xl p-5 border border-slate-700/80 hover:border-teal-400/80 transition-all shadow-lg flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#030b0e] border border-slate-700 flex items-center justify-center text-teal-400 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Products
              </span>
              <div className="text-xl font-black text-white">{products.length}</div>
              <span className="text-[11px] text-teal-300 font-semibold">Manage in Products Page</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 group-hover:text-teal-300 flex items-center gap-1 font-bold">
            View →
          </span>
        </Link>

        {/* Categories */}
        <div
          onClick={() => setCategoriesModalOpen(true)}
          className="glass-card bg-[#06151a]/95 rounded-3xl p-5 border border-slate-700/80 shadow-lg flex items-center justify-between gap-4 cursor-pointer hover:border-teal-400/80 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#030b0e] border border-slate-700 flex items-center justify-center text-teal-400 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Categories
              </span>
              <div className="text-xl font-black text-white">{categoriesList.length}</div>
              <span className="text-[11px] text-teal-300 font-semibold">Click to explore cards</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 group-hover:text-teal-300 flex items-center gap-1 font-bold">
            View All →
          </span>
        </div>

        {/* Shop Rating */}
        <div className="glass-card bg-[#06151a]/95 rounded-3xl p-5 border border-slate-700/80 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#030b0e] border border-slate-700 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Shop Rating
            </span>
            <div className="text-xl font-black text-white">
              {shop.ratingAverage ? shop.ratingAverage.toFixed(1) : '4.5'}
            </div>
            <span className="text-[11px] text-amber-300 font-semibold">
              From {reviews.length || shop.ratingCount || 1} reviews
            </span>
          </div>
        </div>
      </div>

      {/* About Shop & Shop Timings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* About Shop Card */}
        <div className="glass-card bg-[#06151a]/95 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-teal-400" />
              <span>About Shop</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingHeader(!isEditingHeader)}
              className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Edit Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Address Box */}
            <div className="p-3 bg-[#030b0e] rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Branch Address:</span>
              </span>
              <p className="text-sm font-semibold text-white leading-relaxed pl-5">
                {shop.address || `${shop.village || shop.location}, ${shop.mandal ? shop.mandal + ' Mandal, ' : ''}${shop.district || ''}, ${shop.state || 'Andhra Pradesh'}`}
              </p>
            </div>

            {/* Contact Phone Box */}
            <div className="flex items-center justify-between p-3 bg-[#030b0e] rounded-xl border border-slate-800">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Contact Phone:</span>
              </span>
              <span className="text-sm font-black text-white font-mono">
                {shop.phone || '+91 98480 00000'}
              </span>
            </div>
          </div>
        </div>

        {/* Shop Timings Card (Specific to this branch) */}
        <div className="glass-card bg-[#06151a]/95 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Shop Timings</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingTimings(!isEditingTimings)}
              className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditingTimings ? 'Close' : 'Edit Timings'}</span>
            </button>
          </div>

          {!isEditingTimings ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#030b0e] rounded-xl border border-slate-800">
                <span className="text-slate-400">Monday – Saturday:</span>
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  {timingsData.weekday}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#030b0e] rounded-xl border border-slate-800">
                <span className="text-slate-400">Sunday:</span>
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  {timingsData.sunday}
                </span>
              </div>
              {timingsData.note && (
                <div className="p-2.5 bg-[#030b0e] rounded-xl border border-slate-800 flex items-center gap-2 text-slate-400 text-[11px]">
                  <Info className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  <span>{timingsData.note}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Monday – Saturday Hours *
                </label>
                <input
                  type="text"
                  value={timingsData.weekday}
                  onChange={(e) => setTimingsData({ ...timingsData, weekday: e.target.value })}
                  placeholder="e.g. 7:30 AM - 8:00 PM"
                  className="w-full px-3 py-2 text-xs bg-[#030b0e] border border-slate-700 text-white rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Sunday Hours *
                </label>
                <input
                  type="text"
                  value={timingsData.sunday}
                  onChange={(e) => setTimingsData({ ...timingsData, sunday: e.target.value })}
                  placeholder="e.g. 7:30 AM - 1:00 PM"
                  className="w-full px-3 py-2 text-xs bg-[#030b0e] border border-slate-700 text-white rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Special Note
                </label>
                <input
                  type="text"
                  value={timingsData.note}
                  onChange={(e) => setTimingsData({ ...timingsData, note: e.target.value })}
                  placeholder="e.g. Timings may change on festival days"
                  className="w-full px-3 py-2 text-xs bg-[#030b0e] border border-slate-700 text-white rounded-xl outline-none"
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
                  className="px-3 py-1.5 bg-[#030b0e] hover:bg-[#0c242c] text-slate-300 border border-slate-700 rounded-xl text-xs cursor-pointer"
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

      {/* Categories Explorer Modal */}
      <CategoriesModal
        isOpen={categoriesModalOpen}
        onClose={() => setCategoriesModalOpen(false)}
        products={products}
        onSelectCategory={(cat) => {
          setCategoriesModalOpen(false);
          navigate(`/shopkeeper/products?category=${encodeURIComponent(cat)}`);
        }}
      />

      {/* Update Store Photo Modal */}
      <UpdateShopPhotoModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        currentImage={shop.imageUrl}
        onSavePhoto={handleSavePhoto}
      />

      {/* Delete Shop Confirmation Popup */}
      <ConfirmDialog
        isOpen={deleteShopConfirmOpen}
        onClose={() => setDeleteShopConfirmOpen(false)}
        onConfirm={handleConfirmDeleteShop}
        title="Delete Entire Shop Branch"
        message={`Are you sure you want to delete "${shop.shopName}"? All listed inventory and products under this branch will be permanently removed.`}
        confirmText="Yes, Delete Shop"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}
