import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import { Camera, Upload, Image as ImageIcon, Sparkles, Check, AlertCircle, RefreshCw, X } from 'lucide-react';

export default function UpdateShopPhotoModal({ isOpen, onClose, currentImageUrl, onSavePhoto }) {
  const [selectedImage, setSelectedImage] = useState(currentImageUrl || '');
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const presets = [
    {
      label: '🌱 Seeds & Agro Inputs',
      url: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: '🌾 Farm Mart & Supplies',
      url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: '🧪 Fertilizer & Pesticides Depot',
      url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: '🚜 Agricultural Equipment Store',
      url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return setError('Image file exceeds 10MB limit.');
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    setSelectedImage(customUrl.trim());
    setCustomUrl('');
    setError('');
  };

  const handleSave = async () => {
    if (!selectedImage) {
      return setError('Please select or upload an image first.');
    }

    setLoading(true);
    setError('');
    try {
      const res = await onSavePhoto(selectedImage);
      if (res?.success) {
        onClose();
      } else {
        setError(res?.message || 'Failed to update storefront photo.');
      }
    } catch (err) {
      setError('An error occurred while saving the photo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📸 Update Storefront Photo" maxWidth="max-w-lg">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-950/60 text-rose-300 rounded-xl text-xs border border-rose-800/60 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Preview */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Current Photo Preview
          </label>
          <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-900 border-2 border-teal-500/40 shadow-inner group">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80'}
              alt="Storefront Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5 bg-[#030b0e]/90 px-2.5 py-1 rounded-full border border-teal-500/30">
                <Check className="w-3.5 h-3.5 text-teal-400" /> Active Preview
              </span>
            </div>
          </div>
        </div>

        {/* Method 1: Upload from Device */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 bg-[#030b0e] hover:bg-[#06181d] border-2 border-dashed border-teal-500/50 hover:border-teal-400 rounded-2xl transition-all flex items-center justify-center gap-2 text-teal-300 font-bold text-xs sm:text-sm cursor-pointer shadow-sm group"
          >
            <Upload className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
            <span>Upload Photo from Device (JPG, PNG, WEBP)</span>
          </button>
        </div>

        {/* Method 2: Curated Agro Store Presets */}
        <div className="space-y-2 pt-2 border-t border-teal-900/40">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Or Choose a Storefront Preset:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(preset.url)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                  selectedImage === preset.url
                    ? 'bg-[#062028] border-teal-400 text-teal-200 ring-1 ring-teal-400/40 shadow-sm'
                    : 'bg-[#030b0e] border-slate-700/80 text-slate-300 hover:border-teal-500/50 hover:bg-[#06151a]'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-700"
                />
                <span className="text-[11px] font-bold truncate leading-tight">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Method 3: Paste Direct URL */}
        <div className="space-y-1.5 pt-2 border-t border-teal-900/40">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Or Paste Online Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/store-photo.jpg"
              className="flex-1 px-3 py-2 text-xs bg-[#030b0e] border border-teal-900/60 text-white rounded-xl focus:border-teal-400 outline-none"
            />
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              className="px-3 py-2 bg-[#06181d] hover:bg-[#0c2830] text-teal-300 border border-teal-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-teal-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#030b0e] hover:bg-[#06181d] text-slate-300 rounded-full text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 btn-glow-primary text-slate-950 rounded-full text-xs font-black shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{loading ? 'Saving Photo...' : 'Save Storefront Photo'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
