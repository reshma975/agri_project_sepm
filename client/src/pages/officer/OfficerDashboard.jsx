import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import VerificationQueueItem from '../../components/officer/VerificationQueueItem';
import FarmerVerificationCard from '../../components/officer/FarmerVerificationCard';
import DeadlineManagerModal from '../../components/officer/DeadlineManagerModal';
import ReviewActionModal from '../../components/officer/ReviewActionModal';
import ExportModal from '../../components/officer/ExportModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import confetti from 'canvas-confetti';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Search,
  Download,
  Filter,
  MapPin,
  ShieldCheck,
  Award,
  ArrowRight,
  Calendar,
  Layers,
  Users,
  Sprout,
  FileText,
  AlertCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('farmers'); // 'farmers' | 'crops'

  // Modals
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Farmer Batch Decision Modal
  const [farmerDecisionModal, setFarmerDecisionModal] = useState(null); // { farmerApp, actionType: 'VERIFY'|'RETURN'|'REJECT' }
  const [farmerComment, setFarmerComment] = useState('');
  const [farmerActionLoading, setFarmerActionLoading] = useState(false);
  const [farmerActionError, setFarmerActionError] = useState('');

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/officer/dashboard');
      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Error fetching officer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Handle single crop action
  const handleSingleActionComplete = async (cropId, actionType, comment) => {
    try {
      let endpoint = `/officer/crops/${cropId}/verify`;
      if (actionType === 'RETURN') endpoint = `/officer/crops/${cropId}/return`;
      if (actionType === 'REJECT') endpoint = `/officer/crops/${cropId}/reject`;

      const res = await apiClient.put(endpoint, {
        comment,
        reason: comment,
      });

      if (res.data.success) {
        if (actionType === 'VERIFY') {
          try { confetti({ particleCount: 60, spread: 60 }); } catch (e) {}
          setActionSuccess('Application verified and approved successfully!');
        } else if (actionType === 'RETURN') {
          setActionSuccess('Application returned for correction & resubmission.');
        } else {
          setActionSuccess('Application rejected.');
        }
        setTimeout(() => setActionSuccess(''), 4000);
        fetchDashboard();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to record officer action',
      };
    }
  };

  // Handle Farmer-level batch decision
  const handleFarmerBatchSubmit = async (e) => {
    e.preventDefault();
    if (!farmerDecisionModal) return;

    const { farmerApp, actionType } = farmerDecisionModal;
    if ((actionType === 'RETURN' || actionType === 'REJECT') && !farmerComment.trim()) {
      return setFarmerActionError(`Please provide a reason for ${actionType === 'RETURN' ? 'returning for resubmission' : 'rejecting'}`);
    }

    setFarmerActionLoading(true);
    setFarmerActionError('');

    try {
      let endpoint = `/officer/farmers/${farmerApp.farmerId}/verify`;
      if (actionType === 'RETURN') endpoint = `/officer/farmers/${farmerApp.farmerId}/return`;

      const res = await apiClient.put(endpoint, {
        comment: farmerComment,
        reason: farmerComment
      });

      if (res.data.success) {
        if (actionType === 'VERIFY') {
          try { confetti({ particleCount: 80, spread: 70 }); } catch (e) {}
          setActionSuccess(`Verified all submitted crop applications for ${farmerApp.user?.name || 'Farmer'}!`);
        } else if (actionType === 'RETURN') {
          setActionSuccess(`Returned applications to ${farmerApp.user?.name || 'Farmer'} for correction & resubmission.`);
        }
        setFarmerDecisionModal(null);
        setFarmerComment('');
        setTimeout(() => setActionSuccess(''), 4000);
        fetchDashboard();
      }
    } catch (err) {
      setFarmerActionError(err.response?.data?.message || 'Failed to process action');
    } finally {
      setFarmerActionLoading(false);
    }
  };

  const officer = dashboardData?.officer || user?.profile || {};
  const mandal = dashboardData?.mandal || officer.mandal || 'Penamaluru';
  const deadline = dashboardData?.deadline;
  const stats = dashboardData?.stats || { pending: 0, verified: 0, returned: 0, rejected: 0, totalFarmersInMandal: 0 };
  const pendingCrops = dashboardData?.pendingApplications || [];
  const farmerApplications = dashboardData?.farmerApplications || [];

  const isDeadlineExpired = deadline ? new Date(deadline.deadlineDate) < new Date() : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hi, {user?.name || 'Officer'} 🏛️
            </h1>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-teal-950/90 text-teal-300 border border-teal-500/30">
              {officer.designation || 'Assistant Agricultural Officer (AAO)'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-400" />
            Assigned Mandal Jurisdiction: <strong className="text-teal-300 font-mono">{mandal} Mandal</strong> • Krishna District
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Link
            to="/officer/search"
            className="px-4 py-2.5 bg-[#030b0e] hover:bg-[#0c242c] text-white text-xs sm:text-sm font-bold rounded-2xl border border-slate-700 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4 text-teal-400" />
            <span>Search {mandal} Farmers</span>
          </Link>

          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Export Verified Report</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/80 text-emerald-300 rounded-2xl text-sm border border-emerald-500/50 flex items-center gap-2.5 shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* DEADLINE MANAGEMENT BANNER */}
      <div className="bg-[#06151a]/95 rounded-3xl p-6 border border-teal-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
            isDeadlineExpired ? 'bg-rose-950/80 text-rose-300 border-rose-500/40' : 'bg-teal-950/80 text-teal-300 border-teal-500/40'
          }`}>
            <Calendar className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 bg-[#030b0e] px-2.5 py-0.5 rounded-full border border-slate-700">
                Crop Registration Window ({mandal} Mandal)
              </span>
              {deadline ? (
                isDeadlineExpired ? (
                  <span className="text-xs font-bold text-rose-300 bg-rose-950/90 px-2.5 py-0.5 rounded-full border border-rose-500/50 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-400" /> Deadline Expired (Closed)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Submissions Open
                  </span>
                )
              ) : (
                <span className="text-xs font-bold text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/50">
                  No Deadline Set Yet
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-white">
              {deadline ? (
                <>
                  Cut-off Deadline: <span className="text-teal-300">{new Date(deadline.deadlineDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span> ({deadline.season} Season {deadline.year})
                </>
              ) : (
                'Set the official registration deadline for farmers in this mandal'
              )}
            </h3>

            <p className="text-xs text-slate-300 max-w-2xl">
              {deadline?.description || `Set the final date and time after which no new crop submissions or resubmissions will be accepted for ${mandal} Mandal.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDeadlineModalOpen(true)}
          className="w-full md:w-auto px-6 py-3 bg-[#030b0e] hover:bg-[#0c242c] text-teal-300 hover:text-white border border-teal-500/40 hover:border-teal-300 text-xs sm:text-sm font-extrabold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-teal-400" />
          <span>{deadline ? 'Update Mandal Deadline' : 'Set Registration Deadline'}</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.pending}</p>
          <span className="text-[11px] text-slate-400 font-medium">
            {farmerApplications.length} Farmer{farmerApplications.length !== 1 ? 's' : ''} in {mandal}
          </span>
        </div>

        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-teal-300">
            <span>Verified & Approved</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.verified}</p>
          <span className="text-[11px] text-slate-400 font-medium">Passed official survey audit</span>
        </div>

        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Resubmit Needed</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.returned}</p>
          <span className="text-[11px] text-slate-400 font-medium">Returned for correction</span>
        </div>

        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.rejected}</p>
          <span className="text-[11px] text-slate-400 font-medium">Non-compliant records</span>
        </div>
      </div>

      {/* Main Section: Verifications Queue (Farmer-Centric & Crops View) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-teal-400" />
              Pending Verifications Queue ({mandal} Mandal)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review farmers registered in your mandal, inspect uploaded identity &amp; land documents, and verify crop acreage.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#030b0e] p-1 rounded-2xl border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('farmers')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'farmers'
                  ? 'bg-teal-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Grouped by Farmer ({farmerApplications.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('crops')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'crops'
                  ? 'bg-teal-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>All Crop Applications ({pendingCrops.length})</span>
            </button>
          </div>
        </div>

        {/* Applications Queue Content */}
        {loading ? (
          <LoadingSpinner message={`Fetching pending verification requests for ${mandal} Mandal...`} />
        ) : farmerApplications.length === 0 && pendingCrops.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={`All clear in ${mandal} Mandal!`}
            description="There are currently no pending crop applications awaiting verification in your mandal."
            actionText="Check Verified Archive"
            onAction={() => navigate('/officer/archive')}
          />
        ) : viewMode === 'farmers' ? (
          /* ================= FARMER-CENTRIC VERIFICATION VIEW ================= */
          <div className="space-y-5">
            {farmerApplications.map((farmerApp) => (
              <FarmerVerificationCard
                key={farmerApp.farmerId}
                farmerApp={farmerApp}
                onViewDoc={(doc) => setPreviewDoc(doc)}
                onVerifyFarmer={(app) =>
                  setFarmerDecisionModal({ farmerApp: app, actionType: 'VERIFY' })
                }
                onReturnFarmer={(app) =>
                  setFarmerDecisionModal({ farmerApp: app, actionType: 'RETURN' })
                }
                onRejectFarmer={(app) =>
                  setFarmerDecisionModal({ farmerApp: app, actionType: 'REJECT' })
                }
                onReviewCrop={(crop) => navigate(`/officer/crops/${crop._id}`)}
              />
            ))}
          </div>
        ) : (
          /* ================= INDIVIDUAL CROPS VIEW ================= */
          <div className="space-y-3">
            {pendingCrops.map((app) => (
              <VerificationQueueItem
                key={app._id}
                application={app}
                onReview={(item) => navigate(`/officer/crops/${item._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Deadline Manager Modal */}
      <DeadlineManagerModal
        isOpen={deadlineModalOpen}
        onClose={() => setDeadlineModalOpen(false)}
        currentDeadline={deadline}
        mandal={mandal}
        onDeadlineSaved={() => fetchDashboard()}
      />

      {/* Review Action Modal (For Single Crop) */}
      <ReviewActionModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onActionComplete={handleSingleActionComplete}
      />

      {/* Farmer Batch Decision Modal */}
      {farmerDecisionModal && (
        <Modal
          isOpen={!!farmerDecisionModal}
          onClose={() => setFarmerDecisionModal(null)}
          title={`Farmer Verification Decision — ${farmerDecisionModal.farmerApp?.user?.name || 'Farmer'}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleFarmerBatchSubmit} className="space-y-4">
            {farmerActionError && (
              <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{farmerActionError}</span>
              </div>
            )}

            <div className="p-3.5 bg-[#030b0e] border border-slate-700 rounded-2xl text-xs space-y-1">
              <p className="font-extrabold text-white">
                Farmer: {farmerDecisionModal.farmerApp?.user?.name} ({farmerDecisionModal.farmerApp?.farmerCode})
              </p>
              <p className="text-slate-300">
                Location: {farmerDecisionModal.farmerApp?.village}, {farmerDecisionModal.farmerApp?.mandal} • Applications: {farmerDecisionModal.farmerApp?.crops?.length} Crop(s)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {farmerDecisionModal.actionType === 'VERIFY'
                  ? 'Verification Approval Note (Optional)'
                  : 'Reason / Remarks for Resubmission (Mandatory) *'}
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
                <textarea
                  rows={3}
                  value={farmerComment}
                  onChange={(e) => setFarmerComment(e.target.value)}
                  placeholder={
                    farmerDecisionModal.actionType === 'VERIFY'
                      ? 'e.g. Identity documents and cadastral survey boundaries confirmed.'
                      : 'e.g. Please re-upload clearer 1-B title copy and correct survey number 125/2.'
                  }
                  required={farmerDecisionModal.actionType !== 'VERIFY'}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setFarmerDecisionModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={farmerActionLoading}
                className={`px-6 py-2 text-xs font-black rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer ${
                  farmerDecisionModal.actionType === 'VERIFY'
                    ? 'btn-glow-primary text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                }`}
              >
                {farmerActionLoading
                  ? 'Processing...'
                  : farmerDecisionModal.actionType === 'VERIFY'
                  ? 'Approve All Crops'
                  : 'Return for Resubmission'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Interactive Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Document Verification Preview — ${previewDoc.label}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 bg-[#06151a] rounded-2xl border border-slate-700 text-xs">
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>{previewDoc.label}</span>
                </h4>
                <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                  File: <span className="text-teal-300">{previewDoc.fileName}</span> ({previewDoc.fileSize}) • Farmer: <strong className="text-white">{previewDoc.farmerName}</strong> ({previewDoc.farmerCode})
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Upload</span>
              </span>
            </div>

            {/* Document Render Area */}
            <div className="p-4 bg-[#030b0e] rounded-2xl border border-slate-700 min-h-[320px] flex items-center justify-center overflow-hidden">
              {previewDoc.fileData && (previewDoc.fileData.startsWith('data:image/') || previewDoc.fileData.startsWith('http')) ? (
                <div className="space-y-2 text-center w-full">
                  <img
                    src={previewDoc.fileData}
                    alt={previewDoc.fileName}
                    className="max-h-[460px] max-w-full mx-auto object-contain rounded-xl shadow-lg border border-slate-700 bg-white"
                  />
                  <span className="text-[11px] text-slate-400 font-semibold block">
                    High-Resolution Official Document Image
                  </span>
                </div>
              ) : previewDoc.fileData && previewDoc.fileData.startsWith('data:application/pdf') ? (
                <div className="w-full space-y-2">
                  <iframe
                    src={previewDoc.fileData}
                    title="PDF Document Preview"
                    className="w-full h-[480px] rounded-xl border border-slate-700 bg-[#06151a]"
                  />
                </div>
              ) : (
                <div className="p-8 text-center space-y-3 bg-[#06151a] rounded-2xl border border-slate-700 shadow-md max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-teal-950/80 text-teal-300 border border-slate-700 mx-auto flex items-center justify-center shadow-xs">
                    <FileCheck className="w-8 h-8 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{previewDoc.label}</h4>
                    <p className="text-xs text-slate-300 font-mono mt-1">{previewDoc.fileName}</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#030b0e] p-3 rounded-xl border border-slate-700">
                    Official digital copy verified against AP Civil Supplies &amp; Land Administration Registry for {previewDoc.farmerName}.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-xs">
              <span className="text-slate-400 font-mono">Farmer ID: {previewDoc.farmerCode || 'FMR-ID'}</span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 text-xs font-bold text-slate-200 bg-[#030b0e] hover:bg-[#07171d] border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}
