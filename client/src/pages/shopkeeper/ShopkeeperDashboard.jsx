import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import ShopCard from '../../components/shopkeeper/ShopCard';
import AddShopModal from '../../components/shopkeeper/AddShopModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Store, Plus, Filter, MapPin, Sparkles } from 'lucide-react';

export default function ShopkeeperDashboard() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('All');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();

  const locations = ['All', 'Vijayawada', 'Guntur', 'Mangalagiri'];

  const fetchMyShops = async () => {
    try {
      setLoading(true);
      const params = {};
      if (locationFilter !== 'All') params.location = locationFilter;

      const res = await apiClient.get('/shops/my-shops', { params });
      if (res.data.success) {
        setShops(res.data.shops);
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShops();
  }, [locationFilter]);

  const handleAddShop = async (formData) => {
    try {
      const res = await apiClient.post('/shops', formData);
      if (res.data.success) {
        fetchMyShops();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to create shop',
      };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar (Wireframe 1: My Shops + Filter + Add New Shop button) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-8 h-8 text-amber-600" />
            My Shops 🏪
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Manage your registered fertilizer, seed, and farm machinery store branches.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Location Filter Dropdown (Wireframe 1: "Filter to filter based on location") */}
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'All' ? 'All Locations' : loc}
                </option>
              ))}
            </select>
          </div>

          {/* Add New Shop Button (Wireframe 1: (+) Add New Shop) */}
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-amber-200 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Shop</span>
          </button>
        </div>
      </div>

      {/* Shops Grid */}
      {loading ? (
        <LoadingSpinner message="Loading your shops..." />
      ) : shops.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No shops registered yet"
          description="Register your first agricultural shop branch to start adding fertilizers, seeds, and equipment."
          actionText="+ Add First Shop"
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard
              key={shop._id}
              shop={shop}
              onClick={() => navigate(`/shopkeeper/shops/${shop._id}`)}
            />
          ))}
        </div>
      )}

      {/* Add New Shop Modal (Wireframe 2) */}
      <AddShopModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddShop={handleAddShop}
      />
    </div>
  );
}
