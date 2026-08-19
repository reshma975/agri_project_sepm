import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import {
  User,
  Phone,
  Mail,
  Store,
  KeyRound,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ShopkeeperProfilePage() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    businessName: user?.profile?.businessName || '',
    tradeLicenseNo: user?.profile?.tradeLicenseNo || '',
  });

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        businessName: user.profile?.businessName || '',
        tradeLicenseNo: user.profile?.tradeLicenseNo || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess('');
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const res = await updateProfile(formData);
    setLoading(false);

    if (res.success) {
      setSuccess('Shopkeeper profile saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.message || 'Failed to save profile');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link (Wireframe 1: Go back to dashboard) */}
      <Link
        to="/shopkeeper/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Go back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Store className="w-8 h-8 text-amber-600" />
          🏪 Shopkeeper Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Manage your merchant identity, contact numbers, and login security credentials.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-xs sm:text-sm border border-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs sm:text-sm border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form (Matches Wireframe 1 Profile Layout) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar (Wireframe 1) */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 shadow-sm flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500 font-medium">
                Authorized Dealer • @{user?.username}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              />
            </div>

            {/* Username (Fixed) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 outline-none cursor-not-allowed"
              />
            </div>

            {/* Gmail / Email (Wireframe 1) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gmail / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone No (Wireframe 1) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone No.
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Business / Primary Store Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Sri Lakshmi Agro Agencies"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              />
            </div>

            {/* Trade License */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trade License Number
              </label>
              <input
                type="text"
                name="tradeLicenseNo"
                value={formData.tradeLicenseNo}
                onChange={handleChange}
                placeholder="e.g. AP-VJA-TL-2023-9092"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Action Buttons (Wireframe 1: Change Password & Save button) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              Change Password (Sub-Form)
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Password change modal (Wireframe 1) */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}
