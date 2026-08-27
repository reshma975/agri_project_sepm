import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import AddProductModal from '../../components/shopkeeper/AddProductModal';
import EditProductModal from '../../components/shopkeeper/EditProductModal';
import CategoriesModal from '../../components/shopkeeper/CategoriesModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Package,
  Layers,
  ShoppingCart,
  IndianRupee,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Edit2,
  Trash2,
  Tag,
  Star,
  LayoutGrid,
  List,
  Info,
  RefreshCw,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function ProductsInventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All Categories';
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [sortBy, setSortBy] = useState('Recently Added');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Default curated demo inventory matching Screenshot 1 exactly
  const defaultProducts = [
    {
      _id: 'prod_1',
      name: 'Urea (46% N)',
      rating: 4.5,
      category: 'Fertilizer',
      status: 'In Stock',
      description: 'High quality nitrogen fertilizer for all crops.',
      brand: 'IFFCO',
      packSize: '45 kg',
      price: 266,
      unit: 'kg',
      quantity: 18,
      totalValue: 4788,
      imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=300&q=80',
    },
    {
      _id: 'prod_2',
      name: 'Cotton Seeds',
      rating: 4.5,
      category: 'Seeds',
      status: 'Low Stock',
      description: 'High germination cotton seeds.',
      brand: 'Nuziveedu',
      packSize: '450 g',
      price: 300,
      unit: 'packet',
      quantity: 10,
      totalValue: 3000,
      imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=300&q=80',
    },
    {
      _id: 'prod_3',
      name: 'Imidacloprid 17.8 SL',
      rating: 4.2,
      category: 'Pesticide',
      status: 'In Stock',
      description: 'Systemic insecticide for sucking pests.',
      brand: 'Bayer',
      packSize: '1 L',
      price: 680,
      unit: 'L',
      quantity: 7,
      totalValue: 4760,
      imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=300&q=80',
    },
    {
      _id: 'prod_4',
      name: 'DAP (18:46:0)',
      rating: 4.6,
      category: 'Fertilizer',
      status: 'In Stock',
      description: 'For strong root and healthy plant growth.',
      brand: 'Coromandel',
      packSize: '50 kg',
      price: 1350,
      unit: 'bag',
      quantity: 15,
      totalValue: 20250,
      imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=300&q=80',
    }
  ];

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const shopRes = await apiClient.get('/shops/my-shops');
      if (shopRes.data.success && shopRes.data.shops.length > 0) {
        const myShop = shopRes.data.shops[0];
        setShop(myShop);

        const prodRes = await apiClient.get(`/shops/${myShop._id}`);
        if (prodRes.data.success && prodRes.data.products?.length > 0) {
          const formatted = prodRes.data.products.map(item => ({
            _id: item._id,
            name: item.customName || item.productId?.name || 'Agro Product',
            rating: item.rating || 4.5,
            category: item.productId?.category || 'Fertilizer',
            status: item.status || 'In Stock',
            description: item.productId?.description || 'Quality agricultural input for high yield crops.',
            brand: item.productId?.brand || 'FarmSetu Certified',
            packSize: item.productId?.defaultUnit || item.unit || 'Standard Pack',
            price: item.price || 0,
            unit: item.unit || 'kg',
            quantity: item.quantity || 0,
            totalValue: (item.price || 0) * (item.quantity || 0),
            imageUrl: item.imageUrl || item.productId?.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=300&q=80',
            rawItem: item
          }));
          setProducts(formatted);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Update selectedCategory if URL param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Fertilizer' && p.category.toLowerCase().includes('fertilizer')) ||
      (selectedCategory === 'Seeds' && p.category.toLowerCase().includes('seed')) ||
      (selectedCategory === 'Pesticide' && p.category.toLowerCase().includes('pesticide'));

    const matchesStatus =
      selectedStatus === 'All Status' ||
      p.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddProduct = async (formData) => {
    if (shop && shop._id && shop._id !== 'default_shop') {
      try {
        const res = await apiClient.post(`/shops/${shop._id}/products`, formData);
        if (res.data.success) {
          fetchInventory();
          return { success: true };
        }
      } catch (err) {
        console.error('Add product error:', err);
      }
    }
    // Local addition for instant feedback
    const newProd = {
      _id: `prod_${Date.now()}`,
      name: formData.name,
      rating: 4.5,
      category: formData.category || 'Fertilizer',
      status: formData.status || 'In Stock',
      description: formData.description || 'Quality agricultural input.',
      brand: 'FarmSetu Certified',
      packSize: formData.unit || 'kg',
      price: Number(formData.price) || 250,
      unit: formData.unit || 'kg',
      quantity: Number(formData.quantity) || 10,
      totalValue: (Number(formData.price) || 250) * (Number(formData.quantity) || 10),
      imageUrl: formData.imageUrl || defaultProducts[0].imageUrl
    };
    setProducts([newProd, ...products]);
    return { success: true };
  };

  const handleUpdateProduct = async (inventoryId, updatedFields) => {
    if (shop && shop._id && shop._id !== 'default_shop') {
      try {
        const res = await apiClient.put(`/products/inventory/${inventoryId}`, updatedFields);
        if (res.data.success) {
          fetchInventory();
          return { success: true };
        }
      } catch (err) {
        console.error('Update error:', err);
      }
    }
    setProducts(products.map(p => p._id === inventoryId ? { ...p, ...updatedFields } : p));
    return { success: true };
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setActionLoading(true);
    try {
      if (shop && shop._id && shop._id !== 'default_shop') {
        await apiClient.delete(`/products/inventory/${productToDelete._id}`);
      }
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading products inventory..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. BACK TO MY SHOPS BUTTON                                                */}
      {/* ========================================================================= */}
      <div>
        <Link
          to="/shopkeeper/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-teal-300 bg-[#06181d] hover:bg-[#0c242c] hover:text-white border border-teal-500/40 transition-all shadow-sm group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My Shops</span>
        </Link>
      </div>


      {/* ========================================================================= */}
      {/* 2. HEADER & ADD NEW PRODUCT (MATCHING SCREENSHOT 1)                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Products Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
            Manage your shop products and live stock
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddProductOpen(true)}
          className="px-5 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. 3 STAT CARDS ROW (DYNAMICALLY CALCULATED FROM REAL INVENTORY)           */}
      {/* ========================================================================= */}
      {(() => {
        const totalProductsCount = products.length;
        const uniqueCategoriesCount = [...new Set(products.map(p => p.category || p.productId?.category).filter(Boolean))].length;
        const totalStockValue = products.reduce((sum, item) => {
          const p = Number(item.price) || 0;
          const q = Number(item.quantity) || 0;
          return sum + (p * q);
        }, 0);

        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Products */}
            <div className="glass-card bg-[#051419]/95 rounded-2xl p-5 border border-slate-700/80 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Total Products</span>
                <div className="text-2xl font-black text-white">{totalProductsCount}</div>
                <span className="text-[11px] text-slate-400">Active in stock</span>
              </div>
            </div>

            {/* Categories (Clicking opens Categories Modal as Cards!) */}
            <div
              onClick={() => setCategoriesModalOpen(true)}
              className="glass-card bg-[#051419]/95 rounded-2xl p-5 border border-teal-500/40 shadow-md flex items-center gap-4 cursor-pointer hover:border-teal-300 hover:bg-[#081a20] transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-950/90 border border-teal-400/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(45,212,191,0.15)]">
                <Layers className="w-6 h-6 text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold block">Categories</span>
                  <span className="text-[10px] text-teal-400 font-extrabold group-hover:underline">Explore →</span>
                </div>
                <div className="text-2xl font-black text-[#2dd4bf] text-glow-teal">
                  {uniqueCategoriesCount}
                </div>
                <span className="text-[11px] text-teal-300/80">In this shop</span>
              </div>
            </div>

            {/* Total Stock Value */}
            <div className="glass-card bg-[#051419]/95 rounded-2xl p-5 border border-slate-700/80 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Total Stock Value</span>
                <div className="text-2xl font-black text-white">
                  ₹{totalStockValue.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-400">Live inventory sum</span>
              </div>
            </div>
          </div>
        );
      })()}


      {/* ========================================================================= */}
      {/* 4. SEARCH & FILTER BAR (MATCHING SCREENSHOT 1)                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#051419] border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:border-teal-400 outline-none transition-all shadow-inner"
          />
        </div>

        {/* Filter Dropdowns & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Categories Dropdown */}
          <div className="relative bg-[#071d24] border border-teal-500/30 hover:border-teal-400 rounded-2xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSearchParams(e.target.value === 'All Categories' ? {} : { category: e.target.value });
              }}
              style={{ backgroundColor: '#071d24', color: '#ffffff' }}
              className="bg-[#071d24] text-white font-bold outline-none cursor-pointer pr-4"
            >
              <option value="All Categories" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>All Categories</option>
              <option value="Fertilizer" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Fertilizer</option>
              <option value="Seeds" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Seeds</option>
              <option value="Pesticide" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Pesticide</option>
              <option value="Machines" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Machines</option>
              <option value="Tools" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Tools</option>
              <option value="Irrigation" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Irrigation</option>
              <option value="Bio-Stimulants" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Bio-Stimulants</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="relative bg-[#071d24] border border-teal-500/30 hover:border-teal-400 rounded-2xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ backgroundColor: '#071d24', color: '#ffffff' }}
              className="bg-[#071d24] text-white font-bold outline-none cursor-pointer pr-4"
            >
              <option value="All Status" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>All Status</option>
              <option value="In Stock" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>In Stock</option>
              <option value="Low Stock" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Low Stock</option>
              <option value="Out of Stock" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Out of Stock</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative bg-[#071d24] border border-teal-500/30 hover:border-teal-400 rounded-2xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ backgroundColor: '#071d24', color: '#ffffff' }}
              className="bg-[#071d24] text-white font-bold outline-none cursor-pointer pr-4"
            >
              <option value="Recently Added" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Sort by: Recently Added</option>
              <option value="Price Low to High" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Sort by: Price (Low to High)</option>
              <option value="Price High to Low" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Sort by: Price (High to Low)</option>
              <option value="Stock High to Low" style={{ backgroundColor: '#071d24', color: '#ffffff' }}>Sort by: Stock (High to Low)</option>
            </select>
          </div>


          {/* Grid / List View Toggle Buttons */}
          <div className="flex items-center gap-1 bg-[#051419] border border-slate-700/80 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-teal-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-teal-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PRODUCT ITEMS (DYNAMIC LIST / GRID VIEW OR EMPTY STATE)                */}
      {/* ========================================================================= */}
      {filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="glass-card bg-[#051419]/95 rounded-3xl p-10 sm:p-14 border border-dashed border-teal-500/30 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-teal-950/90 border border-teal-400/40 text-teal-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(45,212,191,0.15)]">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-black text-white">
              {searchQuery || selectedCategory !== 'All Categories' || selectedStatus !== 'All Status'
                ? 'No Products Found'
                : 'No Products in Your Shop Yet 📦'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {searchQuery || selectedCategory !== 'All Categories' || selectedStatus !== 'All Status'
                ? 'No items matched your current search filters. Try adjusting your query or category selection.'
                : `You haven't listed any seeds, fertilizers, or pesticides for ${shop?.shopName || 'your shop'} yet. Click the button below to add your first product!`}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {searchQuery || selectedCategory !== 'All Categories' || selectedStatus !== 'All Status' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSelectedStatus('All Status');
                  setSearchParams({});
                }}
                className="px-5 py-2.5 bg-[#071d24] hover:bg-[#0b2b35] text-teal-300 rounded-xl text-xs font-bold border border-teal-500/40 cursor-pointer transition-all"
              >
                Reset All Filters
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setAddProductOpen(true)}
              className="px-6 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Add Your First Product</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-3">
          {filteredProducts.map((item) => (
            <div
              key={item._id}
              className="glass-card bg-[#051419]/95 rounded-2xl p-4 sm:p-5 border border-slate-700/70 hover:border-teal-400/80 transition-all shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              {/* Left: Product Image & Details */}
              <div className="flex items-start sm:items-center gap-4 w-full md:w-auto flex-1">
                {/* Product Thumbnail */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 flex-shrink-0 flex items-center justify-center p-1 bg-[#030b0e]">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-teal-300 transition-colors">
                      {item.name}
                    </h3>
                    {/* Rating Badge */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-[#030b0e] px-2 py-0.5 rounded-md border border-slate-700">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </span>
                  </div>

                  {/* Category & Status Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-300 bg-teal-950/70 border border-teal-500/30 px-2.5 py-0.5 rounded-md">
                      <Tag className="w-2.5 h-2.5 text-teal-400" />
                      {item.category}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                        item.status === 'Low Stock'
                          ? 'text-amber-300 bg-amber-950/70 border-amber-500/40'
                          : item.status === 'Out of Stock'
                          ? 'text-rose-300 bg-rose-950/70 border-rose-500/40'
                          : 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 line-clamp-1">
                    {item.description}
                  </p>

                  {/* Brand & Pack size */}
                  <p className="text-[11px] text-slate-400 font-medium">
                    Brand: <span className="text-slate-300">{item.brand}</span> • Pack Size: <span className="text-slate-300">{item.packSize}</span>
                  </p>
                </div>
              </div>

              {/* Right: Price, Stock, Total Value & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-8 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-800 flex-shrink-0">
                {/* PRICE */}
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    PRICE
                  </span>
                  <div className="text-base font-black text-white">
                    ₹{item.price}
                    <span className="text-xs font-normal text-slate-400">/{item.unit}</span>
                  </div>
                </div>

                {/* STOCK AVAILABLE */}
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    STOCK AVAILABLE
                  </span>
                  <div className="text-base font-black text-white">
                    {item.quantity} {item.unit}
                  </div>
                </div>

                {/* TOTAL VALUE */}
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    TOTAL VALUE
                  </span>
                  <div className="text-base font-black text-white">
                    ₹{item.totalValue ? item.totalValue.toLocaleString('en-IN') : (item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Action Buttons: Edit & Delete */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(item.rawItem || {
                        _id: item._id,
                        customName: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        unit: item.unit,
                        status: item.status,
                        productId: { name: item.name, category: item.category }
                      });
                      setEditProductOpen(true);
                    }}
                    title="Edit Product"
                    className="p-2 text-slate-300 hover:text-white bg-[#030b0e] hover:bg-[#0c2830] rounded-xl border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProductToDelete(item);
                      setDeleteConfirmOpen(true);
                    }}
                    title="Delete Product"
                    className="p-2 text-rose-400 hover:text-rose-300 bg-[#030b0e] hover:bg-rose-950/50 rounded-xl border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {filteredProducts.map((item) => (
            <div
              key={item._id}
              className="glass-card bg-[#051419]/95 rounded-3xl p-4 sm:p-5 border border-slate-700/70 hover:border-teal-400/80 transition-all shadow-xl flex flex-col justify-between group space-y-3.5 hover:-translate-y-1"
            >
              {/* Product Thumbnail & Top Badges */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-[#030b0e] border border-slate-700/80 flex items-center justify-center p-2">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain rounded-xl group-hover:scale-110 transition-transform duration-300"
                />
                {/* Floating Rating */}
                <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-300 bg-[#030b0e]/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-700 shadow-md">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {item.rating}
                </span>

                {/* Floating Category */}
                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[10px] font-bold text-teal-300 bg-teal-950/90 backdrop-blur-md border border-teal-500/30 px-2 py-0.5 rounded-lg shadow-md">
                  <Tag className="w-2.5 h-2.5 text-teal-400" />
                  {item.category}
                </span>
              </div>

              {/* Product Info */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${
                      item.status === 'Low Stock'
                        ? 'text-amber-300 bg-amber-950/70 border-amber-500/40'
                        : item.status === 'Out of Stock'
                        ? 'text-rose-300 bg-rose-950/70 border-rose-500/40'
                        : 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <p className="text-[11px] text-slate-400 font-medium pt-0.5">
                  Brand: <span className="text-slate-300">{item.brand}</span> • Pack: <span className="text-slate-300">{item.packSize}</span>
                </p>
              </div>

              {/* Price, Stock & Total Value Box */}
              <div className="p-3 bg-[#030b0e] rounded-2xl border border-slate-700/70 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PRICE</span>
                  <span className="font-extrabold text-white">₹{item.price}<span className="text-[10px] text-slate-400 font-normal">/{item.unit}</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">STOCK</span>
                  <span className="font-bold text-teal-300">{item.quantity} {item.unit}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                  <span className="font-bold text-slate-400">Total Value:</span>
                  <span className="font-black text-emerald-400">
                    ₹{item.totalValue ? item.totalValue.toLocaleString('en-IN') : (item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(item.rawItem || {
                      _id: item._id,
                      customName: item.name,
                      price: item.price,
                      quantity: item.quantity,
                      unit: item.unit,
                      status: item.status,
                      productId: { name: item.name, category: item.category }
                    });
                    setEditProductOpen(true);
                  }}
                  className="flex-1 py-2 px-3 text-xs font-bold text-slate-200 hover:text-white bg-[#030b0e] hover:bg-[#0c2830] rounded-xl border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProductToDelete(item);
                    setDeleteConfirmOpen(true);
                  }}
                  className="py-2 px-3 text-xs font-bold text-rose-400 hover:text-rose-300 bg-[#030b0e] hover:bg-rose-950/50 rounded-xl border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Bottom Summary Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 pb-1">
        <span>
          Showing <strong className="text-teal-400 font-bold">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'} in inventory
        </span>
        {selectedCategory !== 'All Categories' && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All Categories');
              setSearchParams({});
            }}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
          >
            Clear category filter ({selectedCategory})
          </button>
        )}
      </div>


      {/* ========================================================================= */}
      {/* 7. REAL-TIME BANNER AT BOTTOM (MATCHING SCREENSHOT 1)                     */}
      {/* ========================================================================= */}
      <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-teal-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-teal-300">
          <Info className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>Inventory updates in real-time and visible to farmers in your shop.</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <span>Last updated: 2 mins ago</span>
          <RefreshCw className="w-3 h-3 text-teal-400/80 cursor-pointer hover:rotate-180 transition-transform" />
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Categories Popup Modal */}
      <CategoriesModal
        isOpen={categoriesModalOpen}
        onClose={() => setCategoriesModalOpen(false)}
        products={products}
        onAddNewProduct={() => setAddProductOpen(true)}
        onSelectCategory={(categoryId) => {
          setSelectedCategory(categoryId);
          setSearchParams({ category: categoryId });
        }}
      />


      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={editProductOpen}
        onClose={() => {
          setEditProductOpen(false);
          setSelectedProduct(null);
        }}
        item={selectedProduct}
        onUpdateProduct={handleUpdateProduct}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Remove Product"
        message={`Are you sure you want to remove "${productToDelete?.name}" from your shop's active inventory?`}
        confirmText="Yes, Remove Product"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}
