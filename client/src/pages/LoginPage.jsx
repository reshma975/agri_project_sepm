import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { Sprout, User, Lock, ArrowRight, AlertCircle, ArrowLeft, KeyRound, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';
import PasswordStrengthIndicator, { checkPasswordRules } from '../components/common/PasswordStrengthIndicator';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'FARMER';
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

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
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(identifier.trim(), password, selectedRole);
    setLoading(false);

    if (res.success) {
      if (selectedRole === 'FARMER') navigate('/farmer/dashboard');
      else if (selectedRole === 'SHOPKEEPER') navigate('/shopkeeper/dashboard');
      else if (selectedRole === 'OFFICER') navigate('/officer/dashboard');
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (newPassword !== confirmNewPassword) {
      return setForgotError('New passwords do not match');
    }

    const { isAllMet } = checkPasswordRules(newPassword);
    if (!isAllMet) {
      return setForgotError('Please ensure your new password satisfies all security requirements shown below.');
    }

    try {
      setForgotLoading(true);
      const res = await apiClient.post('/auth/reset-password', {
        identifier: forgotIdentifier.trim(),
        newPassword,
        role: selectedRole
      });

      if (res.data.success) {
        setForgotSuccess(res.data.message || 'Password reset successfully!');
        setTimeout(() => {
          setIdentifier(forgotIdentifier);
          setShowForgotModal(false);
          setSuccessMsg('Password reset successfully! Please sign in with your new password.');
          setForgotIdentifier('');
          setNewPassword('');
          setConfirmNewPassword('');
          setForgotSuccess('');
        }, 1500);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please check your details.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-4 sm:py-6 relative overflow-hidden">
      {/* Background glow & radar rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[420px] h-[420px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="radar-circle w-[300px] h-[300px] border-teal-500/15" />
        <div className="radar-circle w-[500px] h-[500px] border-teal-500/10" />
      </div>

      <div className="max-w-md w-full space-y-4 relative z-10 my-auto">
        <div className="flex items-center justify-between">
          <Link
            to="/select-role"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-teal-300 bg-[#06171c] hover:bg-[#0c242c] border border-teal-500/30 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <span className="text-[11px] text-slate-400 font-medium">FarmSetu Secure Portal</span>
        </div>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-1">
            <div className="w-10 h-10 rounded-xl bg-teal-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.5)]">
              <Sprout className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2dd4bf] text-glow-teal tracking-tight">
            {selectedRole === 'FARMER' && 'Sign in as Farmer 👨‍🌾'}
            {selectedRole === 'SHOPKEEPER' && 'Sign in as Shopkeeper 🏪'}
            {selectedRole === 'OFFICER' && 'Sign in as Govt Officer 🏛️'}
          </h2>
          <p className="text-xs text-slate-400 font-normal">
            {selectedRole === 'FARMER' && 'Access your digital farm records, crop registration & advisory'}
            {selectedRole === 'SHOPKEEPER' && 'Manage your store inventory, stock verification & pricing'}
            {selectedRole === 'OFFICER' && 'Review land parcels, verify crops & process farm applications'}
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-teal-500/20 bg-[#051419]/90">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-2.5 bg-rose-950/60 text-rose-300 rounded-xl text-xs border border-rose-800/60 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-950/60 text-emerald-300 rounded-xl text-xs border border-emerald-500/40 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username, Mobile Phone, or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9848012345, ramesh_farmer, or email"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#030b0e] border border-teal-900/60 text-white placeholder-slate-500 rounded-2xl focus:bg-[#041217] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotIdentifier(identifier);
                    setForgotError('');
                    setForgotSuccess('');
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-teal-400/70 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
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

            <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 border-teal-900 bg-[#030b0e]"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 btn-glow-primary text-slate-950 font-black rounded-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer shadow-lg shadow-teal-500/25"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign in to {selectedRole === 'FARMER' ? 'Farmer' : selectedRole === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer'} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link for farmers/shopkeepers */}
          {selectedRole !== 'OFFICER' ? (
            <div className="mt-4 pt-3.5 border-t border-teal-900/40 text-center text-xs text-slate-400">
              <span>Don't have an account yet? </span>
              <Link
                to={`/register?role=${selectedRole}`}
                className="font-bold text-teal-400 hover:text-teal-300 hover:underline"
              >
                Register as {selectedRole === 'FARMER' ? 'Farmer' : 'Shopkeeper'}
              </Link>
            </div>
          ) : (
            <div className="mt-4 pt-3.5 border-t border-teal-900/40 text-center text-[11px] text-slate-400">
              🏛️ Government Officer accounts are authorized by District Agriculture Dept.
            </div>
          )}
        </div>
      </div>

      {/* Interactive Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card bg-[#051419] border border-teal-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-teal-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-950 text-teal-400 flex items-center justify-center border border-teal-500/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Reset Account Password</h3>
                  <p className="text-[11px] text-slate-400">For {selectedRole === 'FARMER' ? 'Farmer' : selectedRole === 'SHOPKEEPER' ? 'Shopkeeper' : 'Officer'} Account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-8 h-8 rounded-full bg-[#030b0e] text-slate-400 hover:text-white flex items-center justify-center border border-teal-900/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5 text-xs">
              {forgotError && (
                <div className="p-2.5 bg-rose-950/60 text-rose-300 rounded-xl border border-rose-800/60 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="p-2.5 bg-emerald-950/60 text-emerald-300 rounded-xl border border-emerald-500/40 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
                  Registered Username, Phone, or Email *
                </label>
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="e.g. 9848012345 or username"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-[#030b0e] border border-teal-900/60 text-white rounded-xl focus:border-teal-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
                  New Password (min. 8 characters) *
                </label>
                <div className="relative">
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 chars, 1 uppercase, 1 symbol"
                    required
                    className="w-full pl-3.5 pr-9 py-2 text-xs bg-[#030b0e] border border-teal-900/60 text-white rounded-xl focus:border-teal-400 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    {showForgotNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showForgotConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full pl-3.5 pr-9 py-2 text-xs bg-[#030b0e] border border-teal-900/60 text-white rounded-xl focus:border-teal-400 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    {showForgotConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Password strength checklist */}
              {newPassword && (
                <PasswordStrengthIndicator password={newPassword} />
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#030b0e] rounded-xl border border-teal-900/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-md shadow-teal-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
