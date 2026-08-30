import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import ReviewActionModal from '../../components/officer/ReviewActionModal';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  User,
  MapPin,
  FileCheck,
  Calendar,
  Layers,
  FlaskConical,
  Bug,
  ShieldCheck,
  FileText,
  Eye,
  CheckCircle2,
  RotateCcw,
  XCircle,
  History,
  AlertCircle,
  ExternalLink,
  Download,
  LandPlot,
  Building2,
  Sprout,
  Info,
  Clock
} from 'lucide-react';

export default function CropReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [land, setLand] = useState(null);
  const [farmer, setFarmer] = useState({});
  const [farmerProfile, setFarmerProfile] = useState({});
  const [documents, setDocuments] = useState({});
  const [crops, setCrops] = useState([]);
  const [issues, setIssues] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/officer/lands/${id}`);
      if (res.data.success) {
        setLand(res.data.land);
        setFarmer(res.data.farmer || {});
        setFarmerProfile(res.data.farmerProfile || {});
        setDocuments(res.data.documents || {});
        setCrops(res.data.crops || []);
        setIssues(res.data.issues || []);
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Error fetching verification case details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const handleActionComplete = async (targetId, actionType, comment, issuesPayload = []) => {
    try {
      let endpoint = `/officer/lands/${land?._id || targetId}/verify`;
      if (actionType === 'RETURN') endpoint = `/officer/lands/${land?._id || targetId}/return`;
      if (actionType === 'REJECT') endpoint = `/officer/lands/${land?._id || targetId}/reject`;

      const res = await apiClient.put(endpoint, {
        comment,
        reason: comment,
        issues: issuesPayload,
      });

      if (res.data.success) {
        if (actionType === 'VERIFY') {
          try { confetti({ particleCount: 80, spread: 70 }); } catch (e) {}
          setActionSuccess('Land parcel and all associated crops verified and certified successfully!');
        } else if (actionType === 'RETURN') {
          setActionSuccess('Land parcel returned for correction with targeted issues sent to the farmer.');
        } else {
          setActionSuccess('Land parcel application rejected.');
        }

        fetchApplicationDetails();
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

  if (loading) {
    return <LoadingSpinner message="Loading land parcel verification case & documents..." fullScreen />;
  }

  if (!land) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-slate-400">Land verification case not found.</p>
        <Link to="/officer/dashboard" className="text-xs font-bold text-teal-400 mt-2 inline-block">
          ← Back to Officer Dashboard
        </Link>
      </div>
    );
  }

  const openIssues = issues.filter((i) => i.status !== 'RESOLVED');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Status */}
      <div className="flex items-center justify-between">
        <Link
          to="/officer/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-teal-300 bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">Overall Case Status:</span>
          <StatusBadge status={land.overallVerificationStatus || 'PENDING_VERIFICATION'} />
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/80 text-emerald-300 rounded-2xl text-sm border border-emerald-500/50 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Header Banner: Land Parcel & Farmer Overview */}
      <div className="bg-[#06151a]/95 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-[#030b0e] px-2.5 py-0.5 rounded-md border border-slate-700">
              Land Verification Case
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-[#030b0e] px-2.5 py-0.5 rounded-md border border-amber-500/40">
              {land.landId || 'LND'}
            </span>
            <span className="text-[10px] font-bold text-slate-300 bg-[#030b0e] px-2.5 py-0.5 rounded-md border border-slate-700">
              {land.totalArea} Acres ({land.ownershipType || 'Owned'})
            </span>
            {land.resubmissionCount > 0 && (
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                land.resubmissionCount >= 3
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
              }`}>
                Correction Cycle: {land.resubmissionCount} of 3
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Survey No. {land.surveyNumber} — {farmer.name || 'Farmer Name'}
          </h1>

          <p className="text-xs text-slate-300 font-mono">
            Village: <strong className="text-white">{land.village || farmerProfile.village}</strong> • Mandal: <strong className="text-teal-300">{land.mandal || farmerProfile.mandal}</strong> • Farmer ID: <strong className="text-teal-300">{farmerProfile.farmerId || 'FMR'}</strong>
          </p>
        </div>

        {/* Verification Action Decision Trigger */}
        <button
          type="button"
          onClick={() => setReviewModalOpen(true)}
          className="w-full lg:w-auto px-8 py-3.5 btn-glow-primary text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <FileCheck className="w-5 h-5 text-slate-950" />
          <span>Make Verification Decision</span>
        </button>
      </div>

      {/* Active Verification Issues Banner (if any) */}
      {openIssues.length > 0 && (
        <div className="p-5 bg-amber-950/60 border border-amber-500/50 rounded-3xl space-y-3 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <h3 className="font-extrabold text-sm text-amber-200 uppercase tracking-wider">
              {openIssues.length} Active Verification Issue(s) on this Land Parcel
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {openIssues.map((issue) => (
              <div
                key={issue._id}
                className="p-3.5 bg-[#030b0e] border border-amber-500/40 rounded-2xl text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-300 flex items-center gap-1.5">
                    {issue.issueLevel === 'LAND' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-900/80 text-amber-200 text-[10px] font-bold">
                        📄 Land / Document Level
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 text-[10px] font-bold">
                        🌱 Crop Specific
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    {issue.status}
                  </span>
                </div>
                <p className="text-white font-medium">"{issue.description}"</p>
                {issue.farmerComment && (
                  <p className="text-[11px] text-teal-300 bg-[#06151a] p-1.5 rounded-lg">
                    Farmer Resubmission Note: {issue.farmerComment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cadastral Land Details & Registered Crops */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Cadastral Land Parcel Details */}
          <div className="bg-[#06151a]/95 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-teal-300 flex items-center gap-2 border-b border-slate-700 pb-3">
              <LandPlot className="w-4 h-4 text-teal-400" />
              Cadastral Land Parcel Information
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#030b0e] rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Survey Number</span>
                <strong className="text-white text-sm font-mono">{land.surveyNumber}</strong>
              </div>
              <div className="p-3 bg-[#030b0e] rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Land Area</span>
                <strong className="text-white text-sm">{land.totalArea} {land.areaUnit || 'Acres'}</strong>
              </div>
              <div className="p-3 bg-[#030b0e] rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Ownership Status</span>
                <strong className="text-white text-xs">{land.ownershipType || 'Owned'}</strong>
              </div>
              <div className="p-3 bg-[#030b0e] rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                <strong className="text-white text-xs truncate block">{land.village}, {land.mandal} Mandal</strong>
              </div>
            </div>

            {/* Farmer Personal Contact */}
            <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 text-xs space-y-1.5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Farmer Profile &amp; Contact</span>
              <p className="text-white font-bold text-sm">{farmer.name} <span className="text-slate-400 font-normal">({farmerProfile.farmerId})</span></p>
              <div className="flex flex-wrap gap-4 text-slate-300 text-[11px] pt-0.5">
                <span>Phone: <strong className="text-white">{farmer.phone || 'N/A'}</strong></span>
                <span>Email: <strong className="text-white">{farmer.email || 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          {/* 2. Registered Crops on this Land Parcel */}
          <div className="bg-[#06151a]/95 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-teal-300 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-teal-400" />
                <span>Registered Crops on this Parcel ({crops.length})</span>
              </h3>
              <span className="text-xs font-mono font-bold text-teal-300 bg-[#030b0e] px-2.5 py-0.5 rounded-lg border border-slate-700">
                Total Cultivated: {Number(crops.reduce((s, c) => s + (Number(c.cultivatedArea) || 0), 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })} / {land.totalArea} Ac
              </span>
            </div>

            {crops.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No crops currently registered on this parcel.</p>
            ) : (
              <div className="space-y-3.5">
                {crops.map((crop, idx) => {
                  const cropSpecificIssues = issues.filter((i) => i.cropId?.toString() === crop._id.toString() && i.status !== 'RESOLVED');

                  return (
                    <div
                      key={crop._id || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        cropSpecificIssues.length > 0
                          ? 'bg-amber-950/40 border-amber-500/50'
                          : 'bg-[#030b0e] border-slate-700'
                      } space-y-3`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                            🌱
                          </div>
                          <div>
                            <strong className="text-white font-extrabold text-sm block">
                              {crop.cropName}
                            </strong>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {crop.cropCategory || 'Cereals'} • Reg #{crop.registrationId}
                            </span>
                          </div>
                        </div>

                        <StatusBadge status={crop.status} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                        <div className="p-2 bg-[#06151a] rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px] font-bold">Cultivated Area</span>
                          <strong className="text-white">{Number(crop.cultivatedArea).toLocaleString('en-IN', { maximumFractionDigits: 2 })} {crop.areaUnit || 'Acres'}</strong>
                        </div>
                        <div className="p-2 bg-[#06151a] rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px] font-bold">Season</span>
                          <strong className="text-white">{crop.season} ({crop.year})</strong>
                        </div>
                        <div className="p-2 bg-[#06151a] rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px] font-bold">Sowing Date</span>
                          <strong className="text-white">{formatDate(crop.sowingDate)}</strong>
                        </div>
                        <div className="p-2 bg-[#06151a] rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px] font-bold">Irrigation</span>
                          <strong className="text-white">{crop.irrigationType || 'Borewell'}</strong>
                        </div>
                        <div className="p-2 bg-[#06151a] rounded-xl border border-slate-800 col-span-2">
                          <span className="text-slate-400 block text-[10px] font-bold">Inputs Declared</span>
                          <span className="text-slate-200 truncate block">{crop.fertilizersUsed || 'Standard NPK'}</span>
                        </div>
                      </div>

                      {cropSpecificIssues.length > 0 && (
                        <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-500/40 text-xs space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                            Officer Requested Correction:
                          </span>
                          {cropSpecificIssues.map((iss) => (
                            <p key={iss._id} className="text-white font-medium pl-4">
                              • {iss.description?.replace(/^\[CROP\]\s*/i, '')}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attached Verification Documents & History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Attached Documents */}
          <div className="bg-[#06151a]/95 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-teal-300 flex items-center gap-2 border-b border-slate-700 pb-3">
              <FileText className="w-4 h-4 text-teal-400" />
              Attached Documents for Verification
            </h3>

            <div className="space-y-3">
              {/* Aadhaar Card */}
              <div className="p-3.5 bg-[#030b0e] border border-slate-700 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileCheck className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <strong className="text-white block font-bold truncate">1. Aadhaar ID Proof</strong>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {documents.aadhaarDoc?.fileName || 'aadhaar_document.pdf'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewDoc({
                      label: '1. Aadhaar ID Proof',
                      fileName: documents.aadhaarDoc?.fileName || 'aadhaar_card.pdf',
                      fileType: documents.aadhaarDoc?.fileType || 'image/svg+xml',
                      fileData: documents.aadhaarDoc?.fileData || '',
                      fileSize: documents.aadhaarDoc?.fileSize || '1.4 MB',
                      docType: 'aadhaar',
                    })
                  }
                  className="px-3 py-1.5 text-xs font-bold text-teal-300 bg-[#06151a] hover:bg-[#0c242c] border border-slate-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors flex-shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-400" /> View
                </button>
              </div>

              {/* Passbook */}
              <div className="p-3.5 bg-[#030b0e] border border-slate-700 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileCheck className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <strong className="text-white block font-bold truncate">2. Bank DBT Passbook</strong>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {documents.passbookDoc?.fileName || 'bank_passbook.pdf'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewDoc({
                      label: '2. Bank DBT Passbook',
                      fileName: documents.passbookDoc?.fileName || 'bank_passbook.pdf',
                      fileType: documents.passbookDoc?.fileType || 'image/svg+xml',
                      fileData: documents.passbookDoc?.fileData || '',
                      fileSize: documents.passbookDoc?.fileSize || '920 KB',
                      docType: 'passbook',
                    })
                  }
                  className="px-3 py-1.5 text-xs font-bold text-teal-300 bg-[#06151a] hover:bg-[#0c242c] border border-slate-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors flex-shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-400" /> View
                </button>
              </div>

              {/* Land Record (1-B) */}
              <div className="p-3.5 bg-[#030b0e] border border-slate-700 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileCheck className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <strong className="text-white block font-bold truncate">3. Land Title (1-B / RoR)</strong>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {documents.landRecordDoc?.fileName || 'land_record_1b.pdf'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewDoc({
                      label: '3. Land Title Record (1-B / RoR / Adangal)',
                      fileName: documents.landRecordDoc?.fileName || 'land_record_1b.pdf',
                      fileType: documents.landRecordDoc?.fileType || 'image/svg+xml',
                      fileData: documents.landRecordDoc?.fileData || '',
                      fileSize: documents.landRecordDoc?.fileSize || '2.1 MB',
                      docType: 'landRecord',
                    })
                  }
                  className="px-3 py-1.5 text-xs font-bold text-teal-300 bg-[#06151a] hover:bg-[#0c242c] border border-slate-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors flex-shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-400" /> View
                </button>
              </div>
            </div>
          </div>

          {/* Verification History & Audit Trail */}
          <div className="bg-[#06151a]/95 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-teal-300 flex items-center gap-2 border-b border-slate-700 pb-3">
              <History className="w-4 h-4 text-teal-400" />
              Verification History &amp; Audit Trail
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No history events recorded yet.</p>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                {history.map((item, idx) => {
                  const matchedCrop = item.registrationId
                    ? crops.find((c) => c._id?.toString() === item.registrationId?.toString())
                    : null;
                  const isLandLevel = !matchedCrop;

                  return (
                    <div key={item._id || idx} className="flex items-start gap-3 relative text-xs">
                      <div className="w-7 h-7 rounded-full bg-[#030b0e] border border-slate-700 flex items-center justify-center flex-shrink-0 z-10 text-teal-400 shadow-xs">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 bg-[#030b0e] p-3 rounded-2xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                item.action === 'VERIFIED'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                  : item.action === 'SUBMITTED' || item.action === 'RESUBMITTED'
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                  : item.action === 'RETURNED_FOR_CORRECTION'
                                  ? 'bg-orange-950/80 text-orange-300 border border-orange-500/40'
                                  : item.action === 'REJECTED'
                                  ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                                  : 'bg-slate-900 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {item.action === 'DRAFT_RECORDED' ? 'RECORD CREATED' : item.action}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isLandLevel
                                  ? 'bg-[#06151a] text-cyan-300 border-cyan-800/60'
                                  : 'bg-[#06151a] text-teal-300 border-teal-800/60'
                              }`}
                            >
                              {isLandLevel ? `📄 Parcel #${land?.surveyNumber || 'Land'}` : `🌱 ${matchedCrop.cropName}`}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(item.timestamp || item.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{item.comment || 'Action recorded'}</p>
                        <span className="text-[10px] text-teal-400 block font-semibold">
                          By: {item.officerName || 'Agriculture Officer'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {reviewModalOpen && (
        <ReviewActionModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          application={{
            ...land,
            crops,
            farmerId: farmerProfile,
            user: farmer,
            issues
          }}
          onActionComplete={handleActionComplete}
        />
      )}

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
