import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import UserAvatar from '../../components/common/UserAvatar';
import {
  User,
  Phone,
  Mail,
  MapPin,
  KeyRound,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Home
} from 'lucide-react';

export default function ShopkeeperProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    village: user?.profile?.village || '',
    mandal: user?.profile?.mandal || '',
    district: user?.profile?.district || 'Vijayawada',
    address: user?.profile?.address || '',
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
        village: user.profile?.village || '',
        mandal: user.profile?.mandal || '',
        district: user.profile?.district || 'Vijayawada',
        address: user.profile?.address || '',
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
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return setError('Please enter a valid 10-digit mobile number (e.g. 9876543210).');
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const res = await updateProfile(formData);
    setLoading(false);

    if (res.success) {
      setSuccess('Shopkeeper profile saved successfully! Redirecting...');
      setTimeout(() => {
        navigate('/shopkeeper/dashboard');
      }, 1200);
    } else {
      setError(res.message || 'Failed to save profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4 animate-fade-in">
      {/* Back Link */}
      <div>
        <Link
          to="/shopkeeper/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-teal-300 bg-[#06181d] hover:bg-[#0c242c] border border-teal-500/30 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#2dd4bf] text-glow-teal tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-teal-400" />
          <span>Shopkeeper Profile</span>
        </h1>
        <p className="text-xs text-slate-300 font-normal mt-0.5">
          Manage your merchant personal identity, residential address, and login credentials.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-950/60 text-emerald-300 rounded-xl text-xs border border-emerald-500/40 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/60 text-rose-300 rounded-xl text-xs border border-rose-800/60 flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form (Compact Dark Glass Theme) */}
      <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 sm:p-6 shadow-xl border border-teal-500/20">
        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Header */}
          <div className="flex items-center gap-3 pb-3.5 border-b border-teal-900/40">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-teal-950 border-2 border-teal-400/60 flex items-center justify-center flex-shrink-0 shadow-md">
              <UserAvatar user={user} showBadge={true} className="w-12 h-12" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{user?.name}</h3>
              <p className="text-[11px] text-teal-300 font-semibold">
                Authorized Agro Dealer • @{user?.username}
              </p>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Personal Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#030b0e] border border-teal-900/60 text-white rounded-xl focus:bg-[#041217] focus:border-teal-400 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all"
                />
              </div>

              {/* Username (Fixed & High Contrast White Text) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#020709] border border-teal-900/60 text-white font-bold rounded-xl outline-none cursor-not-allowed font-mono shadow-xs"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-teal-400/70 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#030b0e] border border-teal-900/60 text-white rounded-xl focus:bg-[#041217] focus:border-teal-400 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-teal-400/70 absolute left-3 top-2.5" />
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
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#030b0e] border border-teal-900/60 text-white rounded-xl focus:bg-[#041217] focus:border-teal-400 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Mandal */}
              <div>
                <label className="block text-[10px] font-bold text-teal-300 uppercase tracking-wider mb-1">
                  Mandal / Tehsil *
                </label>
                <input
                  type="text"
                  name="mandal"
                  value={formData.mandal}
                  onChange={handleChange}
                  placeholder="e.g. Tiruvuru"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#030b0e] border border-teal-500/40 text-white rounded-xl focus:bg-[#041217] focus:border-teal-400 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all font-semibold"
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. NTR District"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#030b0e] border border-teal-900/60 text-white rounded-xl focus:bg-[#041217] focus:border-teal-400 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Residential / Home Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Address (Residential / Home Address)
              </label>
              <textarea
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. D.No 4-12, Main Street, Kanumuru, Andhra Pradesh - 533215"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#030b0e] border border-teal-900/60 text-white rounded-xl focus:bg-[#041217] focus:border-teal-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3.5 border-t border-teal-900/40">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="w-full sm:w-auto px-3.5 py-2 bg-[#030b0e] hover:bg-[#081d24] text-teal-300 text-xs font-bold rounded-xl border border-teal-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-teal-400" />
              Change Password
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-full shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Saving...' : 'Save Profile'}
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
