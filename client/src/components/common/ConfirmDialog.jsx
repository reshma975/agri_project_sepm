import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info' | 'success'
  loading = false,
}) {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <div className="p-3 bg-rose-100 text-rose-600 rounded-full"><AlertTriangle className="w-6 h-6" /></div>;
      case 'warning':
        return <div className="p-3 bg-amber-100 text-amber-600 rounded-full"><AlertTriangle className="w-6 h-6" /></div>;
      case 'success':
        return <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle className="w-6 h-6" /></div>;
      default:
        return <div className="p-3 bg-forest-100 text-forest-600 rounded-full"><Info className="w-6 h-6" /></div>;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      default:
        return 'bg-forest-600 hover:bg-forest-700 text-white';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        {getIcon()}
        <div>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-5 py-2 text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 ${getButtonClass()}`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
