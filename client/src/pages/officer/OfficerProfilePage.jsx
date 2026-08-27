import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import UserAvatar from '../../components/common/UserAvatar';
import {
  Building2,
  User,
  Phone,
  Mail,
  ShieldCheck,
  KeyRound,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Award,
  Sprout,
  Store
} from 'lucide-react';

export default function OfficerProfilePage() {
  const { user, updateProfile, switchRole } = useAuth();
  const officer = user?.profile || {};

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    assignedArea: officer.assignedArea || 'Penamaluru Mandal, Krishna District',
    mandal: officer.mandal || 'Penamaluru',
    licenseNumber: officer.licenseNumber || 'AP-AGRI-OFF-2024-8841',
    district: officer.district || 'Vijayawada',
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
        assignedArea: user.profile?.assignedArea || 'Penamaluru Mandal, Krishna District',
        mandal: user.profile?.mandal || 'Penamaluru',
        licenseNumber: user.profile?.licenseNumber || 'AP-AGRI-OFF-2024-8841',
        district: user.profile?.district || 'Vijayawada',
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
      setSuccess('Officer profile saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.message || 'Failed to save profile');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/officer/dashboard"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-teal-300 bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 transition-all shadow-2xs cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-8 h-8 text-teal-400" />
          🏛️ Government Agriculture Officer Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
          Designated government verification authority and jurisdiction configuration.
        </p>
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

      {/* Multi-Role Ecosystem Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#06181d]/90 border border-teal-500/30 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-extrabold text-white">
              Account Roles & Linked Portals
            </h3>
          </div>
          <span className="text-[10px] font-mono text-teal-300 bg-[#030b0e] px-2.5 py-0.5 rounded-full border border-teal-500/30">
            Unified Single Login
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Your account uses unified credentials (same username, mobile phone & password) across all portals.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Officer (Current Active) */}
          <div className="p-3 bg-[#030b0e] rounded-2xl border border-cyan-500/50 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">🏛️ Govt Officer</span>
              <strong className="text-xs text-white">Active Session</strong>
            </div>
            <span className="text-[11px] text-cyan-300 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Current Portal
            </span>
          </div>

          {/* Farmer */}
          <div className="p-3 bg-[#030b0e] rounded-2xl border border-slate-700 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">👨‍🌾 Farmer Role</span>
              <span className="text-xs text-slate-300">
                {user?.roles?.includes('FARMER') ? 'Activated on account' : 'Not yet added'}
              </span>
            </div>
            {user?.roles?.includes('FARMER') ? (
              <button
                type="button"
                onClick={async () => {
                  const res = await switchRole('FARMER');
                  if (res.success) window.location.href = '/farmer/dashboard';
                }}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                <span>Switch Portal ➔</span>
              </button>
            ) : (
              <Link
                to="/register?role=FARMER&mode=add"
                className="px-2.5 py-1 bg-[#06181d] hover:bg-[#0c242c] text-teal-300 text-xs font-bold rounded-xl border border-teal-500/30 text-center cursor-pointer"
              >
                + Add Farmer Role
              </Link>
            )}
          </div>

          {/* Shopkeeper */}
          <div className="p-3 bg-[#030b0e] rounded-2xl border border-slate-700 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">🏪 Shopkeeper Role</span>
              <span className="text-xs text-slate-300">
                {user?.roles?.includes('SHOPKEEPER') ? 'Activated on account' : 'Not yet added'}
              </span>
            </div>
            {user?.roles?.includes('SHOPKEEPER') ? (
              <button
                type="button"
                onClick={async () => {
                  const res = await switchRole('SHOPKEEPER');
                  if (res.success) window.location.href = '/shopkeeper/dashboard';
                }}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                <span>Switch Portal ➔</span>
              </button>
            ) : (
              <Link
                to="/register?role=SHOPKEEPER&mode=add"
                className="px-2.5 py-1 bg-[#06181d] hover:bg-[#0c242c] text-teal-300 text-xs font-bold rounded-xl border border-teal-500/30 text-center cursor-pointer"
              >
                + Add Shopkeeper Role
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Govt Profile Card */}
      <div className="bg-[#06151a]/95 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Header ID */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#030b0e] border-2 border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <UserAvatar user={user} showBadge={true} className="w-16 h-16" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">{user?.name}</h3>
              <p className="text-xs font-mono font-bold text-teal-300 bg-[#030b0e] px-2.5 py-0.5 rounded-lg border border-slate-700 inline-block mt-0.5">
                Officer ID: {officer.officerId || 'AGR-OFC-401'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Officer Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 outline-none transition-all"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Official Username (Fixed Format)
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e]/50 border border-slate-700 rounded-2xl text-slate-500 outline-none cursor-not-allowed font-mono"
              />
            </div>

            {/* Phone No */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number (10 Digits)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
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
                  placeholder="10-digit mobile"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Mail */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Government Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* License / Officer ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Government License / Verification Authority No.
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Designated Mandal */}
            <div>
              <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Designated Mandal Jurisdiction *</span>
              </label>
              <input
                type="text"
                name="mandal"
                value={formData.mandal}
                onChange={handleChange}
                required
                placeholder="e.g. Penamaluru"
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-500/50 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all font-semibold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                You will receive and verify crop registrations submitted by farmers registered in this Mandal.
              </span>
            </div>

            {/* Area Governing */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Office Jurisdiction / District
              </label>
              <input
                type="text"
                name="assignedArea"
                value={formData.assignedArea}
                onChange={handleChange}
                placeholder="e.g. Penamaluru Mandal, Krishna District"
                className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 outline-none transition-all placeholder:text-slate-500"
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
              Change Password (Sub-Form)
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-950" />
              {loading ? 'Saving...' : 'Save Profile Details'}
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
