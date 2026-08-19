import React, { useState } from 'react';
import Modal from '../common/Modal';
import { CheckCircle2, RotateCcw, XCircle, AlertCircle, MessageSquare } from 'lucide-react';

export default function ReviewActionModal({ isOpen, onClose, application, onActionComplete }) {
  const [actionType, setActionType] = useState('VERIFY'); // 'VERIFY' | 'RETURN' | 'REJECT'
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if ((actionType === 'RETURN' || actionType === 'REJECT') && !comment.trim()) {
      return setError(`Please provide a reason for ${actionType === 'RETURN' ? 'returning' : 'rejecting'} the application`);
    }

    setLoading(true);
    const res = await onActionComplete(application._id, actionType, comment);
    setLoading(false);

    if (res.success) {
      setComment('');
      onClose();
    } else {
      setError(res.message || 'Failed to complete officer action');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Officer Verification Action" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Application summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
          <p className="font-bold text-slate-800">
            {application.cropName} • Survey #{application.surveyNumber}
          </p>
          <p className="text-slate-500">
            Farmer: {application.farmerId?.userId?.name} ({application.farmerId?.farmerId}) • {application.cultivatedArea} {application.areaUnit}
          </p>
        </div>

        {/* Action Selector (3 Buttons from Wireframe 5: Verify, Return, Reject) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Decision Action *
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActionType('VERIFY')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                actionType === 'VERIFY'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>✅ Verify & Approve</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType('RETURN')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                actionType === 'RETURN'
                  ? 'bg-orange-50 text-orange-800 border-orange-500 ring-2 ring-orange-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <RotateCcw className="w-5 h-5 text-orange-600" />
              <span>↩️ Return for Correction</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType('REJECT')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                actionType === 'REJECT'
                  ? 'bg-rose-50 text-rose-800 border-rose-500 ring-2 ring-rose-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>❌ Reject</span>
            </button>
          </div>
        </div>

        {/* Reason / Comment Field (Mandatory for Return / Reject as in Section 23) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {actionType === 'VERIFY' ? 'Officer Verification Note (Optional)' : 'Reason / Clarification Note (Mandatory) *'}
          </label>
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                actionType === 'VERIFY'
                  ? 'e.g. Survey matched, physical verification completed.'
                  : actionType === 'RETURN'
                  ? 'e.g. Cultivated area does not match land details. Please correct and resubmit.'
                  : 'e.g. Survey number not registered under designated village boundaries.'
              }
              required={actionType !== 'VERIFY'}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
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
            className={`px-6 py-2.5 text-sm font-bold text-white rounded-2xl transition-all shadow-md disabled:opacity-50 ${
              actionType === 'VERIFY'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : actionType === 'RETURN'
                ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
            }`}
          >
            {loading
              ? 'Processing...'
              : actionType === 'VERIFY'
              ? 'Confirm & Verify'
              : actionType === 'RETURN'
              ? 'Return to Farmer'
              : 'Reject Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
