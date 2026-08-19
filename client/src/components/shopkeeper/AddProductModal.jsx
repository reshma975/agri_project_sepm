import React, { useState } from 'react';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { Tag, IndianRupee, Layers, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    unit: 'kg',
    category: 'Fertilizer',
    imageUrl: '',
    description: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
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
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Image URL (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/... or leave blank"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Action buttons (Wireframe 2: Add with confirmation popup, Cancel) */}
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
              className="px-6 py-2.5 text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 rounded-2xl transition-all shadow-md shadow-forest-200"
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
