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
import StatusBadge from '../../components/common/StatusBadge';
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
  MessageSquare,
  LandPlot,
  Eye
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('parcels'); // 'parcels' | 'farmers' | 'crops'

  // Modals
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

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

  // Handle Land parcel verification decision
  const handleParcelActionComplete = async (landId, actionType, comment, issuesPayload = []) => {
    try {
      let endpoint = `/officer/lands/${landId}/verify`;
      if (actionType === 'RETURN') endpoint = `/officer/lands/${landId}/return`;
      if (actionType === 'REJECT') endpoint = `/officer/lands/${landId}/reject`;

      const res = await apiClient.put(endpoint, {
        comment,
        reason: comment,
        issues: issuesPayload,
      });

      if (res.data.success) {
        if (actionType === 'VERIFY') {
          try { confetti({ particleCount: 70, spread: 60 }); } catch (e) {}
          setActionSuccess('Land parcel and all associated crops verified successfully!');
        } else if (actionType === 'RETURN') {
          setActionSuccess('Land parcel returned for correction with targeted issues sent to the farmer.');
        } else {
          setActionSuccess('Land parcel application rejected.');
        }
        setTimeout(() => setActionSuccess(''), 4500);
        fetchDashboard();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to complete officer decision',
      };
    }
  };

  const officer = dashboardData?.officer || user?.profile || {};
  const mandal = dashboardData?.mandal || officer.mandal || 'Penamaluru';
  const deadline = dashboardData?.deadline;
  const stats = dashboardData?.stats || { pending: 0, verified: 0, returned: 0, rejected: 0, totalParcels: 0, totalCrops: 0 };
  const landApplications = dashboardData?.landApplications || [];
  const farmerApplications = dashboardData?.farmerApplications || [];
  const pendingCrops = dashboardData?.pendingApplications || [];

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

      {/* STATS SUMMARY CARDS (STRICTLY LAND/PARCEL LEVEL) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.pending}{' '}
            <span className="text-sm font-semibold text-slate-400">Parcels</span>
          </p>
          <span className="text-[11px] text-teal-300/90 font-medium block truncate">
            {stats.totalCrops} Crops total across parcels
          </span>
        </div>

        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>Verified &amp; Certified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.verified}{' '}
            <span className="text-sm font-semibold text-slate-400">Parcels</span>
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Passed official survey audit</span>
        </div>

        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Resubmit Needed</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.returned}{' '}
            <span className="text-sm font-semibold text-slate-400">Parcels</span>
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Action required by farmer</span>
        </div>

        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.rejected}{' '}
            <span className="text-sm font-semibold text-slate-400">Parcels</span>
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Non-compliant records</span>
        </div>
      </div>

      {/* Main Section: Verifications Queue */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <LandPlot className="w-6 h-6 text-teal-400" />
              <span>Land Verification Cases ({mandal} Mandal)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verification happens at the Land Parcel level. Inspect cadastral data, attached documents, and verify all registered crops inside.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#030b0e] p-1 rounded-2xl border border-slate-700 text-xs self-start sm:self-center">
            <button
              type="button"
              onClick={() => setViewMode('parcels')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'parcels'
                  ? 'bg-teal-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LandPlot className="w-3.5 h-3.5" />
              <span>Land Parcels ({landApplications.length})</span>
            </button>

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
          </div>
        </div>

        {/* Applications Queue Content */}
        {loading ? (
          <LoadingSpinner message={`Fetching land verification cases for ${mandal} Mandal...`} />
        ) : landApplications.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={`All clear in ${mandal} Mandal!`}
            description="There are currently no land parcels awaiting verification in your mandal jurisdiction."
            actionText="Check Verified Archive"
            onAction={() => navigate('/officer/archive')}
          />
        ) : viewMode === 'parcels' ? (

          /* ================= 1. LAND PARCEL VERIFICATION CASES QUEUE ================= */
          <div className="space-y-4">
            {landApplications.map((parcelApp) => {
              const cropsList = parcelApp.crops || [];
              const farmerDoc = parcelApp.farmer || {};
              const userContact = parcelApp.user || {};
              const docStatus = parcelApp.documentsStatus || {};

              return (
                <div
                  key={parcelApp._id}
                  className="glass-card bg-[#06151a]/95 rounded-3xl p-5 sm:p-6 border border-slate-700 hover:border-teal-400/80 transition-all shadow-xl space-y-4"
                >
                  {/* Parcel Header */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-700">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-[#030b0e] text-teal-400 border border-slate-700 flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">
                        <LandPlot className="w-6 h-6 text-teal-400" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-lg text-white font-mono">
                            Survey No. {parcelApp.surveyNumber}
                          </h3>
                          <span className="text-xs font-mono font-bold text-amber-300 bg-[#030b0e] px-2.5 py-0.5 rounded-lg border border-amber-500/40">
                            {parcelApp.landId}
                          </span>
                          <span className="text-xs font-bold text-slate-300 bg-[#030b0e] px-2.5 py-0.5 rounded-lg border border-slate-700">
                            {parcelApp.totalArea} Acres ({parcelApp.ownershipType || 'Owned'})
                          </span>
                          <StatusBadge status={parcelApp.overallVerificationStatus} />
                          {parcelApp.resubmissionCount > 0 && (
                            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                              parcelApp.resubmissionCount >= 3
                                ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                                : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                            }`}>
                              Attempt {parcelApp.resubmissionCount}/3
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium">
                          <span>Farmer: <strong className="text-white">{userContact.name || 'Farmer Name'}</strong> ({parcelApp.farmerCode})</span>
                          <span>•</span>
                          <span>{parcelApp.village}, <strong className="text-teal-300">{parcelApp.mandal} Mandal</strong></span>
                          <span>•</span>
                          <span>Phone: <strong className="text-white">{userContact.phone || '+91...'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => navigate(`/officer/crops/${parcelApp._id}`)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-slate-950" />
                        <span>Review Full Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Attached Documents & Crops Inside Parcel */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                    {/* Documents Status */}
                    <div className="md:col-span-5 p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 space-y-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Mandatory Documents
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                          docStatus.aadhaar ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        }`}>
                          {docStatus.aadhaar ? '✓ Aadhaar' : '✕ Aadhaar Missing'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                          docStatus.passbook ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        }`}>
                          {docStatus.passbook ? '✓ Bank Passbook' : '✕ Passbook Missing'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                          docStatus.landRecord ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        }`}>
                          {docStatus.landRecord ? '✓ Land Title (1-B)' : '✕ 1-B Missing'}
                        </span>
                      </div>
                    </div>

                    {/* Crops in this Parcel */}
                    <div className="md:col-span-7 p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Crops on Parcel ({cropsList.length})
                        </span>
                        <span className="text-[11px] font-bold text-teal-300">
                          {parcelApp.cultivatedAreaTotal} / {parcelApp.totalArea} Acres allocated
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {cropsList.length > 0 ? (
                          cropsList.map((crop) => (
                            <div
                              key={crop._id}
                              className="px-3 py-1.5 bg-[#06151a] rounded-xl border border-emerald-500/30 flex items-center gap-2 text-xs"
                            >
                              <span className="font-extrabold text-white">🌱 {crop.cropName}</span>
                              <span className="text-emerald-300 font-bold">({crop.cultivatedArea} Ac)</span>
                              <span className="text-[10px] text-slate-400 font-mono">{crop.season}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-500 text-xs italic">No crops recorded yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Open Issues Indicator (Waiting for farmer to correct and resubmit) */}
                  {parcelApp.overallVerificationStatus === 'RESUBMIT_NEEDED' && (
                    <div className="p-3 bg-amber-950/60 border border-amber-500/50 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="font-bold">
                          ⚠️ Action Required from Farmer: {parcelApp.landIssuesCount > 0 && `${parcelApp.landIssuesCount} on Land/Docs`}{parcelApp.landIssuesCount > 0 && parcelApp.cropIssuesCount > 0 && ', '}{parcelApp.cropIssuesCount > 0 && `${parcelApp.cropIssuesCount} on Crops`}
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-300 font-mono font-bold">
                        Status: RESUBMIT_NEEDED
                      </span>
                    </div>
                  )}

                  {/* Resubmitted Callout (Farmer has corrected and resubmitted, ready for officer verification) */}
                  {parcelApp.overallVerificationStatus === 'PENDING_VERIFICATION' && parcelApp.resubmittedIssuesCount > 0 && (
                    <div className="p-3 bg-teal-950/60 border border-teal-500/50 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-teal-200">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span className="font-bold">
                          ✨ Corrections Resubmitted by Farmer — Ready for Officer Review &amp; Verification
                        </span>
                      </div>
                      <span className="text-[11px] text-teal-300 font-mono font-bold">
                        Status: PENDING_VERIFICATION
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (

          /* ================= 2. GROUPED BY FARMER VIEW ================= */
          <div className="space-y-5">
            {farmerApplications.map((farmerApp) => (
              <FarmerVerificationCard
                key={farmerApp.farmerId}
                farmerApp={farmerApp}
                onViewDoc={(doc) => setPreviewDoc(doc)}
                onVerifyFarmer={() => {
                  if (farmerApp.parcels?.length > 0) {
                    setSelectedParcel(farmerApp.parcels[0]);
                    setReviewModalOpen(true);
                  }
                }}
                onReturnFarmer={() => {
                  if (farmerApp.parcels?.length > 0) {
                    setSelectedParcel(farmerApp.parcels[0]);
                    setReviewModalOpen(true);
                  }
                }}
                onRejectFarmer={() => {
                  if (farmerApp.parcels?.length > 0) {
                    setSelectedParcel(farmerApp.parcels[0]);
                    setReviewModalOpen(true);
                  }
                }}
                onReviewCrop={(crop) => navigate(`/officer/crops/${crop.landId?._id || crop._id}`)}
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

      {/* Decision Action Modal */}
      {reviewModalOpen && selectedParcel && (
        <ReviewActionModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedParcel(null);
          }}
          application={selectedParcel}
          onActionComplete={handleParcelActionComplete}
        />
      )}

      {/* Export Report Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        mandal={mandal}
      />

      {/* Document Viewer Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.label || 'Official Document Viewer'}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#030b0e] rounded-2xl border border-slate-700 gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#06151a] text-teal-400 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-teal-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="text-white block font-bold text-sm truncate">{previewDoc.fileName}</strong>
                  <span className="text-slate-400 text-[11px] font-mono block mt-0.5">
                    {previewDoc.fileSize ? `Size: ${previewDoc.fileSize} • ` : ''}Official Verified Govt Document
                  </span>
                </div>
              </div>

              {previewDoc.fileData && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={previewDoc.fileData}
                    download={previewDoc.fileName || 'document.pdf'}
                    className="px-3.5 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (!previewDoc.fileData) return;
                      if (previewDoc.fileData.startsWith('data:')) {
                        try {
                          const arr = previewDoc.fileData.split(',');
                          const mime = arr[0].match(/:(.*?);/)[1];
                          const bstr = atob(arr[1]);
                          let n = bstr.length;
                          const u8arr = new Uint8Array(n);
                          while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                          }
                          const blob = new Blob([u8arr], { type: mime });
                          const blobUrl = URL.createObjectURL(blob);
                          window.open(blobUrl, '_blank');
                          return;
                        } catch (e) {
                          console.error(e);
                        }
                      }
                      const win = window.open();
                      if (win) {
                        win.document.write(
                          `<iframe src="${previewDoc.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                        );
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#06151a] border border-slate-700 hover:bg-[#0c242c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                    <span>Open in New Tab</span>
                  </button>
                </div>
              )}
            </div>

            {/* Document Content Rendering */}
            <div className="p-4 bg-[#030b0e] rounded-2xl border border-slate-700 min-h-[380px] flex items-center justify-center overflow-hidden">
              {previewDoc.fileData && (previewDoc.fileData.startsWith('data:image/') || previewDoc.fileData.startsWith('http') || (previewDoc.fileType && previewDoc.fileType.startsWith('image/'))) ? (
                <div className="space-y-2 text-center w-full">
                  <img
                    src={previewDoc.fileData}
                    alt={previewDoc.fileName}
                    className="max-h-[520px] max-w-full mx-auto object-contain rounded-xl shadow-lg border border-slate-700 bg-white"
                  />
                  <span className="text-[11px] text-slate-400 font-semibold block">
                    Official Document Image Preview
                  </span>
                </div>
              ) : previewDoc.fileData && (previewDoc.fileData.startsWith('data:application/pdf') || (previewDoc.fileName && previewDoc.fileName.toLowerCase().endsWith('.pdf'))) ? (
                <div className="w-full space-y-2">
                  <iframe
                    src={previewDoc.fileData}
                    title={previewDoc.fileName || 'PDF Document Preview'}
                    className="w-full h-[540px] rounded-xl border border-slate-700 bg-slate-900"
                  />
                </div>
              ) : previewDoc.fileData ? (
                <div className="w-full space-y-2 text-center">
                  <iframe
                    src={previewDoc.fileData}
                    title={previewDoc.fileName || 'Document Preview'}
                    className="w-full h-[480px] rounded-xl border border-slate-700 bg-slate-900"
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
                    Document record is registered in government registry. No direct digital file data was attached.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 text-xs font-bold text-slate-300 bg-[#030b0e] hover:bg-[#07171d] border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
