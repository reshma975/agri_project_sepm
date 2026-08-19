import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, User, Mail, Phone, Lock, MapPin, Store, ArrowRight, AlertCircle } from 'lucide-react';

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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-12 h-12 rounded-2xl bg-forest-600 flex items-center justify-center text-white shadow-md shadow-forest-200">
              <Sprout className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create FarmSetu Account 🌾
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Join thousands of farmers and agricultural business owners
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRole('FARMER')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'FARMER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👨‍🌾 Register as Farmer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('SHOPKEEPER')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'SHOPKEEPER'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏪 Register as Shopkeeper</span>
          </button>
        </div>

        {/* Register Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Patel"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. ramesh_farmer"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address {role === 'FARMER' ? '(Optional)' : '*'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={role === 'FARMER' ? 'Optional (if available)' : 'shop@example.com'}
                    required={role !== 'FARMER'}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98480 12345"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Fields */}
            {role === 'FARMER' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Village / Town *
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="e.g. Kankipadu"
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Vijayawada / Krishna"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Business / Agency Name *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Sri Lakshmi Agro Center"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 chars"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-forest-600 hover:bg-forest-700 text-white font-bold rounded-2xl shadow-md shadow-forest-200 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4"
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'FARMER' ? 'Farmer' : 'Shopkeeper'}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link to={`/login?role=${role}`} className="font-bold text-forest-700 hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
