import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import StatusBadge from '../../components/common/StatusBadge';
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
      {/* Back button (Wireframe 5) */}
      <Link
        to="/farmer/dashboard"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200/80 transition-all shadow-2xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            👨‍🌾 Farmer Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Your unique government digital farmer registration identity and land records.
          </p>
        </div>

        {/* Status Indicator (Wireframe 5: Red Unverified / Yellow Under Verification / Green Verified) */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Verification:</span>
          <StatusBadge status={profileData?.registrationStatus || 'VERIFIED'} />
        </div>
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

      {/* Profile Form Card (Matches Wireframe 5) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar & System ID */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-forest-100 border-2 border-forest-300 flex items-center justify-center text-forest-700 shadow-sm flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">{user?.name}</h3>
              {/* Unique Identifier given by govt (Wireframe 5) */}
              <p className="text-xs font-mono font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-lg border border-forest-200 inline-block mt-0.5">
                Farmer ID: {profileData?.farmerId || 'FMR000123'}
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
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
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

            {/* Phone No */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. farmer@example.com (Optional)"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>

            {/* Total Land Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Land Holding (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                name="totalLandArea"
                value={formData.totalLandArea}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>

            {/* Village & Mandal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Village / Town
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                District & State
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>

            {/* Specific Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Residential Address
              </label>
              <textarea
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete residential street / village address"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              Change Password
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-forest-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
