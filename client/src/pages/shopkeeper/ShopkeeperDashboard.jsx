import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import AddShopModal from '../../components/shopkeeper/AddShopModal';
import AddProductModal from '../../components/shopkeeper/AddProductModal';
import UpdateShopPhotoModal from '../../components/shopkeeper/UpdateShopPhotoModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Store,
  MapPin,
  Star,
  Plus,
  Package,
  Clock,
  ArrowRight,
  Camera,
  Trash2,
  AlertCircle,
  CheckCircle2,
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

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [addShopOpen, setAddShopOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [shopForAddProduct, setShopForAddProduct] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [shopForPhoto, setShopForPhoto] = useState(null);

  // Delete shop confirmation
  const [deleteShopConfirmOpen, setDeleteShopConfirmOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyShops = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/shops/my-shops');
      if (res.data.success) {
        setShops(res.data.shops || []);
      }
    } catch (err) {
      console.error('Error loading shopkeeper shops:', err);
      setError('Failed to load your shop branches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShops();
  }, [user]);

  // Handle Add New Shop
  const handleAddShop = async (formData) => {
    try {
      const res = await apiClient.post('/shops', formData);
      if (res.data.success) {
        setSuccess(`"${formData.shopName}" branch created successfully!`);
        await fetchMyShops();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to create shop branch',
      };
    }
  };

  // Handle Add Product to a specific shop
  const handleAddProduct = async (formData) => {
    if (!shopForAddProduct) return { success: false, message: 'No shop selected' };
    try {
      const res = await apiClient.post(`/shops/${shopForAddProduct._id}/products`, formData);
      if (res.data.success) {
        setSuccess(`Product added to "${shopForAddProduct.shopName}" successfully!`);
        await fetchMyShops();
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

  // Handle Save Photo for a specific shop
  const handleSavePhoto = async (newImageUrl) => {
    if (!shopForPhoto) return { success: false };
    try {
      const res = await apiClient.put(`/shops/${shopForPhoto._id}`, { imageUrl: newImageUrl });
      if (res.data.success) {
        setShops((prev) =>
          prev.map((s) => (s._id === shopForPhoto._id ? { ...s, imageUrl: newImageUrl } : s))
        );
        return { success: true };
      }
      return { success: false, message: 'Failed to update photo' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error updating photo' };
    }
  };

  // Handle Confirm Delete Shop
  const handleConfirmDeleteShop = async () => {
    if (!shopToDelete) return;
    setActionLoading(true);
    try {
      const res = await apiClient.delete(`/shops/${shopToDelete._id}`);
      if (res.data.success) {
        setSuccess(`Shop branch "${shopToDelete.shopName}" and its inventory have been removed.`);
        setShops((prev) => prev.filter((s) => s._id !== shopToDelete._id));
        setDeleteShopConfirmOpen(false);
        setShopToDelete(null);
      }
    } catch (err) {
      console.error('Delete shop error:', err);
      setError(err.response?.data?.message || 'Failed to delete shop');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your agricultural shops and stocks..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Header & Add Shop Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-700/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2dd4bf] text-glow-teal tracking-tight flex items-center gap-2.5">
            <Store className="w-7 h-7 text-teal-400" />
            <span>My Agricultural Shops & Stock</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
            Manage all your authorized agro retail stores, product stocks, and branch operating hours.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddShopOpen(true)}
          className="px-5 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-full shadow-lg transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Add New Shop / Branch</span>
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

      {/* Shops List Grid */}
      {shops.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No Shop Branches Registered Yet"
          description="Register your first agricultural shop branch to start adding fertilizers, seeds, pesticides, and machinery inventory."
          actionText="Register Your First Shop"
          onAction={() => setAddShopOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300 px-1">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Your Active Shop Branches ({shops.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Click on any shop card to view detailed inventory & timings
            </span>
          </div>

          <div className="space-y-4">
            {shops.map((shop) => {
              const openStatus = getShopOpenStatus(shop.timings);
              return (
                <div
                  key={shop._id}
                  className="glass-card bg-[#06151a]/95 rounded-3xl p-5 sm:p-6 border border-slate-700/80 hover:border-teal-400/80 transition-all shadow-xl space-y-4 group"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    {/* Left: Store Image & Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto flex-1">
                      {/* Thumbnail with Store Photo badge and Change button */}
                      <div className="relative w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                        <img
                          src={shop.imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80'}
                          alt={shop.shopName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-[#030b0e]/90 text-[10px] font-bold text-white px-2 py-0.5 rounded-lg border border-slate-700">
                          <Camera className="w-2.5 h-2.5 text-teal-400" />
                          Store Photo
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShopForPhoto(shop);
                            setPhotoModalOpen(true);
                          }}
                          className="absolute bottom-2 right-2 inline-flex items-center gap-0.5 bg-[#030b0e]/90 hover:bg-teal-950 text-[10px] font-bold text-teal-300 hover:text-white px-2 py-0.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                        >
                          Change →
                        </button>
                      </div>

                      {/* Shop Info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3
                            onClick={() => navigate(`/shopkeeper/shops/${shop._id}`)}
                            className="text-lg sm:text-xl font-black text-white hover:text-teal-300 transition-colors cursor-pointer line-clamp-1"
                          >
                            {shop.shopName}
                          </h3>
                          {/* Rating badge */}
                          <div className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300 bg-[#030b0e] px-2.5 py-1 rounded-xl border border-slate-700">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>Rating: {shop.ratingAverage ? shop.ratingAverage.toFixed(1) : '4.5'}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({shop.ratingCount || 1})</span>
                          </div>
                        </div>

                        {/* Location & Address */}
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-teal-300">
                            <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                            <span>{shop.location}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-1">
                            {shop.address}
                          </p>
                        </div>

                        {/* Status Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${openStatus.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${openStatus.dotClass}`} />
                            {openStatus.label}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-[#030b0e] px-2.5 py-0.5 rounded-full border border-slate-700">
                            <Clock className="w-3 h-3 text-teal-400" />
                            {openStatus.detail}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-[#030b0e] px-2.5 py-0.5 rounded-full border border-slate-700">
                            <Package className="w-3 h-3 text-teal-400" />
                            {shop.productCount !== undefined ? `${shop.productCount} Products` : 'Stock Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-700">
                      <button
                        type="button"
                        onClick={() => navigate(`/shopkeeper/shops/${shop._id}`)}
                        className="px-5 py-2.5 btn-glow-primary text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer hover:scale-105 transition-all"
                      >
                        <span>Manage Shop Branch</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShopToDelete(shop);
                          setDeleteShopConfirmOpen(true);
                        }}
                        className="px-4 py-2 bg-[#030b0e] hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 font-bold rounded-xl text-xs border border-slate-700 hover:border-rose-500/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Shop</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Shop Modal */}
      <AddShopModal
        isOpen={addShopOpen}
        onClose={() => setAddShopOpen(false)}
        onAddShop={handleAddShop}
      />

      {/* Add Product Modal for a specific shop */}
      <AddProductModal
        isOpen={addProductOpen}
        onClose={() => {
          setAddProductOpen(false);
          setShopForAddProduct(null);
        }}
        onAddProduct={handleAddProduct}
      />

      {/* Update Photo Modal */}
      <UpdateShopPhotoModal
        isOpen={photoModalOpen}
        onClose={() => {
          setPhotoModalOpen(false);
          setShopForPhoto(null);
        }}
        currentImage={shopForPhoto?.imageUrl}
        onSavePhoto={handleSavePhoto}
      />

      {/* Delete Shop Confirmation Popup */}
      <ConfirmDialog
        isOpen={deleteShopConfirmOpen}
        onClose={() => {
          setDeleteShopConfirmOpen(false);
          setShopToDelete(null);
        }}
        onConfirm={handleConfirmDeleteShop}
        title="Delete Entire Shop Branch"
        message={`Are you sure you want to remove "${shopToDelete?.shopName}"? All listed inventory and products under this branch will be permanently removed.`}
        confirmText="Yes, Delete Shop"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}
