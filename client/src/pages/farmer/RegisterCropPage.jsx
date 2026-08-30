import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import DocumentUploader from '../../components/farmer/DocumentUploader';
import CropDetailsModal from '../../components/farmer/CropDetailsModal';
import ParcelCropsModal from '../../components/farmer/ParcelCropsModal';
import StatusBadge from '../../components/common/StatusBadge';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  FileCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  LandPlot,
  ShieldCheck,
  Eye,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  MapPin,
  Sprout,
  AlertCircle,
  ExternalLink,
  Layers,
  Lock,
  Send
} from 'lucide-react';

export default function RegisterCropPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [farmerProfile, setFarmerProfile] = useState(null);
  const [existingLands, setExistingLands] = useState([]);
  const [allFarmerCrops, setAllFarmerCrops] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [mandalDeadlines, setMandalDeadlines] = useState([]);
  const [selectedMandal, setSelectedMandal] = useState(searchParams.get('mandal') || 'All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState('');

  // Expand / collapse documents section
  const [showDocUploader, setShowDocUploader] = useState(false);

  // Selected existing crop modal state
  const [selectedCropModal, setSelectedCropModal] = useState(null);

  // Land Parcel Crops Pop-up Modal State
  const [parcelCropsModalOpen, setParcelCropsModalOpen] = useState(false);
  const [activeParcelForModal, setActiveParcelForModal] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, cropsRes] = await Promise.all([
        apiClient.get('/farmers/profile'),
        apiClient.get('/farmers/crops').catch(() => ({ data: { crops: [] } }))
      ]);

      if (profileRes.data.success) {
        setFarmerProfile(profileRes.data.profile);
        setDeadline(profileRes.data.deadline);
        setIsDeadlinePassed(profileRes.data.isDeadlinePassed || false);
        setMandalDeadlines(profileRes.data.mandalDeadlines || []);

        const lands = profileRes.data.lands || [];
        setExistingLands(lands);

        const crops = cropsRes.data?.crops || [];
        setAllFarmerCrops(crops);
      }
    } catch (err) {
      console.error('Error fetching farmer profile, lands and crops:', err);
      setError('Failed to load official registration records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const paramMandal = searchParams.get('mandal');
    if (paramMandal) {
      setSelectedMandal(paramMandal);
    }
  }, [searchParams]);

  const handleDocumentsUpdated = (updatedDocs) => {
    if (farmerProfile) {
      setFarmerProfile({ ...farmerProfile, documents: updatedDocs });
    }
  };

  // Check 3 required verification documents
  const hasAadhaar = Boolean(farmerProfile?.documents?.aadhaarDoc?.fileName);
  const hasPassbook = Boolean(farmerProfile?.documents?.passbookDoc?.fileName);
  const hasLandRecord = Boolean(farmerProfile?.documents?.landRecordDoc?.fileName);
  const hasAllDocs = hasAadhaar && hasPassbook && hasLandRecord;

  // Build unique parcel map grouping all crops by land parcel
  const parcelMap = {};

  existingLands.forEach((l) => {
    const key = l._id || l.landId;
    parcelMap[key] = {
      _id: l._id,
      landId: l.landId || `LND-${l.surveyNumber}`,
      surveyNumber: l.surveyNumber,
      village: l.village || farmerProfile?.village || 'Kankipadu',
      mandal: l.mandal || farmerProfile?.mandal || 'Penamaluru',
      district: l.district || farmerProfile?.district || 'Vijayawada',
      totalArea: l.totalArea || 0,
      areaUnit: l.areaUnit || 'Acres',
      ownershipType: l.ownershipType || 'Owned',
      crops: []
    };
  });

  allFarmerCrops.forEach((c) => {
    const landObj = c.landId;
    const landKey = landObj?._id || landObj?.landId;
    // Find matching land parcel in map
    let matchKey = landKey && parcelMap[landKey] ? landKey : null;
    if (!matchKey) {
      matchKey = Object.keys(parcelMap).find(k => parcelMap[k].surveyNumber === c.surveyNumber);
    }

    if (matchKey && parcelMap[matchKey]) {
      parcelMap[matchKey].crops.push(c);
    } else {
      const fallbackKey = landKey || `legacy-${c.surveyNumber}`;
      if (!parcelMap[fallbackKey]) {
        parcelMap[fallbackKey] = {
          _id: landObj?._id || null,
          landId: landObj?.landId || `LND-${c.surveyNumber}`,
          surveyNumber: c.surveyNumber,
          village: landObj?.village || farmerProfile?.village || 'Kankipadu',
          mandal: landObj?.mandal || farmerProfile?.mandal || 'Penamaluru',
          district: landObj?.district || farmerProfile?.district || 'Vijayawada',
          totalArea: c.totalLandArea || c.cultivatedArea || 0,
          areaUnit: c.areaUnit || 'Acres',
          ownershipType: c.ownershipType || 'Owned',
          crops: []
        };
      }
      parcelMap[fallbackKey].crops.push(c);
    }
  });

  const parcelList = Object.values(parcelMap);

  // Distinct mandals from farmer's lands
  const distinctMandals = Array.from(new Set(parcelList.map(p => p.mandal).filter(Boolean)));

  // Filter land parcels by selected mandal
  const displayedParcels = selectedMandal === 'All'
    ? parcelList
    : parcelList.filter(p => p.mandal && p.mandal.toLowerCase() === selectedMandal.toLowerCase());

  // Filter mandal deadlines by selected mandal
  const displayedDeadlines = selectedMandal === 'All'
    ? mandalDeadlines
    : mandalDeadlines.filter(md => md.mandal && md.mandal.toLowerCase() === selectedMandal.toLowerCase());

  // Selected mandal deadline info
  const selectedMandalDeadline = mandalDeadlines.find(
    d => d.mandal.toLowerCase() === selectedMandal.toLowerCase()
  );
  const isCurrentMandalDeadlinePassed = selectedMandalDeadline?.isDeadlinePassed || false;

  // Crops specifically for current selected mandal
  const mandalCrops = selectedMandal === 'All'
    ? allFarmerCrops
    : allFarmerCrops.filter(c => {
      const cropMandal = c.mandal || c.landId?.mandal;
      return cropMandal && cropMandal.toLowerCase() === selectedMandal.toLowerCase();
    });

  const draftCrops = mandalCrops.filter(c => c.status === 'DRAFT');
  const pendingCrops = mandalCrops.filter(c => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status));
  const returnedCrops = mandalCrops.filter(c => c.status === 'RETURNED_FOR_CORRECTION');
  const verifiedCrops = mandalCrops.filter(c => c.status === 'VERIFIED');

  const hasDraft = draftCrops.length > 0;
  const hasReturned = returnedCrops.length > 0;
  const hasPending = pendingCrops.length > 0;
  const isAllVerified = verifiedCrops.length > 0 && draftCrops.length === 0 && pendingCrops.length === 0 && returnedCrops.length === 0;

  // Submit all unsubmitted crops in this mandal to the Agriculture Officer
  const handleSubmitMandalRegistration = async () => {
    if (selectedMandal === 'All') {
      setError('Please select a specific Mandal to submit its official crop registration.');
      return;
    }

    if (!hasAllDocs) {
      setError('Please upload all 3 mandatory verification documents (Aadhaar Card, Bank Passbook, Land Title Record) before submitting for verification.');
      setShowDocUploader(true);
      return;
    }

    if (isCurrentMandalDeadlinePassed) {
      setError(`The registration deadline for ${selectedMandal} Mandal has expired. Submissions or resubmissions cannot be accepted after the deadline.`);
      return;
    }

    setSubmitting(true);
    setError('');
    setSubmitSuccessMessage('');

    try {
      const res = await apiClient.post('/farmers/submit-mandal-registration', {
        mandal: selectedMandal
      });

      if (res.data.success) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) { }

        setSubmitSuccessMessage(res.data.message || `Successfully submitted crop registration for ${selectedMandal} Mandal!`);
        await loadData();
      }
    } catch (err) {
      console.error('Submit mandal registration error:', err);
      setError(err.response?.data?.message || 'Failed to submit mandal registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Active crops for the currently selected parcel modal
  const activeParcelCrops = activeParcelForModal
    ? (parcelMap[activeParcelForModal._id || activeParcelForModal.landId]?.crops ||
      allFarmerCrops.filter(c => c.surveyNumber === activeParcelForModal.surveyNumber))
    : [];

  const handleOpenParcelModal = (parcel) => {
    setActiveParcelForModal(parcel);
    setParcelCropsModalOpen(true);
  };

  // Distinct visual palettes for each mandal notification
  const palettes = [
    {
      card: 'bg-gradient-to-r from-emerald-950/90 via-[#031d17] to-[#020f12] border-emerald-500/50 text-emerald-100 shadow-lg shadow-emerald-950/30',
      icon: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',
      badge: 'bg-[#02100d] border-emerald-500/40 text-emerald-300',
      btn: 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-md shadow-emerald-500/20'
    },
    {
      card: 'bg-gradient-to-r from-amber-950/90 via-[#221804] to-[#120b02] border-amber-500/50 text-amber-100 shadow-lg shadow-amber-950/30',
      icon: 'bg-amber-900/80 text-amber-300 border-amber-500/40',
      badge: 'bg-[#120b02] border-amber-500/40 text-amber-300',
      btn: 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20'
    },
    {
      card: 'bg-gradient-to-r from-cyan-950/90 via-[#041c26] to-[#020f14] border-cyan-500/50 text-cyan-100 shadow-lg shadow-cyan-950/30',
      icon: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',
      badge: 'bg-[#020f14] border-cyan-500/40 text-cyan-300',
      btn: 'bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 shadow-md shadow-cyan-500/20'
    },
    {
      card: 'bg-gradient-to-r from-purple-950/90 via-[#1a0e2b] to-[#0d0517] border-purple-500/50 text-purple-100 shadow-lg shadow-purple-950/30',
      icon: 'bg-purple-900/80 text-purple-300 border-purple-500/40',
      badge: 'bg-[#0d0517] border-purple-500/40 text-purple-300',
      btn: 'bg-gradient-to-r from-purple-400 to-fuchsia-400 hover:from-purple-300 hover:to-fuchsia-300 text-slate-950 shadow-md shadow-purple-500/20'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Navigation */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Link
              to="/farmer/crops"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-teal-300 bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Farm Records
            </Link>
            <Link
              to="/farmer/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-slate-300 bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 transition-all"
            >
              Dashboard
            </Link>
          </div>

          {selectedMandal !== 'All' && (
            <button
              type="button"
              onClick={() => setSelectedMandal('All')}
              className="px-3 py-1 rounded-xl text-xs font-bold text-teal-300 bg-[#030b0e] hover:bg-[#0c242c] border border-teal-500/40 transition-all flex items-center gap-1 cursor-pointer"
            >
              ← View All Mandals ({parcelList.length})
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
              <span className="text-emerald-400">🌾</span>
              <span className="text-white font-extrabold">
                {selectedMandal !== 'All'
                  ? `${selectedMandal} Mandal — Crop Registration`
                  : 'Government Crop Registration Status'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              {selectedMandal !== 'All'
                ? `Official portal for registered land parcels and crop verification in ${selectedMandal} Mandal.`
                : 'Official view of your registered cadastral land parcels, DBT documents, and mandal verification records.'}
            </p>
          </div>

          {/* Dynamic Status Badge in Top Header */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold self-start sm:self-center shadow-md">
            {selectedMandal !== 'All' && isCurrentMandalDeadlinePassed && hasDraft ? (
              <div className="flex items-center gap-1.5 text-rose-300 bg-rose-950/90 border-rose-500/50">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Registration Closed • Deadline Expired</span>
              </div>
            ) : selectedMandal !== 'All' && hasDraft ? (
              <div className="flex items-center gap-1.5 text-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Draft • Ready for Submission</span>
              </div>
            ) : hasReturned ? (
              <div className="flex items-center gap-1.5 text-orange-300">
                <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                <span>Corrections Requested</span>
              </div>
            ) : isAllVerified ? (
              <div className="flex items-center gap-1.5 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified &amp; Certified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-teal-300">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Official View • Read Only</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MULTI-MANDAL REGISTRATION DEADLINE BANNERS */}
      <div className="space-y-3">
        {displayedDeadlines.length > 0 ? (
          displayedDeadlines.map((md, idx) => {
            const isPassed = md.isDeadlinePassed;
            const p = palettes[idx % palettes.length];

            return (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${isPassed
                    ? 'bg-rose-950/90 border-rose-600/60 text-rose-200'
                    : p.card
                  }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border ${isPassed ? 'bg-rose-900/80 text-rose-300 border-rose-500/50' : p.icon
                    }`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${p.badge}`}>
                        {md.mandal} Mandal Jurisdiction {md.landsCount > 0 ? `(${md.landsCount} Land Parcel${md.landsCount === 1 ? '' : 's'})` : ''}
                      </span>
                      {isPassed ? (
                        <span className="text-xs font-bold text-rose-300 bg-rose-900/80 px-2.5 py-0.5 rounded-full border border-rose-500/60 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Registration Closed
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/50 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Submissions Open
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-white mt-1">
                      <strong>{md.mandal} Mandal Deadline:</strong>{' '}
                      <span className="text-white font-mono">
                        {new Date(md.deadlineDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>{' '}
                      ({md.season} {md.year})
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isPassed
                        ? `Official crop registration window for ${md.mandal} Mandal has ended.`
                        : `Official registration is active. Only lands registered in ${md.mandal} Mandal are eligible for this portal.`}
                    </p>
                  </div>
                </div>

                {selectedMandal === 'All' && (
                  <button
                    type="button"
                    onClick={() => setSelectedMandal(md.mandal)}
                    className={`px-4 py-2 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${isPassed ? 'bg-rose-600 hover:bg-rose-500 text-white' : p.btn
                      }`}
                  >
                    <span>View {md.mandal} Lands →</span>
                  </button>
                )}
              </div>
            );
          })
        ) : null}
      </div>

      {/* Success Notification Banner */}
      {submitSuccessMessage && (
        <div className="p-4 bg-emerald-950/90 text-emerald-200 rounded-2xl text-xs sm:text-sm border border-emerald-500/50 flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{submitSuccessMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/80 text-rose-300 rounded-2xl text-xs sm:text-sm border border-rose-800 flex items-center gap-2 shadow-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. DEADLINE EXPIRED WARNING (If unsubmitted crops exist after deadline) */}
      {selectedMandal !== 'All' && isCurrentMandalDeadlinePassed && hasDraft && (
        <div className="p-5 rounded-3xl bg-rose-950/80 border border-rose-500/60 text-rose-100 shadow-xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-white">
              Registration Window Closed — Deadline Expired for {selectedMandal} Mandal
            </h4>
            <p className="text-xs text-rose-200">
              The official crop registration deadline for {selectedMandal} Mandal closed on{' '}
              <strong className="text-white font-mono">
                {selectedMandalDeadline ? new Date(selectedMandalDeadline.deadlineDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'the deadline date'}
              </strong>. New crop submissions cannot be accepted for this season.
            </p>
          </div>
        </div>
      )}


      {/* 3. APPLICATION UNDER OFFICIAL REVIEW (After Farmer Submits) */}
      {selectedMandal !== 'All' && !hasDraft && hasPending && !hasReturned && (
        <div className="p-5 rounded-3xl bg-teal-950/60 border border-teal-500/40 text-teal-200 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#030b0e] text-teal-400 border border-teal-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-extrabold text-teal-300">
                ⏳ Application Under Official Review
              </h4>
              <p className="text-xs text-slate-300">
                Your crop registrations in {selectedMandal} Mandal have been submitted and are currently queued for verification by the Agriculture Officer for {selectedMandal} Mandal. This official view is read-only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. APPLICATION RETURNED FOR CORRECTION (Officer Requested Corrections) */}
      {hasReturned && (
        <div className="p-5 rounded-3xl bg-orange-950/70 border border-orange-500/50 text-orange-200 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#030b0e] text-orange-400 border border-orange-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-extrabold text-orange-300">
                ⚠️ Action Required: Corrections Requested by Agriculture Officer
              </h4>
              <p className="text-xs text-slate-300">
                The Agriculture Officer has reviewed your application and requested updates on {returnedCrops.length} crop(s). Click on the returned land parcel below to view officer remarks, make corrections, and re-submit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. FULLY VERIFIED BANNER */}
      {isAllVerified && (
        <div className="p-5 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#030b0e] text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-extrabold text-emerald-300">
                ✅ Crop Registration Verified &amp; Certified
              </h4>
              <p className="text-xs text-slate-300">
                All submitted crop entries {selectedMandal !== 'All' ? `in ${selectedMandal} Mandal` : ''} are verified and certified under Government DBT and Crop Insurance registries.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Farmer Identity Details */}
      <div className="bg-[#06151a]/95 rounded-3xl p-6 shadow-xl border border-slate-700 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
          <User className="w-5 h-5 text-teal-400" />
          <h3 className="font-extrabold text-base text-white">
            Farmer Identity Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Farmer Name
            </span>
            <strong className="text-sm text-white">{user?.name || 'Farmer'}</strong>
          </div>

          <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Mobile Number
            </span>
            <strong className="text-sm text-white font-mono">{user?.phone || '9876543210'}</strong>
          </div>

          <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Native Residential Location
            </span>
            <strong className="text-sm text-white">
              {farmerProfile?.village || 'Vijayawada'}{farmerProfile?.mandal ? `, ${farmerProfile.mandal} Mandal` : ''}
            </strong>
          </div>
        </div>
      </div>

      {/* Section 2: Uploaded Verification Documents Card */}
      <div className="bg-[#06151a]/95 rounded-3xl p-6 shadow-xl border border-slate-700 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-400" />
            <h3 className="font-extrabold text-base text-white">
              Government Verification Documents (3 Required)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowDocUploader(!showDocUploader)}
            className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>{showDocUploader ? 'Hide Document Uploader' : 'Manage / Re-upload Documents'}</span>
            {showDocUploader ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs ${hasAadhaar ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
            {hasAadhaar ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <div>
              <span className="font-bold block">1. Aadhaar ID Card</span>
              <span className="text-[10px] opacity-80">{hasAadhaar ? 'Uploaded & Verified' : 'Missing'}</span>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs ${hasPassbook ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
            {hasPassbook ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <div>
              <span className="font-bold block">2. Bank Passbook (DBT)</span>
              <span className="text-[10px] opacity-80">{hasPassbook ? 'Uploaded & Verified' : 'Missing'}</span>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs ${hasLandRecord ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
            {hasLandRecord ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <div>
              <span className="font-bold block">3. Land Title Record (1-B)</span>
              <span className="text-[10px] opacity-80">{hasLandRecord ? 'Uploaded & Verified' : 'Missing'}</span>
            </div>
          </div>
        </div>

        {showDocUploader && (
          <div className="pt-3 border-t border-slate-700">
            <DocumentUploader
              documents={farmerProfile?.documents}
              onDocumentsUpdated={handleDocumentsUpdated}
            />
          </div>
        )}
      </div>

      {/* Section 3: Registered Land Parcels on Record */}
      {selectedMandal !== 'All' ? (
        // Single Selected Mandal View (Photo 2 & 3)
        <div className="bg-[#06151a]/95 rounded-3xl p-6 shadow-xl border border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <LandPlot className="w-5 h-5 text-teal-400" />
              <h3 className="font-extrabold text-base text-white">
                {selectedMandal} Mandal — Land Parcels ({displayedParcels.length})
              </h3>
            </div>
            <span className="text-[11px] text-teal-300 font-medium">
              💡 Click any land parcel to view crops &amp; verification status
            </span>
          </div>

          {displayedParcels.length === 0 ? (
            <div className="p-8 text-center bg-[#030b0e] rounded-2xl border border-slate-700 space-y-2">
              <LandPlot className="w-10 h-10 text-teal-400/60 mx-auto" />
              <h4 className="text-sm font-bold text-white">
                No Land Parcels on Record for {selectedMandal} Mandal
              </h4>
              <p className="text-xs text-slate-400">
                You do not have any registered survey parcels situated in {selectedMandal} Mandal.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {displayedParcels.map((parcel) => {
                const cropsCount = parcel.crops.length;
                const hasReturned = parcel.crops.some(c => c.status === 'RETURNED_FOR_CORRECTION');
                const hasPending = parcel.crops.some(c => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status));
                const allVerified = cropsCount > 0 && parcel.crops.every(c => c.status === 'VERIFIED');

                return (
                  <div
                    key={parcel._id || parcel.landId}
                    onClick={() => handleOpenParcelModal(parcel)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between space-y-4 ${hasReturned
                        ? 'bg-orange-950/30 border-orange-500/60 hover:border-orange-400 shadow-lg'
                        : 'bg-[#030b0e] border-slate-700 hover:border-teal-400/80 hover:shadow-lg hover:shadow-teal-500/10'
                      }`}
                  >
                    <div className="space-y-3">
                      {/* Header Row: Land ID, Survey No, Ownership */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-teal-400 text-slate-950 font-mono text-xs font-black shadow-2xs">
                            {parcel.landId}
                          </span>
                          <h4 className="text-base font-extrabold text-white font-mono group-hover:text-teal-300 transition-colors">
                            Survey No. {parcel.surveyNumber}
                          </h4>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#06151a] text-slate-300 border border-slate-700 font-semibold flex-shrink-0">
                          {parcel.ownershipType || 'Owned'} Land
                        </span>
                      </div>

                      {/* Cadastral Location & Total Area */}
                      <div className="text-xs text-slate-300 space-y-1">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                          <span className="truncate">{parcel.village}, {parcel.mandal}</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Total Area: <strong className="text-white font-bold">{parcel.totalArea} {parcel.areaUnit}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Verification Status & Action Button */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      {hasReturned ? (
                        <span className="px-2.5 py-1 text-xs font-bold text-orange-300 bg-orange-950/80 border border-orange-500/50 rounded-xl flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5" /> Corrections Needed
                        </span>
                      ) : allVerified ? (
                        <span className="px-2.5 py-1 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : hasPending ? (
                        <span className="px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 rounded-xl flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending Verification
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-bold text-slate-400 bg-[#06151a] border border-slate-700 rounded-xl">
                          {cropsCount} {cropsCount === 1 ? 'Crop' : 'Crops'}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenParcelModal(parcel);
                        }}
                        className="px-3.5 py-1.5 bg-[#06151a] hover:bg-teal-950 text-teal-300 hover:text-teal-200 border border-teal-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1 group-hover:border-teal-400 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Crops &amp; Status ({cropsCount})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // All Mandals Grouped View: Every mandal rendered as its own section with its corresponding lands
        <div className="space-y-6">
          {distinctMandals.length === 0 ? (
            <div className="bg-[#06151a]/95 rounded-3xl p-8 text-center border border-slate-700 space-y-2">
              <LandPlot className="w-10 h-10 text-teal-400/60 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Registered Land Parcels Found</h4>
              <p className="text-xs text-slate-400">
                No land parcels are currently on record. Go to Farm Records to add your survey parcels.
              </p>
            </div>
          ) : (
            distinctMandals.map((mandalName, mIdx) => {
              const mandalLands = parcelList.filter(
                p => p.mandal && p.mandal.toLowerCase() === mandalName.toLowerCase()
              );
              const mDeadline = mandalDeadlines.find(
                d => d.mandal.toLowerCase() === mandalName.toLowerCase()
              );

              return (
                <div
                  key={mIdx}
                  className="bg-[#06151a]/95 rounded-3xl p-6 shadow-xl border border-slate-700 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <LandPlot className="w-5 h-5 text-teal-400" />
                      <h3 className="font-extrabold text-base text-white">
                        {mandalName} Mandal Jurisdiction ({mandalLands.length} Land Parcel{mandalLands.length === 1 ? '' : 's'})
                      </h3>
                      {mDeadline && (
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${mDeadline.isDeadlinePassed
                            ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                            : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                          }`}>
                          {mDeadline.isDeadlinePassed ? 'Registration Closed' : 'Registration Active'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-teal-300 font-medium">
                      💡 Showing only lands registered in {mandalName} Mandal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {mandalLands.map((parcel) => {
                      const cropsCount = parcel.crops.length;
                      const hasReturned = parcel.crops.some(c => c.status === 'RETURNED_FOR_CORRECTION');
                      const hasPending = parcel.crops.some(c => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status));
                      const allVerified = cropsCount > 0 && parcel.crops.every(c => c.status === 'VERIFIED');

                      return (
                        <div
                          key={parcel._id || parcel.landId}
                          onClick={() => handleOpenParcelModal(parcel)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between space-y-4 ${hasReturned
                              ? 'bg-orange-950/30 border-orange-500/60 hover:border-orange-400 shadow-lg'
                              : 'bg-[#030b0e] border-slate-700 hover:border-teal-400/80 hover:shadow-lg hover:shadow-teal-500/10'
                            }`}
                        >
                          <div className="space-y-3">
                            {/* Header Row: Land ID, Survey No, Ownership */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-teal-400 text-slate-950 font-mono text-xs font-black shadow-2xs">
                                  {parcel.landId}
                                </span>
                                <h4 className="text-base font-extrabold text-white font-mono group-hover:text-teal-300 transition-colors">
                                  Survey No. {parcel.surveyNumber}
                                </h4>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#06151a] text-slate-300 border border-slate-700 font-semibold flex-shrink-0">
                                {parcel.ownershipType || 'Owned'} Land
                              </span>
                            </div>

                            {/* Cadastral Location & Total Area */}
                            <div className="text-xs text-slate-300 space-y-1">
                              <p className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                                <span className="truncate">{parcel.village}, {parcel.mandal}</span>
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Total Area: <strong className="text-white font-bold">{parcel.totalArea} {parcel.areaUnit}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Verification Status & Action Button */}
                          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                            {hasReturned ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2.5 py-1 text-xs font-bold text-orange-300 bg-orange-950/80 border border-orange-500/50 rounded-xl flex items-center gap-1">
                                  <RotateCcw className="w-3.5 h-3.5" /> Corrections Needed
                                </span>
                                {parcel.resubmissionCount > 0 && (
                                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg border ${
                                    parcel.resubmissionCount >= 3
                                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                                      : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                                  }`}>
                                    Attempt {parcel.resubmissionCount}/3
                                  </span>
                                )}
                              </div>
                            ) : allVerified ? (
                              <span className="px-2.5 py-1 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : hasPending ? (
                              <span className="px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 rounded-xl flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Pending Verification
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-xs font-bold text-slate-400 bg-[#06151a] border border-slate-700 rounded-xl">
                                {cropsCount} {cropsCount === 1 ? 'Crop' : 'Crops'}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenParcelModal(parcel);
                              }}
                              className="px-3.5 py-1.5 bg-[#06151a] hover:bg-teal-950 text-teal-300 hover:text-teal-200 border border-teal-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1 group-hover:border-teal-400 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Crops &amp; Status ({cropsCount})</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Bottom Submit Action Bar for Selected Mandal */}
      {selectedMandal !== 'All' && (
        <div className="space-y-4">
          {(hasDraft || hasReturned) && !isCurrentMandalDeadlinePassed && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/90 via-[#261c06] to-[#120e03] border border-amber-500/60 text-amber-100 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-900/80 text-amber-300 border border-amber-500/50 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-white">
                        Submit Registration for {selectedMandal} Mandal Verification
                      </h4>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-900/80 text-amber-300 border border-amber-500/40">
                        {hasDraft ? `${draftCrops.length} Crop${draftCrops.length === 1 ? '' : 's'} Ready for Submission` : `${returnedCrops.length} Resubmission${returnedCrops.length === 1 ? '' : 's'}`}
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/90">
                      Your crop records in {selectedMandal} Mandal are ready for official submission. Please confirm your 3 verification documents above and click Submit to send your registration to the Agriculture Officer for verification.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitMandalRegistration}
                  disabled={submitting}
                  className="px-6 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-xl shadow-teal-500/30 transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer hover:scale-[1.02] disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting to Officer...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Registration to Officer</span>
                    </>
                  )}
                </button>
              </div>

              {!hasAllDocs && (
                <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Please upload all 3 required government verification documents in Section 2 above to enable official submission.</span>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Bottom Option: Go to Farm Records */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-[#06151a] via-[#041d24] to-[#06151a] rounded-3xl border border-teal-500/30 shadow-xl">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-teal-950/80 text-teal-400 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
            <LandPlot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">
              Manage &amp; Edit Land Records
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              To add new crops, update survey parcels, or modify details — simply go to Farm Records.
            </p>
          </div>
        </div>

        <Link
          to="/farmer/farm-records"
          className="px-5 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <span>Go to Farm Records</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Land Parcel Crops Pop-up Modal */}
      <ParcelCropsModal
        isOpen={parcelCropsModalOpen}
        onClose={() => setParcelCropsModalOpen(false)}
        land={activeParcelForModal}
        crops={activeParcelCrops}
        onViewCropDetails={(crop) => {
          setSelectedCropModal(crop);
        }}
      />

      {/* Complete Crop Details Modal (View-only on Registration page; editing happens on Farm Records page) */}
      <CropDetailsModal
        isOpen={Boolean(selectedCropModal)}
        onClose={() => {
          setSelectedCropModal(null);
          loadData();
        }}
        crop={selectedCropModal}
        onCropUpdated={() => {
          loadData();
        }}
        readOnly={true}
        deadlineExpired={isCurrentMandalDeadlinePassed}
      />
    </div>
  );
}
