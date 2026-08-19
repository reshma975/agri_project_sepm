import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, User, Lock, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'FARMER';
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'FARMER') navigate('/farmer/dashboard');
      else if (user.role === 'SHOPKEEPER') navigate('/shopkeeper/dashboard');
      else if (user.role === 'OFFICER') navigate('/officer/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      return setError('Please enter your username/email and password');
    }

    setLoading(true);
    setError('');

    const res = await login(identifier, password, selectedRole);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'FARMER') navigate('/farmer/dashboard');
      else if (res.user.role === 'SHOPKEEPER') navigate('/shopkeeper/dashboard');
      else if (res.user.role === 'OFFICER') navigate('/officer/dashboard');
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  // Quick Demo Account Auto-Fill
  const handleQuickDemo = (role) => {
    setSelectedRole(role);
    if (role === 'FARMER') {
      setIdentifier('farmer@farmsetu.com');
      setPassword('farmer123');
    } else if (role === 'SHOPKEEPER') {
      setIdentifier('shopkeeper@farmsetu.com');
      setPassword('shop123');
    } else if (role === 'OFFICER') {
      setIdentifier('officer@farmsetu.com');
      setPassword('officer123');
    }
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-12 h-12 rounded-2xl bg-forest-600 flex items-center justify-center text-white shadow-md shadow-forest-200">
              <Sprout className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to FarmSetu 🌾
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Connecting Farmers, Markets & Government
          </p>
        </div>

        {/* Role Toggle Selector (Wireframe Section 8) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedRole('FARMER')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              selectedRole === 'FARMER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👨‍🌾 Farmer</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('SHOPKEEPER')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              selectedRole === 'SHOPKEEPER'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏪 Shopkeeper</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('OFFICER')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              selectedRole === 'OFFICER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏛️ Officer</span>
          </button>
        </div>

        {/* Demo Fill Bar */}
        <div className="p-3 bg-forest-50/70 border border-forest-200 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-forest-800">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
              Quick Demo Fill:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemo('FARMER')}
              className="px-2 py-1 bg-white hover:bg-forest-100 text-emerald-800 font-semibold rounded-lg border border-forest-200 transition-colors"
            >
              Demo Farmer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('SHOPKEEPER')}
              className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-800 font-semibold rounded-lg border border-amber-200 transition-colors"
            >
              Demo Shop
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('OFFICER')}
              className="px-2 py-1 bg-white hover:bg-blue-100 text-blue-800 font-semibold rounded-lg border border-blue-200 transition-colors"
            >
              Demo Officer
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username, Mobile Phone, or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9848012345, ramesh_farmer, or email"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('For demo accounts, use: farmer123, shop123, or officer123');
                  }}
                  className="text-xs font-semibold text-forest-700 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-forest-600 focus:ring-forest-400 border-slate-300"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-forest-600 hover:bg-forest-700 text-white font-bold rounded-2xl shadow-md shadow-forest-200 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In as {selectedRole === 'FARMER' ? 'Farmer' : selectedRole === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link for farmers/shopkeepers */}
          {selectedRole !== 'OFFICER' ? (
            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              <span>Don't have an account yet? </span>
              <Link
                to={`/register?role=${selectedRole}`}
                className="font-bold text-forest-700 hover:underline"
              >
                Register as {selectedRole === 'FARMER' ? 'Farmer' : 'Shopkeeper'}
              </Link>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
              🏛️ Government Officer accounts are authorized by District Agriculture Dept.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
