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
        return <div className="p-3 bg-rose-950/80 text-rose-400 border border-rose-800/60 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>;
      case 'warning':
        return <div className="p-3 bg-amber-950/80 text-amber-400 border border-amber-800/60 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>;
      case 'success':
        return <div className="p-3 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-2xl"><CheckCircle className="w-6 h-6" /></div>;
      default:
        return <div className="p-3 bg-teal-950/80 text-teal-400 border border-teal-800/60 rounded-2xl"><Info className="w-6 h-6" /></div>;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-500 text-white';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-500 text-white';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white';
      default:
        return 'bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        {getIcon()}
        <div>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-teal-900/50">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold text-slate-300 bg-[#0c242b] hover:bg-[#112f38] border border-teal-900/60 rounded-xl transition-colors disabled:opacity-50"
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
