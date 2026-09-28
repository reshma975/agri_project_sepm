import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { Store, MapPin, Phone, AlertCircle, Upload, X, Check, Sparkles, Building, Compass } from 'lucide-react';

export default function AddShopModal({ isOpen, onClose, onAddShop }) {
  const [formData, setFormData] = useState({
    shopName: '',
    village: '',
    mandal: '',
    district: 'Vijayawada',
    state: 'Andhra Pradesh',
    address: '',
    imageUrl: '',
    phone: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const shopPresets = [
    { label: '🏪 Modern Agro Center', url: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80' },
    { label: '🌾 Fertilizer Depot', url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80' },
    { label: '🌱 Seed & Nursery Outlet', url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80' }
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!formData.shopName || !formData.village || !formData.mandal || !formData.address) {
      return setError('Please fill all required fields (Shop Name, Village, Mandal, and Address)');
    }

    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length > 0) {
      if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        return setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g. 9848012345).');
      }
    }

    setShowConfirm(true);
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    setError('');

    const cleanLocation = formData.village.trim();
    const fullAddress = formData.address.includes(cleanLocation)
      ? formData.address
      : `${formData.address.trim()}, ${cleanLocation ? cleanLocation + ', ' : ''}${formData.mandal ? formData.mandal.trim() + ' Mandal, ' : ''}${formData.district ? formData.district.trim() + ', ' : ''}${formData.state || 'Andhra Pradesh'}`;

    const payload = {
      shopName: formData.shopName.trim(),
      village: cleanLocation,
      mandal: formData.mandal.trim(),
      district: formData.district.trim(),
      state: formData.state.trim() || 'Andhra Pradesh',
      location: cleanLocation,
      address: fullAddress,
      phone: formData.phone.trim(),
      imageUrl: formData.imageUrl,
    };

    const res = await onAddShop(payload);
    setLoading(false);
    setShowConfirm(false);
    if (res.success) {
      setFormData({
        shopName: '',
        village: '',
        mandal: '',
        district: 'Vijayawada',
        state: 'Andhra Pradesh',
        address: '',
        imageUrl: '',
        phone: '',
      });
      onClose();
    } else {
      setError(res.message || 'Failed to create shop');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="➕ Add New Agricultural Shop Branch" maxWidth="max-w-lg">
        <form onSubmit={handlePreSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 text-rose-300 rounded-xl text-xs border border-rose-800/60 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Shop Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Shop Name *
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="e.g. Mahi Seeds and Pests"
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* 2-Column Grid: Village & Mandal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Village / Town */}
            <div>
              <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-1.5">
                Village / Town *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="e.g. Anumullanka Village"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-500/40 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500 font-semibold"
                />
              </div>
            </div>

            {/* Mandal / Tehsil */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Mandal / Tehsil *
              </label>
              <div className="relative">
                <Compass className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="mandal"
                  value={formData.mandal}
                  onChange={handleChange}
                  placeholder="e.g. Gampalagudem"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* 2-Column Grid: District & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                District *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. NTR District / Vijayawada"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Andhra Pradesh"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Specific Address */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Specific Address (Landmark / Road / Door No.) *
            </label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Shop No. 5, Opposite Rythu Seva Center, Main Road"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Contact Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contact Phone Number (10 Digits)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-teal-400 select-none">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                maxLength={10}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: digits });
                  setError('');
                }}
                placeholder="98480 12345"
                className="w-full pl-14 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white font-mono rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
            {formData.phone && formData.phone.length > 0 && (
              <p className="text-[10px] mt-1 text-slate-400">
                {formData.phone.length === 10 && /^[6-9]\d{9}$/.test(formData.phone) ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    ✓ Valid 10-digit mobile number
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">
                    Must be 10 digits starting with 6, 7, 8, or 9 ({formData.phone.length}/10 digits entered)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Shop Photo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Shop Storefront Photo (Upload from Device or Select Preset)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {formData.imageUrl ? (
              <div className="flex items-center justify-between p-3 bg-[#030b0e] rounded-2xl border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="Shop Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Photo Attached</span>
                    <span className="text-[11px] text-teal-300 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-teal-400" /> Ready for display
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-bold text-teal-300 bg-[#06181d] hover:bg-[#0c242c] border border-slate-700 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-slate-700 hover:border-teal-400 bg-[#030b0e] hover:bg-[#05151c] rounded-2xl text-center cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#06151a] text-teal-400 mx-auto flex items-center justify-center border border-slate-700 shadow-xs group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Click to upload shop photo from phone or computer
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WEBP
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Quick Presets:
                  </span>
                  {shopPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                      className="text-[11px] font-semibold text-slate-300 bg-[#030b0e] hover:bg-[#0c242c] hover:text-teal-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white bg-[#030b0e] hover:bg-[#07171d] border border-slate-700 rounded-2xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-black text-slate-950 btn-glow-primary rounded-full transition-all shadow-md cursor-pointer"
            >
              Add Shop
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalConfirm}
        title="Confirm Adding New Shop Branch"
        message={`Are you sure you want to register "${formData.shopName}" located at ${formData.village}, ${formData.mandal} Mandal, ${formData.district}?`}
        confirmText="Yes, Create Shop"
        type="success"
        loading={loading}
      />
    </>
  );
}
