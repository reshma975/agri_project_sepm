import React, { useState } from 'react';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { Store, MapPin, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function AddShopModal({ isOpen, onClose, onAddShop }) {
  const [formData, setFormData] = useState({
    shopName: '',
    location: '',
    address: '',
    imageUrl: '',
    phone: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!formData.shopName || !formData.location || !formData.address) {
      return setError('Please fill all required fields');
    }
    // Open confirmation popup as requested in wireframe 2
    setShowConfirm(true);
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    setError('');
    const res = await onAddShop(formData);
    setLoading(false);
    setShowConfirm(false);
    if (res.success) {
      setFormData({ shopName: '', location: '', address: '', imageUrl: '', phone: '' });
      onClose();
    } else {
      setError(res.message || 'Failed to create shop');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="➕ Add New Agricultural Shop" maxWidth="max-w-lg">
        <form onSubmit={handlePreSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Shop Name *
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="e.g. Sri Venkateswara Fertilizers & Seeds"
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / City *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-forest-600 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Vijayawada / Guntur"
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Address *
            </label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Shop No. 5, Opposite Rythu Seva Center, Main Road"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Shop Banner Image URL (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/... or leave empty for default"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98480 00000"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
            />
          </div>

          {/* Action Buttons (Wireframe 2: Add with confirmation popup, Cancel) */}
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
              Add Shop
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog (Wireframe 2: "Confirmation Popup") */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalConfirm}
        title="Confirm Adding New Shop"
        message={`Are you sure you want to register "${formData.shopName}" at ${formData.location}?`}
        confirmText="Yes, Create Shop"
        type="success"
        loading={loading}
      />
    </>
  );
}
