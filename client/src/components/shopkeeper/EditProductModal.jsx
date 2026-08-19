import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Tag, IndianRupee, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EditProductModal({ isOpen, onClose, item, onUpdateProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    unit: 'kg',
    category: 'Fertilizer',
    status: 'In Stock',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.customName || item.productId?.name || '',
        price: item.price || '',
        quantity: item.quantity !== undefined ? item.quantity : '',
        unit: item.unit || item.productId?.defaultUnit || 'kg',
        category: item.productId?.category || 'Fertilizer',
        status: item.status || 'In Stock',
      });
    }
  }, [item]);

  const categories = [
    { value: 'Tools', label: '1) Tools (Simple)' },
    { value: 'Machines', label: '2) Machines (Big)' },
    { value: 'Fertilizer', label: '3) Fertilizer' },
    { value: 'Pesticide', label: '4) Pesticide' },
    { value: 'Seeds', label: '5) Seeds' },
    { value: 'Others', label: '6) Others (if any)' },
  ];

  const statuses = ['Full', 'In Stock', 'Low Stock', 'Out of Stock', 'Empty'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await onUpdateProduct(item._id, formData);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Failed to update product');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Edit Product Details" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Stock Status (Dropdown)
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all font-semibold"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Price (₹)
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-forest-600 absolute left-3.5 top-3.5" />
              <input
                type="number"
                name="price"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Stock Quantity
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="number"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>
          </div>
        </div>

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
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 rounded-2xl transition-all shadow-md shadow-forest-200 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
