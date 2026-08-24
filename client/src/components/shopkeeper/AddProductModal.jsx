import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { Tag, IndianRupee, Layers, Image as ImageIcon, AlertCircle, Upload, X, Check, Sparkles } from 'lucide-react';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    unit: 'kg',
    category: 'Fertilizer',
    status: 'In Stock',
    imageUrl: '',
    description: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const statuses = ['In Stock', 'Low Stock', 'Out of Stock', 'Full', 'Empty'];

  const samplePresets = [
    { label: '🌾 Urea Fertilizer', url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80' },
    { label: '🧪 Neem Oil / Pesticide', url: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80' },
    { label: '🌱 Certified Seeds', url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80' },
    { label: '🚜 Sprayer / Tools', url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      return setError('Image file exceeds 10MB limit.');
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // 6 Categories explicitly listed in Wireframe 2!
  const categories = [
    { value: 'Tools', label: '1) Tools (Simple)' },
    { value: 'Machines', label: '2) Machines (Big)' },
    { value: 'Fertilizer', label: '3) Fertilizer' },
    { value: 'Pesticide', label: '4) Pesticide' },
    { value: 'Seeds', label: '5) Seeds' },
    { value: 'Others', label: '6) Others (if any)' },
  ];

  const units = ['kg', 'Bag (45kg)', 'Bag (50kg)', 'Bag (25kg)', 'Packet', 'Litre', '500g Pack', 'Unit', 'Machine'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.quantity === '') {
      return setError('Please fill Product Name, Price, and Stock Quantity');
    }
    setShowConfirm(true);
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    setError('');
    const res = await onAddProduct(formData);
    setLoading(false);
    setShowConfirm(false);
    if (res.success) {
      setFormData({
        name: '',
        price: '',
        quantity: '',
        unit: 'kg',
        category: 'Fertilizer',
        status: 'In Stock',
        imageUrl: '',
        description: '',
      });
      onClose();
    } else {
      setError(res.message || 'Failed to add product');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="➕ Add Product to Inventory" maxWidth="max-w-lg">
        <form onSubmit={handlePreSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Neem Coated Urea / BPT Paddy Seeds"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category * (Wireframe 2)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Packaging Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Price (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-forest-600 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 267"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stock Quantity *
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Availability Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all font-semibold cursor-pointer"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Photo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Product Photo (Upload from Device or Select Preset)
            </label>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {formData.imageUrl ? (
              /* Image Preview Card */
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="Product Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Photo Attached</span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ready for display
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-bold text-forest-700 bg-white hover:bg-forest-50 border border-forest-300 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Upload Drag/Click Box */
              <div className="space-y-2.5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-slate-300 hover:border-forest-500 bg-slate-50 hover:bg-forest-50/40 rounded-2xl text-center cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-forest-600 mx-auto flex items-center justify-center border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to upload photo from your phone or computer
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WEBP (take photo or choose file)
                    </p>
                  </div>
                </div>

                {/* Sample Presets Quick Badges */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Quick Presets:
                  </span>
                  {samplePresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                      className="text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-forest-100 hover:text-forest-800 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 rounded-2xl transition-all shadow-md shadow-forest-200 cursor-pointer"
            >
              Add Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog (Wireframe 2: "Confirmation Popup") */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalConfirm}
        title="Confirm Adding Product"
        message={`Add "${formData.name}" at ₹${formData.price}/${formData.unit} (${formData.quantity} in stock) to shop?`}
        confirmText="Yes, Add Product"
        type="success"
        loading={loading}
      />
    </>
  );
}
