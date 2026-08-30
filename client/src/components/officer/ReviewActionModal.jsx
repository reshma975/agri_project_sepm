import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import {
  CheckCircle2,
  RotateCcw,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  Sprout,
  LandPlot,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

export default function ReviewActionModal({ isOpen, onClose, application, onActionComplete }) {
  const [actionType, setActionType] = useState('VERIFY'); // 'VERIFY' | 'RETURN' | 'REJECT'
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Granular issues state for RETURN action
  const [issues, setIssues] = useState([
    {
      id: 1,
      target: 'LAND', // 'LAND' or crop._id
      issueType: 'OTHER',
      description: '',
    },
  ]);

  const crops = application?.crops || (application?.cropName ? [application] : []);
  const surveyNumber = application?.surveyNumber || 'Survey';
  const parcelId = application?.landId || application?._id || 'Parcel';
  const totalArea = application?.totalArea || application?.totalLandArea || 0;
  const farmerName = application?.farmerId?.userId?.name || application?.user?.name || application?.farmer?.name || 'Farmer';
  const farmerCode = application?.farmerId?.farmerId || application?.farmerCode || 'FMR-ID';

  useEffect(() => {
    if (isOpen && application) {
      setError('');
      setComment('');

      const status = application.overallVerificationStatus || application.status || 'PENDING_VERIFICATION';
      const isReturnNeeded = status === 'RESUBMIT_NEEDED' || status === 'RETURNED_FOR_CORRECTION';

      if (isReturnNeeded) {
        setActionType('RETURN');
        // Pre-populate with existing open issues if any
        if (Array.isArray(application.issues) && application.issues.length > 0) {
          const mappedIssues = application.issues.map((i) => ({
            id: i._id || Date.now() + Math.random(),
            target: i.issueLevel === 'LAND' || !i.cropId ? 'LAND' : (i.cropId?._id || i.cropId).toString(),
            issueType: i.issueType || 'OTHER',
            description: i.description || '',
          }));
          setIssues(mappedIssues.length > 0 ? mappedIssues : [
            { id: Date.now(), target: 'LAND', issueType: 'OTHER', description: '' }
          ]);
        } else {
          setIssues([
            { id: Date.now(), target: 'LAND', issueType: 'OTHER', description: application.officerComment || '' }
          ]);
        }
      } else if (status === 'REJECTED') {
        setActionType('REJECT');
        setComment(application.officerComment || '');
      } else {
        setActionType('VERIFY');
        setIssues([
          { id: Date.now(), target: 'LAND', issueType: 'OTHER', description: '' }
        ]);
      }
    }
  }, [isOpen, application]);

  if (!application) return null;

  const handleAddIssue = () => {
    setIssues((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        target: 'LAND',
        issueType: 'OTHER',
        description: '',
      },
    ]);
  };

  const handleRemoveIssue = (id) => {
    if (issues.length <= 1) return;
    setIssues((prev) => prev.filter((i) => i.id !== id));
  };

  const handleIssueChange = (id, field, value) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (actionType === 'REJECT' && !comment.trim()) {
      return setError('Please provide a reason for rejecting the land parcel application');
    }

    let payloadIssues = [];

    if (actionType === 'RETURN') {
      const validIssues = issues.filter((i) => i.description.trim() !== '');
      if (validIssues.length === 0) {
        return setError('Please specify at least one correction issue with instructions for the farmer.');
      }

      payloadIssues = validIssues.map((i) => {
        const isLand = i.target === 'LAND';
        return {
          issueLevel: isLand ? 'LAND' : 'CROP',
          cropId: isLand ? null : i.target,
          issueType: i.issueType || 'OTHER',
          description: i.description.trim(),
        };
      });
    }

    setLoading(true);
    const targetId = application._id;
    const res = await onActionComplete(targetId, actionType, comment, payloadIssues);
    setLoading(false);

    if (res && res.success) {
      onClose();
    } else {
      setError(res?.message || 'Failed to complete verification decision');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Officer Land Parcel Verification Decision"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-rose-950/80 text-rose-300 rounded-2xl text-xs border border-rose-500/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Parcel Case Summary */}
        <div className="p-4 bg-[#030b0e] border border-slate-700 rounded-2xl text-xs space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <LandPlot className="w-4 h-4 text-teal-400" />
              <span>Survey No. {surveyNumber}</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-teal-300 bg-[#06151a] px-2 py-0.5 rounded border border-slate-700">
              {parcelId} • {totalArea} Acres
            </span>
          </div>
          <p className="text-slate-300">
            Farmer: <strong className="text-white">{farmerName}</strong> ({farmerCode})
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400 font-bold">Crops on parcel:</span>
            {crops.length > 0 ? (
              crops.map((c, idx) => (
                <span
                  key={c._id || idx}
                  className="px-2 py-0.5 bg-[#06151a] text-emerald-300 rounded border border-emerald-500/30 font-semibold"
                >
                  🌱 {c.cropName} ({c.cultivatedArea} Ac)
                </span>
              ))
            ) : (
              <span className="text-slate-500">No registered crops</span>
            )}
          </div>
        </div>

        {/* Decision Action Selector (3 Buttons) */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Select Verification Action *
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setActionType('VERIFY')}
              className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                actionType === 'VERIFY'
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-[#030b0e] text-slate-300 border-slate-700 hover:bg-[#0c242c]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Verify &amp; Approve</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType('RETURN')}
              className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                actionType === 'RETURN'
                  ? 'bg-amber-950/90 text-amber-300 border-amber-500 ring-2 ring-amber-500/30'
                  : 'bg-[#030b0e] text-slate-300 border-slate-700 hover:bg-[#0c242c]'
              }`}
            >
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>Resubmit Needed</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType('REJECT')}
              className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                actionType === 'REJECT'
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500 ring-2 ring-rose-500/30'
                  : 'bg-[#030b0e] text-slate-300 border-slate-700 hover:bg-[#0c242c]'
              }`}
            >
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject</span>
            </button>
          </div>
        </div>

        {/* 1. APPROVE MODE: Note Field */}
        {actionType === 'VERIFY' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Officer Certification Note (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Cadastral records, survey coordinates, and crop sowing details verified & approved."
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">
              ✅ Approving this case will certify the Land Parcel and all {crops.length} crop record(s) under it.
            </p>
          </div>
        )}

        {/* 2. RETURN MODE: Granular Verification Issue Builder */}
        {actionType === 'RETURN' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Verification Issues for Resubmission
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddIssue}
                className="px-3 py-1 bg-[#06151a] hover:bg-teal-950 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Issue
              </button>
            </div>

            {(() => {
              const currentAttempts = application.resubmissionCount || 0;
              const nextAttempt = currentAttempts + 1;
              const isOverLimit = nextAttempt > 3;
              const isFinal = nextAttempt === 3;

              return (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
                    isOverLimit
                      ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                      : isFinal
                      ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                      : 'bg-[#06151a] border-teal-800/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                    <AlertCircle
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0 ${
                        isOverLimit
                          ? 'text-rose-400'
                          : isFinal
                          ? 'text-amber-400'
                          : 'text-teal-400'
                      }`}
                    />
                    <div className="space-y-0.5">
                      <strong className="block font-bold text-xs sm:text-sm text-white">
                        {isOverLimit
                          ? '🚨 Maximum Correction Limit (3 attempts) Exceeded'
                          : isFinal
                          ? '⚠️ 3rd & Final Correction Opportunity'
                          : `Correction Opportunity: Attempt ${nextAttempt} of 3`}
                      </strong>
                      <p className="text-[11px] text-slate-300">
                        {isOverLimit
                          ? 'Returning this application now will automatically mark it as REJECTED.'
                          : isFinal
                          ? 'This is the last correction chance allowed. If issues persist after this, application will be auto-rejected.'
                          : 'Farmers are allowed up to 3 correction cycles before automatic rejection.'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border flex-shrink-0 self-end sm:self-auto ${
                      isOverLimit
                        ? 'bg-rose-900 border-rose-400 text-white'
                        : isFinal
                        ? 'bg-amber-900 border-amber-400 text-amber-200'
                        : 'bg-[#030b0e] border-teal-700/60 text-teal-300'
                    }`}
                  >
                    Attempt {Math.min(nextAttempt, 3)}/3
                  </span>
                </div>
              );
            })()}

            <p className="text-[11px] text-slate-300">
              Specify each issue individually. Land-level notes will show on the parcel, while crop-specific notes will only appear on that specific crop.
            </p>

            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {issues.map((issue, idx) => (
                <div
                  key={issue.id}
                  className="p-4 bg-[#030b0e] border border-amber-500/40 rounded-2xl space-y-3 relative shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300">
                      Issue #{idx + 1}
                    </span>
                    {issues.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIssue(issue.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Remove issue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Target Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Affected Target Level *
                      </label>
                      <select
                        value={issue.target}
                        onChange={(e) => handleIssueChange(issue.id, 'target', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white font-semibold rounded-xl focus:border-teal-400 outline-none"
                      >
                        <option value="LAND" className="bg-[#06151a] text-amber-300 font-bold">
                          📄 Land Parcel / Title Documents (Whole Parcel)
                        </option>
                        {crops.map((c) => (
                          <option key={c._id} value={c._id} className="bg-[#06151a] text-white">
                            🌱 Crop: {c.cropName} ({c.cultivatedArea} Ac)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Issue Category */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Issue Category *
                      </label>
                      <select
                        value={issue.issueType}
                        onChange={(e) => handleIssueChange(issue.id, 'issueType', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white font-semibold rounded-xl focus:border-teal-400 outline-none"
                      >
                        <option value="DOCUMENT_UNCLEAR" className="bg-[#06151a] text-white">
                          Unclear / Incomplete Document
                        </option>
                        <option value="SOWING_DATE_MISMATCH" className="bg-[#06151a] text-white">
                          Sowing Date Correction Needed
                        </option>
                        <option value="AREA_DISCREPANCY" className="bg-[#06151a] text-white">
                          Cultivated Area Discrepancy
                        </option>
                        <option value="CROP_MISMATCH" className="bg-[#06151a] text-white">
                          Crop / Variety Correction
                        </option>
                        <option value="INVALID_SURVEY" className="bg-[#06151a] text-white">
                          Survey Number Correction
                        </option>
                        <option value="OTHER" className="bg-[#06151a] text-white">
                          Other Clarification
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Description / Correction Note */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Action Required / Correction Instructions *
                    </label>
                    <textarea
                      rows={2}
                      value={issue.description}
                      onChange={(e) => handleIssueChange(issue.id, 'description', e.target.value)}
                      placeholder="e.g. Upload clear copy of Aadhaar card matching Survey No. 35/2 records."
                      className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl focus:border-amber-400 outline-none transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. REJECT MODE: Reason Field */}
        {actionType === 'REJECT' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-rose-300 uppercase tracking-wider">
              Reason for Rejection *
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-rose-400 absolute left-3.5 top-3.5" />
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Survey number not registered under designated village boundaries or fraudulent documents provided."
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#030b0e] border border-rose-500/50 text-white rounded-2xl focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
                ? ((application.resubmissionCount || 0) + 1 > 3
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black')
                : 'bg-rose-600 hover:bg-rose-700 text-white font-black'
            }`}
          >
            {loading
              ? 'Processing...'
              : actionType === 'VERIFY'
              ? 'Confirm & Verify Land'
              : actionType === 'RETURN'
              ? ((application.resubmissionCount || 0) + 1 > 3
                  ? 'Exceeds 3 Attempts — Auto Reject'
                  : `Return for Correction (${(application.resubmissionCount || 0) + 1}/3)`)
              : 'Reject Land Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
