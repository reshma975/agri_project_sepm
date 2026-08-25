import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Store,
  Building2,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import PasswordStrengthIndicator, { checkPasswordRules } from '../components/common/PasswordStrengthIndicator';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const initialRole = roleParam === 'SHOPKEEPER' ? 'SHOPKEEPER' : roleParam === 'OFFICER' ? 'OFFICER' : 'FARMER';
  const [role, setRole] = useState(initialRole);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    village: '',
    mandal: '',
    district: 'Vijayawada',
    state: 'Andhra Pradesh',
    businessName: '',
    designation: 'Agricultural Officer (AO)',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadyHasRole, setAlreadyHasRole] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setAlreadyHasRole(false);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    setAlreadyHasRole(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    const { isAllMet } = checkPasswordRules(formData.password);
    if (!isAllMet) {
      return setError('Please make sure your password satisfies all security requirements shown below.');
    }

    setLoading(true);
    setError('');
    setAlreadyHasRole(false);

    const res = await register({ ...formData, role });
    setLoading(false);

    if (res.success) {
      const roleTitle = role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer';
      setSuccessMsg(res.message || `Account configured for ${roleTitle}! Redirecting...`);
      setTimeout(() => {
        if (role === 'FARMER') navigate('/farmer/dashboard');
        else if (role === 'SHOPKEEPER') navigate('/shopkeeper/dashboard');
        else navigate('/officer/dashboard');
      }, 1200);
    } else {
      setError(res.message || 'Registration failed');
      if (res.alreadyHasRole) {
        setAlreadyHasRole(true);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Ambient background glow and radar rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="radar-circle w-[350px] h-[350px] border-teal-500/15" />
        <div className="radar-circle w-[600px] h-[600px] border-teal-500/10" />
      </div>

      <div className="max-w-xl w-full space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <Link
            to="/select-role"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-teal-300 bg-[#06171c] hover:bg-[#0c242c] border border-teal-500/30 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Selection
          </Link>
          <span className="text-[11px] text-slate-400 font-medium">Single Account • Multiple Roles</span>
        </div>

        {/* 3-Role Toggle Selector */}
        <div className="flex items-center justify-center gap-1.5 p-1.5 bg-[#06151a]/95 rounded-2xl border border-slate-700 shadow-md">
          <button
            type="button"
            onClick={() => handleRoleChange('FARMER')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              role === 'FARMER'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#0c242c]'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" /> <span>Farmer 👨‍🌾</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('SHOPKEEPER')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              role === 'SHOPKEEPER'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#0c242c]'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> <span>Shopkeeper 🏪</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('OFFICER')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              role === 'OFFICER'
                ? 'bg-teal-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#0c242c]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> <span>Officer 🏛️</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2dd4bf] text-glow-teal tracking-tight">
            {role === 'FARMER'
              ? 'Farmer Registration 👨‍🌾'
              : role === 'SHOPKEEPER'
              ? 'Shopkeeper Registration 🏪'
              : 'Govt Officer Registration 🏛️'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-normal">
            {role === 'FARMER'
              ? 'Create or link your farmer profile for cadastral land & crop records'
              : role === 'SHOPKEEPER'
              ? 'Register or add your authorized agro-input store to your account'
              : 'Register as an authorized District / Mandal Agriculture Officer'}
          </p>
        </div>

        {/* Register Form Card */}
        <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-teal-500/20 bg-[#051419]/90">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-rose-950/60 text-rose-300 rounded-xl text-xs border border-rose-800/60 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {alreadyHasRole && (
                  <div className="pt-2 border-t border-rose-800/40">
                    <Link
                      to={`/login?role=${role}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 hover:text-white underline"
                    >
                      <span>Sign in directly as {role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/60 text-emerald-300 rounded-xl text-xs border border-emerald-500/40 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={role === 'OFFICER' ? 'e.g. Ramu Rao (AO)' : 'e.g. Ramesh Patel'}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={role === 'OFFICER' ? 'e.g. ramu' : 'e.g. ramesh_patel'}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address {role !== 'FARMER' && '*'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required={role !== 'FARMER'}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Shopkeeper-specific Field */}
            {role === 'SHOPKEEPER' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Primary Business / Shop Name *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Kisan Agro Center"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Officer-specific Field */}
            {role === 'OFFICER' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Officer Designation *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Agricultural Officer (AO) / Mandal Agriculture Officer"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Location Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {role === 'OFFICER' ? 'Mandal Jurisdiction *' : 'Village / Town *'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name={role === 'OFFICER' ? 'mandal' : 'village'}
                    value={role === 'OFFICER' ? formData.mandal : formData.village}
                    onChange={handleChange}
                    placeholder={role === 'OFFICER' ? 'e.g. Ibrahimpatnam' : 'e.g. Kanumuru'}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  District *
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Vijayawada / Krishna"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter secure password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <PasswordStrengthIndicator password={formData.password} />

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 btn-glow-primary text-slate-950 font-black rounded-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer shadow-lg shadow-teal-500/25"
              >
                {loading ? (
                  'Processing Registration...'
                ) : (
                  <>
                    <span>
                      Complete {role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer'} Registration
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 pt-3.5 border-t border-teal-900/40 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link
              to={`/login?role=${role}`}
              className="font-bold text-teal-400 hover:text-teal-300 hover:underline"
            >
              Sign in as {role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
