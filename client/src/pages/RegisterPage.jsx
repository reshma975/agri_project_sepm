import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, User, Mail, Phone, Lock, MapPin, Store, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'SHOPKEEPER' ? 'SHOPKEEPER' : 'FARMER';
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');

    const res = await register({ ...formData, role });
    setLoading(false);

    if (res.success) {
      if (role === 'FARMER') navigate('/farmer/dashboard');
      else navigate('/shopkeeper/dashboard');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow and radar rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="radar-circle w-[350px] h-[350px] border-teal-500/15" />
        <div className="radar-circle w-[600px] h-[600px] border-teal-500/10" />
      </div>

      <div className="max-w-xl w-full space-y-6 relative z-10">
        <Link
          to="/select-role"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-teal-300 bg-[#06171c] hover:bg-[#0c242c] border border-teal-500/30 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Selection
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-12 h-12 rounded-2xl bg-teal-400 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(45,212,191,0.5)]">
              <Sprout className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2dd4bf] text-glow-teal tracking-tight">
            {role === 'FARMER' ? 'Register as Farmer 👨‍🌾' : 'Register as Shopkeeper 🏪'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-normal">
            {role === 'FARMER'
              ? 'Create your digital farmer profile for cadastral land & crop records'
              : 'Register your authorized agro-input store and manage live stock'}
          </p>
        </div>

        {/* Register Form Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/20 bg-[#051419]/90">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/60 text-rose-300 rounded-xl text-xs border border-rose-800/60 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Patel"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. ramesh_farmer"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address {role === 'FARMER' ? '(Optional)' : '*'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={role === 'FARMER' ? 'Optional (if available)' : 'shop@example.com'}
                    required={role !== 'FARMER'}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98480 12345"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Fields */}
            {role === 'FARMER' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#041217] rounded-2xl border border-teal-900/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Village / Town *
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="e.g. Kankipadu"
                    required
                    className="w-full px-3 py-2 text-xs bg-[#02090c] border border-teal-900/60 text-white rounded-xl focus:border-teal-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Vijayawada / Krishna"
                    className="w-full px-3 py-2 text-xs bg-[#02090c] border border-teal-900/60 text-white rounded-xl focus:border-teal-400 outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#041217] rounded-2xl border border-amber-900/50 space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Business / Agency Name *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Sri Lakshmi Agro Center"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#02090c] border border-amber-900/50 text-white rounded-xl focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 chars"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 btn-glow-primary text-slate-950 font-extrabold rounded-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4"
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'FARMER' ? 'Farmer' : 'Shopkeeper'}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-teal-900/40 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link to={`/login?role=${role}`} className="font-bold text-teal-400 hover:text-teal-300 hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
