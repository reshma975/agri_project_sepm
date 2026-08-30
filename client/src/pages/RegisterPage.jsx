import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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
  CheckCircle2,
  Sparkles,
  KeyRound,
  UserCheck,
  LandPlot
} from 'lucide-react';
import PasswordStrengthIndicator, { checkPasswordRules } from '../components/common/PasswordStrengthIndicator';

export default function RegisterPage() {
  const { user: loggedInUser, register, addRole, checkIdentity, switchRole } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const roleParam = searchParams.get('role');
  const initialRole = roleParam === 'SHOPKEEPER' ? 'SHOPKEEPER' : roleParam === 'OFFICER' ? 'OFFICER' : 'FARMER';
  const [role, setRole] = useState(initialRole);

  // Check if existing user info was passed from Login page role mismatch or is logged in
  const activeExistingUser = location.state?.existingUser || loggedInUser;
  const [existingUser, setExistingUser] = useState(activeExistingUser || null);

  const [formData, setFormData] = useState({
    name: activeExistingUser?.name || '',
    username: activeExistingUser?.username || '',
    email: activeExistingUser?.email || '',
    phone: activeExistingUser?.phone || '',
    identifier: activeExistingUser?.username || activeExistingUser?.phone || '',
    password: '',
    confirmPassword: '',
    village: '',
    mandal: '',
    district: 'Vijayawada',
    state: 'Andhra Pradesh',
    businessName: '',
    designation: 'Agricultural Officer (AO)',
    totalLandArea: '',
    licenseNumber: 'AP-AGRI-OFF-2024-8841',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadyHasRole, setAlreadyHasRole] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  // Automatically sync when existing user is detected or passed
  useEffect(() => {
    const userToUse = location.state?.existingUser || loggedInUser;
    if (userToUse) {
      setExistingUser(userToUse);
      setFormData(prev => ({
        ...prev,
        name: userToUse.name || prev.name,
        username: userToUse.username || prev.username,
        email: userToUse.email || prev.email,
        phone: userToUse.phone || prev.phone,
        identifier: userToUse.username || userToUse.phone || prev.identifier,
      }));
    }
  }, [loggedInUser, location.state]);

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

  // Smart identity check for unauthenticated users when typing username, phone, or email
  const handleCheckIdentityBlur = async (identifierVal) => {
    if (!identifierVal || identifierVal.trim().length < 3 || existingUser) return;
    try {
      const res = await checkIdentity(identifierVal.trim());
      if (res.success && res.exists && res.user) {
        // Automatically populate and switch to existing account mode
        setExistingUser(res.user);
        setFormData(prev => ({
          ...prev,
          name: res.user.name || prev.name,
          username: res.user.username || prev.username,
          email: res.user.email || prev.email,
          phone: res.user.phone || prev.phone,
          identifier: res.user.username || res.user.phone || prev.identifier
        }));
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAlreadyHasRole(false);

    // =========================================================================
    // FLOW A: EXISTING USER REGISTERING FOR A SECOND ROLE (e.g. Farmer -> Shopkeeper)
    // =========================================================================
    if (existingUser) {
      setLoading(true);

      const payload = {
        role,
        identifier: existingUser.username || existingUser.phone || formData.identifier,
        password: formData.password || undefined, // Uses existing account session
        businessName: formData.businessName,
        village: formData.village,
        mandal: formData.mandal,
        district: formData.district,
        state: formData.state,
        totalLandArea: formData.totalLandArea,
        designation: formData.designation,
        licenseNumber: formData.licenseNumber
      };

      const res = await addRole(payload);
      setLoading(false);

      if (res.success) {
        const roleTitle = role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer';
        setSuccessMsg(res.message || `Activated ${roleTitle} role on your account! Redirecting...`);
        setTimeout(() => {
          if (role === 'FARMER') navigate('/farmer/dashboard');
          else if (role === 'SHOPKEEPER') navigate('/shopkeeper/dashboard');
          else navigate('/officer/dashboard');
        }, 1200);
      } else {
        setError(res.message || 'Failed to complete registration');
        if (res.alreadyHasRole) {
          setAlreadyHasRole(true);
        }
      }
      return;
    }

    // =========================================================================
    // FLOW B: FIRST-TIME USER BRAND NEW ACCOUNT REGISTRATION
    // =========================================================================
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return setError('Please enter a valid 10-digit mobile phone number (e.g. 9876543210). Only 10 digits allowed.');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    const { isAllMet } = checkPasswordRules(formData.password);
    if (!isAllMet) {
      return setError('Please make sure your password satisfies all security requirements shown below.');
    }

    setLoading(true);
    const res = await register({ ...formData, role });
    setLoading(false);

    if (res.success) {
      const roleTitle = role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer';
      setSuccessMsg(res.message || `Account created for ${roleTitle}! Redirecting...`);
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

  const userAlreadyHasSelectedRole = existingUser?.roles?.includes(role);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="radar-circle w-[350px] h-[350px] border-teal-500/15" />
        <div className="radar-circle w-[600px] h-[600px] border-teal-500/10" />
      </div>

      <div className="max-w-xl w-full space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <Link
            to={existingUser ? (existingUser.role === 'FARMER' || existingUser.roles?.includes('FARMER') ? '/farmer/dashboard' : '/select-role') : '/select-role'}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-teal-300 bg-[#06171c] hover:bg-[#0c242c] border border-teal-500/30 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <span className="text-[11px] text-slate-400 font-medium">Single Unified Account • Multi-Role Support</span>
        </div>

        {/* 3-Role Target Selector */}
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

        {/* Header Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2dd4bf] text-glow-teal tracking-tight flex items-center justify-center gap-2">
            <span>{role === 'SHOPKEEPER' ? 'Shopkeeper Registration' : role === 'FARMER' ? 'Farmer Registration' : 'Govt Officer Registration'}</span>
            <span>{role === 'SHOPKEEPER' ? '🏪' : role === 'FARMER' ? '👨‍🌾' : '🏛️'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-normal">
            {role === 'SHOPKEEPER'
              ? 'Register or add your authorized agro-input store to your account'
              : role === 'FARMER'
              ? 'Register your account to manage digital farm records and crop applications'
              : 'Register as an authorized District / Mandal Agriculture Officer'}
          </p>
        </div>

        {/* Register Form Card */}
        <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-teal-500/20 bg-[#051419]/90">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* If user already has role */}
            {existingUser && userAlreadyHasSelectedRole ? (
              <div className="p-5 bg-[#06181d] rounded-2xl border border-teal-500/30 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 mx-auto flex items-center justify-center border border-teal-500/40">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-white text-base">
                  You already have the {role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Officer'} role enabled!
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Your unified account is already activated for this portal.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await switchRole(role);
                    if (res.success) {
                      if (role === 'FARMER') navigate('/farmer/dashboard');
                      else if (role === 'SHOPKEEPER') navigate('/shopkeeper/dashboard');
                      else navigate('/officer/dashboard');
                    }
                  }}
                  className="px-5 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Go to {role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Officer'} Dashboard ➔</span>
                </button>
              </div>
            ) : existingUser ? (
              /* ========================================================================================= */
              /* EXISTING FARMER FLOW: Basic Details are Fetched & Read-Only, Passwords REMOVED!           */
              /* ========================================================================================= */
              <div className="space-y-3.5">
                {/* 1. Full Name & Username (Pre-filled & Read-only) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Full Name *</span>
                      <span className="text-[10px] text-teal-400 font-normal">🔒 From Account</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.name || existingUser.name}
                        disabled
                        readOnly
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#03090c] border border-slate-700/80 text-slate-300 rounded-2xl cursor-not-allowed opacity-80 select-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Username *</span>
                      <span className="text-[10px] text-teal-400 font-normal">🔒 Locked</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username ? `@${formData.username}` : `@${existingUser.username}`}
                      disabled
                      readOnly
                      className="w-full px-3.5 py-2.5 text-sm bg-[#03090c] border border-slate-700/80 text-teal-300 font-mono rounded-2xl cursor-not-allowed opacity-80 select-none shadow-inner"
                    />
                  </div>
                </div>

                {/* 2. Email Address & Phone Number (Pre-filled & Read-only) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Email Address *</span>
                      <span className="text-[10px] text-teal-400 font-normal">🔒 Locked</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={formData.email || existingUser.email || 'N/A'}
                        disabled
                        readOnly
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#03090c] border border-slate-700/80 text-slate-300 rounded-2xl cursor-not-allowed opacity-80 select-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Phone Number *</span>
                      <span className="text-[10px] text-teal-400 font-normal">🔒 Locked</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={formData.phone || existingUser.phone || 'N/A'}
                        disabled
                        readOnly
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#03090c] border border-slate-700/80 text-slate-300 rounded-2xl cursor-not-allowed opacity-80 select-none shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Role-Specific Editable Information */}
                {role === 'SHOPKEEPER' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
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
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Store Location / Market Area *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="village"
                          value={formData.village}
                          onChange={handleChange}
                          placeholder="e.g. Kokilampadu Main Road"
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
                          Mandal / Tehsil *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            name="mandal"
                            value={formData.mandal}
                            onChange={handleChange}
                            placeholder="e.g. Tiruvuru"
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-500/40 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                          District *
                        </label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          placeholder="e.g. NTR District"
                          required
                          className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {role === 'FARMER' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Village / Town *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="village"
                          value={formData.village}
                          onChange={handleChange}
                          placeholder="e.g. Kokilampadu"
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
                          Mandal / Tehsil *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            name="mandal"
                            value={formData.mandal}
                            onChange={handleChange}
                            placeholder="e.g. Tiruvuru"
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-500/50 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                          District *
                        </label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          placeholder="e.g. NTR District"
                          required
                          className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {role === 'OFFICER' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
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
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
                          Designated Mandal Jurisdiction *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            name="mandal"
                            value={formData.mandal}
                            onChange={handleChange}
                            placeholder="e.g. Penamaluru"
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                          District *
                        </label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          placeholder="e.g. Vijayawada / Krishna"
                          required
                          className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 btn-glow-primary text-slate-950 text-sm font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <span>{loading ? 'Activating...' : `Complete ${role === 'SHOPKEEPER' ? 'Shopkeeper' : role === 'FARMER' ? 'Farmer' : 'Officer'} Registration →`}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
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
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
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
                      onBlur={(e) => handleCheckIdentityBlur(e.target.value)}
                      placeholder={role === 'OFFICER' ? 'e.g. ramu' : 'e.g. ramesh_patel'}
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all font-mono"
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
                        onBlur={(e) => handleCheckIdentityBlur(e.target.value)}
                        placeholder="name@example.com"
                        required={role !== 'FARMER'}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
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
                        maxLength={10}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: digitsOnly });
                          setError('');
                        }}
                        onBlur={(e) => handleCheckIdentityBlur(e.target.value)}
                        placeholder="10-digit Mobile (e.g. 9876543210)"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {role === 'SHOPKEEPER' && (
                  <>
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
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Store Location / Market Area *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="village"
                          value={formData.village}
                          onChange={handleChange}
                          placeholder="e.g. Kokilampadu Main Road"
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
                          Mandal / Tehsil *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            name="mandal"
                            value={formData.mandal}
                            onChange={handleChange}
                            placeholder="e.g. Tiruvuru"
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-500/40 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all font-semibold"
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
                          placeholder="e.g. NTR District"
                          required
                          className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {role === 'FARMER' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Village / Town *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="village"
                          value={formData.village}
                          onChange={handleChange}
                          placeholder="e.g. Kokilampadu"
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
                          Mandal / Tehsil *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            name="mandal"
                            value={formData.mandal}
                            onChange={handleChange}
                            placeholder="e.g. Tiruvuru"
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-500/40 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all font-semibold"
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
                          placeholder="e.g. NTR District"
                          required
                          className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {role === 'OFFICER' && (
                  <>
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
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
                          Designated Mandal Jurisdiction *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            name="mandal"
                            value={formData.mandal}
                            onChange={handleChange}
                            placeholder="e.g. Penamaluru"
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all font-semibold"
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
                          className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Password & Confirm Password (ONLY for brand new users) */}
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
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
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
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:border-teal-400 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                <PasswordStrengthIndicator password={formData.password} />

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 btn-glow-primary text-slate-950 text-sm font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                  <span>
                    {loading
                      ? 'Creating Account...'
                      : `Complete ${role === 'SHOPKEEPER' ? 'Shopkeeper' : role === 'FARMER' ? 'Farmer' : 'Officer'} Registration →`}
                  </span>
                </button>
              </div>
            )}
          </form>

          {/* Bottom Login Link */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link
              to={`/login?role=${role}`}
              className="text-teal-400 hover:text-teal-300 font-bold underline cursor-pointer"
            >
              Sign In to {role === 'SHOPKEEPER' ? 'Shopkeeper' : role === 'FARMER' ? 'Farmer' : 'Officer'} Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
