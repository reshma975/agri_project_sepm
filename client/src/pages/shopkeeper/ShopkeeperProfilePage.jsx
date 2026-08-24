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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/shopkeeper/dashboard"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-teal-300 bg-[#06181d] hover:bg-[#0c242c] border border-teal-500/30 transition-all shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2dd4bf] text-glow-teal tracking-tight flex items-center gap-2">
          <Store className="w-7 h-7 text-teal-400" />
          <span>Shopkeeper Profile 🏪</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
          Manage your merchant identity, contact numbers, and login security credentials.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/60 text-emerald-300 rounded-2xl text-xs sm:text-sm border border-emerald-500/40 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 text-rose-300 rounded-2xl text-xs sm:text-sm border border-rose-800/60 flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form (Dark Glass Theme) */}
      <div className="glass-card bg-[#06151a]/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/20">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4 pb-5 border-b border-teal-900/40">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-teal-950 border-2 border-teal-400/60 flex items-center justify-center text-teal-300 shadow-md flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">{user?.name}</h3>
              <p className="text-xs text-teal-300 font-semibold">
                Authorized Dealer • @{user?.username}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
              />
            </div>

            {/* Username (Fixed) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-sm bg-[#020709] border border-teal-950 text-slate-500 rounded-2xl outline-none cursor-not-allowed font-mono"
              />
            </div>

            {/* Gmail / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Gmail / Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone No */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone No. *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Business / Primary Store Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Sri Venkateswara Seeds & Fertilisers"
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Trade License */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Trade License Number
              </label>
              <input
                type="text"
                name="tradeLicenseNo"
                value={formData.tradeLicenseNo}
                onChange={handleChange}
                placeholder="e.g. AP-VJA-TL-2023-9092"
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-teal-900/40">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#030b0e] hover:bg-[#081d24] text-teal-300 text-xs font-bold rounded-2xl border border-teal-900/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-teal-400" />
              Change Password
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-full shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Password change modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}
