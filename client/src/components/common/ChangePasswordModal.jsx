import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import PasswordStrengthIndicator, { checkPasswordRules } from './PasswordStrengthIndicator';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
      return setError('New password cannot be the same as your current password. Please choose a different password.');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('New password and confirm password do not match');
    }

    const { isAllMet } = checkPasswordRules(formData.newPassword);
    if (!isAllMet) {
      return setError('Please make sure your new password satisfies all security requirements shown below.');
    }

    setLoading(true);
    const res = await changePassword(formData.oldPassword, formData.newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess('Password changed successfully!');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } else {
      setError(res.message || 'Failed to change password');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/70 text-rose-300 rounded-xl text-xs border border-rose-800/60">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/70 text-emerald-300 rounded-xl text-xs border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Current Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-teal-400 absolute left-3 top-3" />
            <input
              type={showOldPassword ? 'text' : 'password'}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
              className="w-full pl-9 pr-9 py-2 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all outline-none placeholder:text-slate-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
            >
              {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            New Password (min. 8 characters) *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-teal-400 absolute left-3 top-3" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Min. 8 chars, 1 uppercase, 1 symbol"
              required
              className="w-full pl-9 pr-9 py-2 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all outline-none placeholder:text-slate-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Confirm New Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-teal-400 absolute left-3 top-3" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              required
              className="w-full pl-9 pr-9 py-2 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all outline-none placeholder:text-slate-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Real-time Password Security Criteria */}
        {formData.newPassword && (
          <PasswordStrengthIndicator password={formData.newPassword} />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white bg-[#030b0e] hover:bg-[#07171d] border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-bold text-slate-950 btn-glow-primary rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Updating...' : 'Confirm'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
