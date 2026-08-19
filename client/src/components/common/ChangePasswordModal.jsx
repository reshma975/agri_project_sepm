import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
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

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('New passwords do not match');
    }

    if (formData.newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
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
          <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl text-sm border border-rose-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Current Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 transition-all outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 transition-all outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              required
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-forest-600 hover:bg-forest-700 rounded-xl transition-colors shadow-sm shadow-forest-200 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Confirm'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
