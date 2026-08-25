import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import StatusBadge from '../../components/common/StatusBadge';
import UserAvatar from '../../components/common/UserAvatar';
import {
  User,
  Phone,
  Mail,
  MapPin,
  LandPlot,
  ShieldCheck,
  KeyRound,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function FarmerProfilePage() {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    village: '',
    mandal: '',
    district: '',
    state: '',
    address: '',
    totalLandArea: 0,
  });

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiClient.get('/farmers/profile');
        if (res.data.success) {
          setProfileData(res.data.profile);
          setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            email: user?.email || '',
            village: res.data.profile?.village || '',
            mandal: res.data.profile?.mandal || '',
            district: res.data.profile?.district || 'Vijayawada',
            state: res.data.profile?.state || 'Andhra Pradesh',
            address: res.data.profile?.address || '',
            totalLandArea: res.data.profile?.totalLandArea || 0,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
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
      setSuccess('Profile details saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.message || 'Failed to save profile');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/farmer/dashboard"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-teal-300 bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 transition-all shadow-2xs cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            👨‍🌾 Farmer Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            Your unique government digital farmer registration identity and land records.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 bg-[#030b0e] px-4 py-2 rounded-2xl border border-slate-700 shadow-xs">
          <span className="text-xs text-slate-300 font-semibold">Verification:</span>
          <StatusBadge status={profileData?.registrationStatus || 'VERIFIED'} />
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/60 text-emerald-300 rounded-2xl text-xs sm:text-sm border border-emerald-800/60 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 text-rose-300 rounded-2xl text-xs sm:text-sm border border-rose-800/60 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="bg-[#06151a]/95 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar & System ID */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#030b0e] border-2 border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <UserAvatar user={user} showBadge={true} className="w-16 h-16" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">{user?.name}</h3>
              <p className="text-xs font-mono font-bold text-teal-300 bg-[#030b0e] px-2.5 py-0.5 rounded-lg border border-slate-700 inline-block mt-0.5">
                Farmer ID: {profileData?.farmerId || 'FMR000123'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
              />
            </div>

            {/* Username (Fixed) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e]/50 border border-slate-700 rounded-2xl text-slate-500 outline-none cursor-not-allowed"
              />
            </div>

            {/* Phone No */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Mobile Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. farmer@example.com (Optional)"
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Total Land Area */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Land Holding (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                name="totalLandArea"
                value={formData.totalLandArea}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
              />
            </div>

            {/* Village & Mandal */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Village / Town
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                District & State
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
              />
            </div>

            {/* Specific Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Residential Address
              </label>
              <textarea
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete residential street / village address"
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#030b0e] hover:bg-[#0c242c] text-slate-300 hover:text-white border border-slate-700 text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-teal-400" />
              Change Password
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Modal (Wireframe 1 & 5) */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}
