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
        <div className="p-3.5 bg-[#030b0e] border border-slate-700 rounded-2xl text-xs space-y-1">
          <p className="font-extrabold text-white">
            {application.cropName} • Survey #{application.surveyNumber}
          </p>
          <p className="text-slate-300">
            Farmer: {application.farmerId?.userId?.name} ({application.farmerId?.farmerId}) • {application.cultivatedArea} {application.areaUnit}
          </p>
        </div>

        {/* Action Selector (3 Buttons from Wireframe 5: Verify, Return, Reject) */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Select Decision Action *
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActionType('VERIFY')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                actionType === 'VERIFY'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 ring-2 ring-emerald-500/30'
                  : 'bg-[#030b0e] text-slate-300 border-slate-700 hover:bg-[#0c242c]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>✅ Verify & Approve</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType('RETURN')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                actionType === 'RETURN'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 ring-2 ring-amber-500/30'
                  : 'bg-[#030b0e] text-slate-300 border-slate-700 hover:bg-[#0c242c]'
              }`}
            >
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>↩️ Return for Correction</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType('REJECT')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                actionType === 'REJECT'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 ring-2 ring-rose-500/30'
                  : 'bg-[#030b0e] text-slate-300 border-slate-700 hover:bg-[#0c242c]'
              }`}
            >
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>❌ Reject</span>
            </button>
          </div>
        </div>

        {/* Reason / Comment Field */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            {actionType === 'VERIFY' ? 'Officer Verification Note (Optional)' : 'Reason / Clarification Note (Mandatory) *'}
          </label>
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
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
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 text-xs font-black rounded-2xl transition-all shadow-md disabled:opacity-50 cursor-pointer ${
              actionType === 'VERIFY'
                ? 'btn-glow-primary text-slate-950'
                : actionType === 'RETURN'
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                : 'bg-rose-600 hover:bg-rose-700 text-white font-black'
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
