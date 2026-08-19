import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
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
  Award
} from 'lucide-react';

export default function OfficerProfilePage() {
  const { user, updateProfile } = useAuth();
  const officer = user?.profile || {};

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    assignedArea: officer.assignedArea || 'Vijayawada Mandal, Krishna District',
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
        assignedArea: user.profile?.assignedArea || 'Vijayawada Mandal, Krishna District',
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
      {/* Back button (Wireframe 5) */}
      <Link
        to="/officer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Go back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-8 h-8 text-blue-600" />
          🏛️ Government Agriculture Officer Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Designated government verification authority and jurisdiction configuration.
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

      {/* Govt Profile Card (Matches Wireframe 5 "Govt Profile") */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Header ID */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-blue-700 shadow-sm flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">{user?.name}</h3>
              <p className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 inline-block mt-0.5">
                Officer ID: {officer.officerId || 'AGR-OFC-401'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Officer Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {/* Username (Wireframe 5: given by govt, fixed format) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Username (Fixed Format)
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 outline-none cursor-not-allowed font-mono"
              />
            </div>

            {/* Phone No (Wireframe 5) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Mail (Wireframe 5) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Government Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* License / Officer ID (Wireframe 5) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Government License / Verification Authority No.
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Area Governing (Wireframe 5: Area Governing) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Area Governing (Assigned Jurisdiction)
              </label>
              <input
                type="text"
                name="assignedArea"
                value={formData.assignedArea}
                onChange={handleChange}
                placeholder="e.g. Vijayawada Mandal, Krishna District"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Action Buttons (Wireframe 5: Change Password & Save button) */}
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
              className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
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
