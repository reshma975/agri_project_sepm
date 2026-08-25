import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import ProductInventoryCard from '../../components/shopkeeper/ProductInventoryCard';
import AddProductModal from '../../components/shopkeeper/AddProductModal';
import EditProductModal from '../../components/shopkeeper/EditProductModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Store,
  MapPin,
  Star,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  Package,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ShopDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editable header state (Wireframe 1: Location - big font, Specific Add - small font)
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerData, setHeaderData] = useState({
    shopName: '',
    location: '',
    address: '',
  });

  // Modal states
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Delete product confirmation
  const [deleteProductConfirmOpen, setDeleteProductConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Delete shop confirmation
  const [deleteShopConfirmOpen, setDeleteShopConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/shops/${id}`);
      if (res.data.success) {
        setShop(res.data.shop);
        setProducts(res.data.products);
        setHeaderData({
          shopName: res.data.shop.shopName,
          location: res.data.shop.location,
          address: res.data.shop.address,
        });
      }
    } catch (err) {
      console.error('Error fetching shop details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, [id]);

  // Save Header edits (Location & Address)
  const handleSaveHeader = async () => {
    try {
      const res = await apiClient.put(`/shops/${id}`, headerData);
      if (res.data.success) {
        setShop(res.data.shop);
        setIsEditingHeader(false);
      }
    } catch (err) {
      console.error('Failed to update shop header:', err);
    }
  };

  // Add Product to shop
  const handleAddProduct = async (formData) => {
    try {
      const res = await apiClient.post(`/shops/${id}/products`, formData);
      if (res.data.success) {
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

  // Update Product
  const handleUpdateProduct = async (inventoryId, updatedFields) => {
    try {
      const res = await apiClient.put(`/products/inventory/${inventoryId}`, updatedFields);
      if (res.data.success) {
        fetchShopData();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update product',
      };
    }
  };

  // Quick Status change directly from dropdown
  const handleQuickStatusChange = async (item, newStatus) => {
    await handleUpdateProduct(item._id, { status: newStatus });
  };

  // Delete product confirmation
  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setActionLoading(true);
    try {
      const res = await apiClient.delete(`/products/inventory/${productToDelete._id}`);
      if (res.data.success) {
        fetchShopData();
        setDeleteProductConfirmOpen(false);
        setProductToDelete(null);
      }
    } catch (err) {
      console.error('Delete product error:', err);
    } finally {
      setActionLoading(false);
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
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading shop and inventory..." fullScreen />;
  }

  if (!shop) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-slate-500">Shop not found.</p>
        <Link to="/shopkeeper/dashboard" className="text-xs font-bold text-amber-700 mt-2 inline-block">
          ← Back to My Shops
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Back Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/shopkeeper/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-teal-300 bg-[#06151a]/90 hover:bg-[#0c242c] border border-slate-700 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Shops
        </Link>

        <button
          type="button"
          onClick={() => setDeleteShopConfirmOpen(true)}
          className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 p-2 rounded-xl bg-[#06151a]/90 hover:bg-rose-950/40 border border-slate-700 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Delete Shop
        </button>
      </div>

      {/* Shop Details Header */}
      <div className="glass-card bg-[#06151a]/90 rounded-3xl overflow-hidden border border-slate-700 shadow-xl">
        {/* Banner image */}
        <div className="relative h-60 w-full bg-slate-900">
          <img
            src={shop.imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1200&q=80'}
            alt={shop.shopName}
            className="w-full h-full object-cover"
          />
          {/* Rating Badge */}
          <div className="absolute top-4 right-4 bg-[#030b0e]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-extrabold text-white flex items-center gap-1.5 shadow-lg border border-slate-700">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Rating: {shop.ratingAverage?.toFixed(1) || '4.5'}</span>
            <span className="text-[10px] text-slate-400 font-normal">({shop.ratingCount || 12})</span>
          </div>
        </div>

        {/* Content & Edit triggers */}
        <div className="p-6 sm:p-8 bg-[#06151a]/95 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {!isEditingHeader ? (
            <div className="space-y-1.5 flex-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {shop.shopName}
              </h2>

              {/* Location */}
              <div className="flex items-center gap-2 text-lg sm:text-xl font-black text-teal-300">
                <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span>{shop.location}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingHeader(true)}
                  title="Edit Location & Address"
                  className="p-1 text-slate-400 hover:text-teal-300 rounded-lg hover:bg-[#0c242c] transition-colors text-xs cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Specific Address */}
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {shop.address}
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              <input
                type="text"
                value={headerData.shopName}
                onChange={(e) => setHeaderData({ ...headerData, shopName: e.target.value })}
                placeholder="Shop Name"
                className="w-full px-3 py-2 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-xl outline-none"
              />
              <input
                type="text"
                value={headerData.location}
                onChange={(e) => setHeaderData({ ...headerData, location: e.target.value })}
                placeholder="Location / City"
                className="w-full px-3 py-2 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-xl outline-none"
              />
              <textarea
                rows={2}
                value={headerData.address}
                onChange={(e) => setHeaderData({ ...headerData, address: e.target.value })}
                placeholder="Specific Address"
                className="w-full px-3 py-2 text-xs bg-[#030b0e] border border-slate-700 text-white rounded-xl outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveHeader}
                  className="px-4 py-1.5 btn-glow-primary text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Details
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingHeader(false)}
                  className="px-3 py-1.5 bg-[#030b0e] hover:bg-[#0c242c] text-slate-300 border border-slate-700 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add New Product Button */}
          <button
            type="button"
            onClick={() => setAddProductOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-full shadow-lg transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5 text-slate-950" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-400" />
            Products Inventory ({products.length})
          </h3>
          <span className="text-xs text-slate-300">
            Real-time stock statuses visible to farmers
          </span>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products in this shop yet"
            description="Add fertilizers, seeds, pesticides, or machinery to this shop branch."
            actionText="+ Add First Product"
            onAction={() => setAddProductOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {products.map((item) => (
              <ProductInventoryCard
                key={item._id}
                item={item}
                onEdit={(product) => {
                  setSelectedProduct(product);
                  setEditProductOpen(true);
                }}
                onDelete={(product) => {
                  setProductToDelete(product);
                  setDeleteProductConfirmOpen(true);
                }}
                onStatusChange={handleQuickStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal (Wireframe 2) */}
      <AddProductModal
        isOpen={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Edit Product Modal (Wireframe 2) */}
      <EditProductModal
        isOpen={editProductOpen}
        onClose={() => {
          setEditProductOpen(false);
          setSelectedProduct(null);
        }}
        item={selectedProduct}
        onUpdateProduct={handleUpdateProduct}
      />

      {/* Delete Product Confirmation Popup (Wireframe 2: "Give a confirmation popup and delete this") */}
      <ConfirmDialog
        isOpen={deleteProductConfirmOpen}
        onClose={() => setDeleteProductConfirmOpen(false)}
        onConfirm={handleConfirmDeleteProduct}
        title="Confirm Product Deletion"
        message={`Are you sure you want to remove "${
          productToDelete?.customName || productToDelete?.productId?.name
        }" from this shop's inventory?`}
        confirmText="Yes, Delete Product"
        type="danger"
        loading={actionLoading}
      />

      {/* Delete Shop Confirmation Popup */}
      <ConfirmDialog
        isOpen={deleteShopConfirmOpen}
        onClose={() => setDeleteShopConfirmOpen(false)}
        onConfirm={handleConfirmDeleteShop}
        title="Delete Entire Shop"
        message={`Are you sure you want to delete "${shop.shopName}"? All listed inventory and products under this branch will be permanently removed.`}
        confirmText="Yes, Delete Shop"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}
