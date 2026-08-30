import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import CropCard from '../../components/farmer/CropCard';
import CropDetailsModal from '../../components/farmer/CropDetailsModal';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Sprout,
  Filter,
  Plus,
  Calendar,
  Layers,
  ShieldCheck,
  ArrowLeft,
  LandPlot,
  MapPin,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  Save,
  AlertCircle,
  Table,
  LayoutGrid,
  Search,
  ChevronRight,
  Droplets,
  Building2,
  Sparkles,
  Info
} from 'lucide-react';

export default function DigitalFarmRecordsPage() {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedParcelId, setSelectedParcelId] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'parcels' | 'grid'
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // New Land Modal State
  const [addLandModalOpen, setAddLandModalOpen] = useState(false);
  const [newLandData, setNewLandData] = useState({
    surveyNumber: '',
    totalArea: '2.0',
    cultivatedArea: '',
    village: 'Kankipadu',
    mandal: 'Penamaluru',
    district: 'Vijayawada',
    ownershipType: 'Owned',
    currentCrop: '',
    cropCategory: 'Cereals',
    estimatedDurationMonths: '',
  });
  const [landSaving, setLandSaving] = useState(false);
  const [landModalError, setLandModalError] = useState('');
  const [landModalSuccess, setLandModalSuccess] = useState('');

  const [mandalDeadlines, setMandalDeadlines] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedYear !== 'All') params.year = selectedYear;
      if (statusFilter !== 'All') params.status = statusFilter;

      const [cropsRes, landsRes, deadlineRes] = await Promise.all([
        apiClient.get('/farmers/crops', { params }),
        apiClient.get('/farmers/lands').catch(() => ({ data: { lands: [] } })),
        apiClient.get('/farmers/deadline').catch(() => ({ data: { deadline: null, mandalDeadlines: [] } }))
      ]);

      if (cropsRes.data.success) {
        setCrops(cropsRes.data.crops);
      }
      if (landsRes.data?.lands) {
        setLands(landsRes.data.lands);
      }
      if (deadlineRes.data?.deadline) {
        setDeadline(deadlineRes.data.deadline);
        setIsDeadlinePassed(deadlineRes.data.isDeadlinePassed || false);
      }
      if (deadlineRes.data?.mandalDeadlines) {
        setMandalDeadlines(deadlineRes.data.mandalDeadlines);
      }
    } catch (err) {
      console.error('Error fetching farm records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedYear, statusFilter]);

  const handleCardClick = (crop) => {
    setSelectedCrop(crop);
    setModalOpen(true);
  };

  const handleCropUpdated = (updatedCrop) => {
    setCrops((prev) => prev.map((c) => (c._id === updatedCrop._id ? updatedCrop : c)));
    setSelectedCrop(updatedCrop);
  };

  // Find if typed survey number matches an existing registered parcel
  const matchedExistingLand = newLandData.surveyNumber.trim()
    ? lands.find((l) => l.surveyNumber && l.surveyNumber.trim().toLowerCase() === newLandData.surveyNumber.trim().toLowerCase())
    : null;

  const parcelCrops = matchedExistingLand
    ? crops.filter(
        (c) =>
          c.surveyNumber &&
          c.surveyNumber.trim().toLowerCase() === matchedExistingLand.surveyNumber.trim().toLowerCase() &&
          c.status !== 'REJECTED'
      )
    : [];

  const allocatedArea = parcelCrops.reduce((sum, c) => sum + (Number(c.cultivatedArea) || 0), 0);
  const totalParcelArea = parseFloat(matchedExistingLand?.totalArea || newLandData.totalArea || 0);
  const remainingAvailableArea = Math.max(0, totalParcelArea - allocatedArea);

  const handleSurveyNumberChange = (value) => {
    const matched = lands.find((l) => l.surveyNumber && l.surveyNumber.trim().toLowerCase() === value.trim().toLowerCase());
    if (matched) {
      const pCrops = crops.filter(
        (c) =>
          c.surveyNumber &&
          c.surveyNumber.trim().toLowerCase() === matched.surveyNumber.trim().toLowerCase() &&
          c.status !== 'REJECTED'
      );
      const allocated = pCrops.reduce((sum, c) => sum + (Number(c.cultivatedArea) || 0), 0);
      const totArea = parseFloat(matched.totalArea || 2.0);
      const avail = Math.max(0, totArea - allocated);

      setNewLandData((prev) => ({
        ...prev,
        surveyNumber: value,
        totalArea: matched.totalArea ? matched.totalArea.toString() : prev.totalArea,
        cultivatedArea: avail > 0 ? (avail <= 2 ? avail.toString() : '2.0') : '',
        ownershipType: matched.ownershipType || 'Owned',
        village: matched.village || prev.village,
        mandal: matched.mandal || prev.mandal,
        district: matched.district || prev.district,
      }));
    } else {
      setNewLandData((prev) => ({
        ...prev,
        surveyNumber: value,
        cultivatedArea: '',
      }));
    }
  };

  const handleCreateLandSubmit = async (e) => {
    e.preventDefault();
    if (!newLandData.surveyNumber.trim()) {
      return setLandModalError('Please enter a Survey Number.');
    }
    const totalAreaNum = parseFloat(newLandData.totalArea);
    if (!newLandData.totalArea || isNaN(totalAreaNum) || totalAreaNum <= 0) {
      return setLandModalError('Please enter a valid Total Land Area in Acres.');
    }

    if (newLandData.currentCrop?.trim()) {
      const cultAreaNum = newLandData.cultivatedArea
        ? parseFloat(newLandData.cultivatedArea)
        : (matchedExistingLand ? remainingAvailableArea : totalAreaNum);

      if (isNaN(cultAreaNum) || cultAreaNum <= 0) {
        return setLandModalError('Please enter a valid Cultivated Area in Acres for this crop.');
      }

      if (matchedExistingLand) {
        if (remainingAvailableArea <= 0.001) {
          return setLandModalError(
            `Cannot add more crops to Survey No. ${matchedExistingLand.surveyNumber}. All ${totalParcelArea} Acres are already allocated to existing crops (${parcelCrops.map(c => `${c.cropName}: ${c.cultivatedArea} Ac`).join(', ')}).`
          );
        }
        if (cultAreaNum > remainingAvailableArea + 0.001) {
          return setLandModalError(
            `Cultivated area (${cultAreaNum} Acres) exceeds the remaining available land on this parcel (${remainingAvailableArea.toFixed(1)} Acres available out of ${totalParcelArea} Acres).`
          );
        }
      } else {
        if (cultAreaNum > totalAreaNum) {
          return setLandModalError(`Cultivated area (${cultAreaNum} Acres) cannot exceed total parcel area (${totalAreaNum} Acres).`);
        }
      }
    }

    setLandSaving(true);
    setLandModalError('');
    setLandModalSuccess('');

    try {
      const cultArea = newLandData.cultivatedArea
        ? parseFloat(newLandData.cultivatedArea)
        : (matchedExistingLand ? remainingAvailableArea : totalAreaNum);

      const res = await apiClient.post('/farmers/lands', {
        surveyNumber: newLandData.surveyNumber.trim(),
        totalArea: totalAreaNum,
        cultivatedArea: cultArea,
        village: newLandData.village,
        mandal: newLandData.mandal,
        district: newLandData.district,
        ownershipType: newLandData.ownershipType,
        currentCrop: newLandData.currentCrop?.trim() || '',
        cropCategory: newLandData.cropCategory || 'Cereals',
        estimatedDurationMonths: newLandData.estimatedDurationMonths ? parseInt(newLandData.estimatedDurationMonths, 10) : undefined,
      });

      if (res.data.success) {
        setLandModalSuccess(
          `Land Parcel (${res.data.land.landId || 'New'} • Survey No. ${res.data.land.surveyNumber}) updated successfully!${
            res.data.registeredCrop ? ` Crop (${res.data.registeredCrop.cropName} - ${res.data.registeredCrop.cultivatedArea} Acres) registered!` : ''
          }`
        );
        fetchRecords();
        setTimeout(() => {
          setAddLandModalOpen(false);
          setLandModalSuccess('');
          setNewLandData({
            surveyNumber: '',
            totalArea: '2.0',
            cultivatedArea: '',
            village: 'Kankipadu',
            mandal: 'Penamaluru',
            district: 'Vijayawada',
            ownershipType: 'Owned',
            currentCrop: '',
            cropCategory: 'Cereals',
            estimatedDurationMonths: '',
          });
        }, 1300);
      }
    } catch (err) {
      setLandModalError(err.response?.data?.message || 'Failed to add land parcel');
    } finally {
      setLandSaving(false);
    }
  };

  // Build unique parcel map keyed by unique Land ID / MongoDB ID
  const parcelMap = {};

  // First seed all registered lands
  lands.forEach((l) => {
    const key = l._id || l.landId;
    const lIssues = (l.landIssues || [])
      .concat((l.issues || []).filter((i) => i.issueLevel === 'LAND' && i.status !== 'RESOLVED'));
    if (lIssues.length === 0 && l.officerComment) {
      lIssues.push({ _id: 'land-cmnt', description: l.officerComment.replace(/^\[LAND\]\s*/i, '') });
    }

    parcelMap[key] = {
      _id: l._id,
      landId: l.landId || `LND-${l.surveyNumber}`,
      surveyNumber: l.surveyNumber,
      village: l.village || 'Vijayawada',
      mandal: l.mandal || '',
      district: l.district || 'Vijayawada',
      totalArea: l.totalArea || 0,
      areaUnit: l.areaUnit || 'Acres',
      ownershipType: l.ownershipType || 'Owned',
      overallVerificationStatus: l.overallVerificationStatus || 'DRAFT',
      landIssues: lIssues,
      officerComment: l.officerComment || '',
      crops: []
    };
  });

  // Next associate crops with their respective land parcel
  crops.forEach((c) => {
    const landObj = c.landId;
    const key = landObj?._id || landObj?.landId || `legacy-${c.surveyNumber}`;
    if (!parcelMap[key]) {
      const lIssues = (c.landIssues || []);
      if (lIssues.length === 0 && landObj?.officerComment) {
        lIssues.push({ _id: 'land-cmnt', description: landObj.officerComment.replace(/^\[LAND\]\s*/i, '') });
      }

      parcelMap[key] = {
        _id: landObj?._id || null,
        landId: landObj?.landId || `LND-${c.surveyNumber}`,
        surveyNumber: c.surveyNumber,
        village: landObj?.village || 'Village',
        mandal: landObj?.mandal || '',
        district: landObj?.district || 'Vijayawada',
        totalArea: c.totalLandArea || c.cultivatedArea || 0,
        areaUnit: c.areaUnit || 'Acres',
        ownershipType: c.ownershipType || 'Owned',
        overallVerificationStatus: landObj?.overallVerificationStatus || c.status || 'DRAFT',
        landIssues: lIssues,
        officerComment: landObj?.officerComment || '',
        crops: []
      };
    }
    parcelMap[key].crops.push(c);
  });

  const parcelList = Object.values(parcelMap);

  // Filter crops based on parcel, search query, year, and status
  const filteredCrops = crops.filter((crop) => {
    // Filter by selected parcel
    if (selectedParcelId !== 'All') {
      const cropLandKey = crop.landId?._id || crop.landId?.landId || `legacy-${crop.surveyNumber}`;
      if (cropLandKey !== selectedParcelId && crop.surveyNumber !== selectedParcelId) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = crop.cropName?.toLowerCase().includes(q);
      const matchCategory = crop.cropCategory?.toLowerCase().includes(q);
      const matchSurvey = crop.surveyNumber?.toLowerCase().includes(q);
      const matchRegId = crop.registrationId?.toLowerCase().includes(q);
      const matchLandId = crop.landId?.landId?.toLowerCase().includes(q);
      const matchVillage = crop.landId?.village?.toLowerCase().includes(q);
      if (!matchName && !matchCategory && !matchSurvey && !matchRegId && !matchLandId && !matchVillage) {
        return false;
      }
    }

    return true;
  });

  // Calculate high-level summary metrics
  const totalLandHoldings = lands.reduce((acc, l) => acc + (l.totalArea || 0), 0);
  const totalCultivatedArea = crops.reduce((acc, c) => acc + (c.cultivatedArea || 0), 0);
  const verifiedCount = crops.filter((c) => c.status === 'VERIFIED').length;
  const pendingCount = crops.filter((c) => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status)).length;
  const returnedCount = crops.filter((c) => c.status === 'RETURNED_FOR_CORRECTION').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/farmer/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 transition-all mb-2.5 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
              <span className="text-emerald-400">🌾</span>
              <span className="text-white font-extrabold">Digital Farm & Land Records</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
            Manage your cadastral land parcels, track crop allotments, and inspect official verification status.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setNewLandData({
                surveyNumber: '',
                totalArea: '2.0',
                village: 'Kankipadu',
                mandal: 'Penamaluru',
                district: 'Vijayawada',
                ownershipType: 'Owned',
                currentCrop: '',
                cropCategory: 'Cereals',
                estimatedDurationMonths: '',
              });
              setLandModalError('');
              setLandModalSuccess('');
              setAddLandModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Crop / Land Parcel</span>
          </button>
        </div>
      </div>

      {/* Mandal Registration Deadline Info Banner (Shown ONLY when lands are registered in that mandal) */}
      {mandalDeadlines.length > 0 && lands.length > 0 && (
        <div className="space-y-2.5">
          {mandalDeadlines.map((md, idx) => {
            const isPassed = md.isDeadlinePassed;
            // Distinct visual palettes for each mandal portal
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
            const p = palettes[idx % palettes.length];

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  isPassed
                    ? 'bg-rose-950/90 border-rose-600/50 text-rose-200'
                    : p.card
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    isPassed ? 'bg-rose-900/80 text-rose-300 border-rose-500/50' : p.icon
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {md.mandal} Mandal Deadline:
                    </span>{' '}
                    <span className="font-semibold">
                      {new Date(md.deadlineDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} ({md.season} Season)
                    </span>
                    {isPassed ? (
                      <span className="text-rose-300 font-bold ml-1.5">— (Registration window closed)</span>
                    ) : (
                      <span className="text-emerald-300 font-bold ml-1.5">— (Submissions open for {md.landsCount} parcel{md.landsCount === 1 ? '' : 's'})</span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/farmer/crops/register?mandal=${encodeURIComponent(md.mandal)}`}
                  className={`px-3.5 py-1.5 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                    isPassed ? 'bg-rose-600 hover:bg-rose-500 text-white' : p.btn
                  }`}
                >
                  <span>Registration Details →</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card bg-[#06151a]/90 p-4 sm:p-5 rounded-2xl border border-teal-500/20 shadow-lg space-y-1 hover:border-teal-400/40 transition-all">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Land Parcels
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white">
              {lands.length || parcelList.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({totalLandHoldings.toFixed(1)} Acres)
            </span>
          </div>
        </div>

        <div className="glass-card bg-[#06151a]/90 p-4 sm:p-5 rounded-2xl border border-teal-500/20 shadow-lg space-y-1 hover:border-teal-400/40 transition-all">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Cultivated Crops
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-teal-400">
              {crops.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({totalCultivatedArea.toFixed(1)} Acres)
            </span>
          </div>
        </div>

        <div className="glass-card bg-[#06151a]/90 p-4 sm:p-5 rounded-2xl border border-teal-500/20 shadow-lg space-y-1 hover:border-teal-400/40 transition-all">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Verified Records
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-400">
              {verifiedCount}
            </span>
            <span className="text-xs text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              ✅ Approved
            </span>
          </div>
        </div>

        <div className="glass-card bg-[#06151a]/90 p-4 sm:p-5 rounded-2xl border border-teal-500/20 shadow-lg space-y-1 hover:border-teal-400/40 transition-all">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Pending / Action
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {pendingCount + returnedCount}
            </span>
            <span className="text-xs text-amber-300 font-bold bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              {returnedCount > 0 ? `⚠️ ${returnedCount} Returned` : '⏳ Under Review'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter, Search & View Mode Switcher */}
      <div className="glass-card bg-[#06151a]/90 rounded-3xl p-4 sm:p-5 border border-teal-500/20 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop, survey no., parcel ID (e.g. LND-10492), or village..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white font-bold bg-[#030b0e] hover:bg-[#051419] focus:bg-[#051419] border border-teal-900/60 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 rounded-2xl outline-none placeholder:text-slate-500 placeholder:font-normal transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#030b0e] rounded-2xl self-end lg:self-center border border-teal-900/60">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-teal-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('parcels')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'parcels'
                  ? 'bg-teal-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LandPlot className="w-3.5 h-3.5" />
              <span>Land Parcels</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-teal-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards Grid</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-teal-900/40 text-xs">
          <div className="flex items-center gap-1.5 text-teal-300 font-bold">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <span>Filters:</span>
          </div>

          {/* Land Parcel Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-medium">Parcel:</span>
            <select
              value={selectedParcelId}
              onChange={(e) => setSelectedParcelId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#030b0e] border border-teal-900/60 rounded-xl focus:border-teal-400 outline-none shadow-2xs cursor-pointer"
            >
              <option value="All" className="bg-[#06171c] text-white">All Parcels ({parcelList.length})</option>
              {parcelList.map((p) => (
                <option key={p._id || p.landId} value={p._id || p.landId} className="bg-[#06171c] text-white">
                  {p.landId} (Survey No. {p.surveyNumber} • {p.village})
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#030b0e] border border-teal-900/60 rounded-xl focus:border-teal-400 outline-none shadow-2xs cursor-pointer"
            >
              <option value="All" className="bg-[#06171c] text-white">All Years</option>
              <option value="2026" className="bg-[#06171c] text-white">2026</option>
              <option value="2025" className="bg-[#06171c] text-white">2025</option>
              <option value="2024" className="bg-[#06171c] text-white">2024</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#030b0e] border border-teal-900/60 rounded-xl focus:border-teal-400 outline-none shadow-2xs cursor-pointer"
            >
              <option value="All" className="bg-[#06171c] text-white">All Statuses</option>
              <option value="SUBMITTED" className="bg-[#06171c] text-white">⏳ Pending Verification</option>
              <option value="VERIFIED" className="bg-[#06171c] text-white">✅ Verified</option>
              <option value="RETURNED_FOR_CORRECTION" className="bg-[#06171c] text-white">↩️ Returned for Correction</option>
            </select>
          </div>

          {(selectedParcelId !== 'All' || selectedYear !== 'All' || statusFilter !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedParcelId('All');
                setSelectedYear('All');
                setStatusFilter('All');
                setSearchQuery('');
              }}
              className="px-2.5 py-1 text-xs font-bold text-teal-300 hover:text-white bg-[#081e25] hover:bg-[#0e2c36] rounded-lg transition-colors flex items-center gap-1 border border-teal-500/30 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Render */}
      {loading ? (
        <LoadingSpinner message="Fetching your digital farm records..." />
      ) : filteredCrops.length === 0 && parcelList.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No crop entries found"
          description="You have no crop entries recorded at this time. Start by adding your current Kharif or Rabi crop to maintain your digital farm records."
        />
      ) : viewMode === 'table' ? (
        
        /* ================= 1. CLEAN STREAMLINED LIST / TABLE VIEW ================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-extrabold text-white">
                Farm Crops & Survey Records ({filteredCrops.length})
              </h2>
            </div>
            <span className="text-[11px] text-teal-300 font-medium">
              💡 Click any row to view full crop details
            </span>
          </div>

          {filteredCrops.length === 0 ? (
            <div className="glass-card bg-[#06151a]/90 rounded-3xl border border-teal-500/20 p-8 text-center space-y-3 shadow-lg">
              <p className="text-sm text-slate-300">No crop entries match the current filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCrops.map((crop) => {
                const land = crop.landId;
                const parcelId = land?.landId || `LND-${crop.surveyNumber}`;
                const village = land?.village || crop.village || 'Vijayawada';
                const mandal = land?.mandal || crop.mandal || profile?.mandal || '';

                return (
                  <div
                    key={crop._id}
                    onClick={() => handleCardClick(crop)}
                    className="glass-card bg-[#06151a]/90 rounded-2xl border border-teal-500/20 hover:border-teal-400/60 hover:shadow-lg hover:shadow-teal-500/10 p-4 sm:p-5 transition-all duration-200 cursor-pointer group grid grid-cols-1 md:grid-cols-12 items-center gap-4"
                  >
                    {/* Survey Number Column (col-span-4) */}
                    <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-teal-950/80 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/30 group-hover:bg-teal-900 transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Survey Number
                        </span>
                        <span className="font-extrabold text-sm sm:text-base text-white font-mono block truncate">
                          Survey No. {crop.surveyNumber}
                        </span>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                          {village} • {parcelId}
                        </p>
                        {mandal && (
                          <p className="text-[11px] text-teal-400/90 font-medium truncate">
                            {mandal} Mandal
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Crop Name Column (col-span-4) */}
                    <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30 group-hover:bg-emerald-900 transition-colors">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Crop
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm sm:text-base text-white group-hover:text-teal-300 transition-colors truncate">
                            {crop.cropName}
                          </span>
                          {crop.cropCategory && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-200 border border-teal-500/30 font-semibold flex-shrink-0">
                              {crop.cropCategory}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          ID: {crop.registrationId}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge Column (col-span-2) */}
                    <div className="md:col-span-2 flex flex-col items-start md:items-center justify-center gap-1">
                      <StatusBadge status={crop.status} />
                      {crop.resubmissionCount > 0 && crop.status === 'RETURNED_FOR_CORRECTION' && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                          crop.resubmissionCount >= 3
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                        }`}>
                          Attempt {crop.resubmissionCount}/3
                        </span>
                      )}
                    </div>

                    {/* Action Button Column (col-span-2) */}
                    <div className="md:col-span-2 flex items-center justify-start md:justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(crop);
                        }}
                        className="px-4 py-2 bg-[#081e25] hover:bg-teal-400 hover:text-slate-950 text-teal-300 text-xs font-bold rounded-xl border border-teal-500/30 transition-all inline-flex items-center gap-1.5 shadow-2xs group-hover:border-teal-400 cursor-pointer w-full md:w-auto justify-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Edit Crop Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : viewMode === 'parcels' ? (

        /* ================= 2. LAND PARCELS SUMMARY VIEW ================= */
        <div className="space-y-6">
          {parcelList.map((parcel) => {
            const cultivatedTotal = parcel.crops.reduce((acc, c) => acc + (c.cultivatedArea || 0), 0);
            const remaining = Math.max(0, (parcel.totalArea || 0) - cultivatedTotal);
            const hasLandIssues = parcel.landIssues && parcel.landIssues.length > 0;

            return (
              <div
                key={parcel._id || parcel.landId}
                className={`glass-card bg-[#06151a]/90 rounded-3xl p-6 border shadow-lg space-y-5 transition-all ${
                  hasLandIssues ? 'border-amber-500/50 hover:border-amber-400' : 'border-teal-500/20 hover:border-teal-400/40'
                }`}
              >
                {/* Land Parcel Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-teal-900/40">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-950/80 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                      <LandPlot className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-teal-400 text-slate-950 font-mono text-xs font-black shadow-2xs">
                          {parcel.landId}
                        </span>
                        <h3 className="text-lg font-extrabold text-white font-mono">
                          Survey No. {parcel.surveyNumber}
                        </h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#030b0e] text-teal-200 border border-teal-900/60">
                          {parcel.ownershipType || 'Owned'} Land
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {parcel.village ? `${parcel.village}, ` : ''}{parcel.district || 'Vijayawada'} • Total Area:{' '}
                        <strong className="text-white font-bold">{parcel.totalArea} {parcel.areaUnit}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={parcel.overallVerificationStatus || 'DRAFT'} />
                  </div>
                </div>

                {/* Land / Document Level Officer Issue Banner */}
                {hasLandIssues && (
                  <div className="p-3.5 bg-amber-950/70 border border-amber-500/50 rounded-2xl text-xs space-y-1.5 shadow-sm">
                    <strong className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      Officer's Note on Land / Documents:
                    </strong>
                    {parcel.landIssues.map((iss, idx) => (
                      <p key={iss._id || idx} className="text-white bg-[#030b0e] p-2.5 rounded-xl border border-amber-500/30 font-medium">
                        "{iss.description || (typeof iss === 'string' ? iss : JSON.stringify(iss))}"
                      </p>
                    ))}
                  </div>
                )}

                {/* Multiple Crops List on this Parcel */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Crops on {parcel.landId} (Survey No. {parcel.surveyNumber}) — {parcel.crops.length}
                  </h4>

                  {parcel.crops.length === 0 ? (
                    <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700/80 text-xs text-slate-400">
                      No crops added on this parcel for the selected filter.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {parcel.crops.map((crop) => {
                        const hasCropIssue = crop.cropIssues && crop.cropIssues.length > 0;

                        return (
                          <div
                            key={crop._id}
                            onClick={() => handleCardClick(crop)}
                            className={`p-4 rounded-2xl bg-[#041014] border transition-all cursor-pointer flex flex-col justify-between group space-y-3 ${
                              hasCropIssue
                                ? 'border-amber-500/50 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10'
                                : 'border-teal-500/20 hover:border-teal-400/50 hover:shadow-md'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h5 className="font-extrabold text-sm text-white group-hover:text-teal-300 transition-colors">
                                    {crop.cropName}
                                  </h5>
                                  <span className="text-[10px] font-semibold text-teal-300/80 block mt-0.5">
                                    {crop.cropCategory || 'Cereals'}
                                  </span>
                                </div>
                                <StatusBadge status={crop.status} />
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-teal-900/40 text-slate-300">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Cultivated Area</span>
                                  <strong className="text-white">{crop.cultivatedArea} {crop.areaUnit}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Season</span>
                                  <strong className="text-white">{crop.season} ({crop.year})</strong>
                                </div>
                              </div>

                              {/* Crop-Specific Officer Issue Note (Shown strictly on affected crop) */}
                              {hasCropIssue && (
                                <div className="p-2.5 bg-amber-950/80 border border-amber-500/40 rounded-xl text-[11px] text-amber-200 space-y-1">
                                  <strong className="font-bold text-amber-300 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                    Officer's Note on {crop.cropName}:
                                  </strong>
                                  {crop.cropIssues.map((iss) => (
                                    <p key={iss._id}>"{iss.description}"</p>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-teal-900/40 flex items-center justify-between text-xs font-bold text-teal-400">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> View / Edit Crop Details
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {crop.registrationId}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        /* ================= 3. ALL CROPS STANDARD CARDS GRID ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard key={crop._id} crop={crop} onClick={() => handleCardClick(crop)} />
          ))}
        </div>
      )}

      {/* Complete Crop Details Modal (Pops up on row or button click) */}
      <CropDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        crop={selectedCrop}
        onCropUpdated={handleCropUpdated}
        deadlineExpired={isDeadlinePassed}
      />

      {/* Add New Land Parcel Modal */}
      {addLandModalOpen && (
        <Modal
          isOpen={addLandModalOpen}
          onClose={() => setAddLandModalOpen(false)}
          title="Add New Land Parcel / Crop"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateLandSubmit} className="space-y-4">

            {landModalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{landModalError}</span>
              </div>
            )}

            {landModalSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{landModalSuccess}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Survey Number *
                </label>
                {matchedExistingLand && (
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-teal-300">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    <span>Existing Parcel ({matchedExistingLand.landId || 'LND'})</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                value={newLandData.surveyNumber}
                onChange={(e) => handleSurveyNumberChange(e.target.value)}
                placeholder="e.g. 99/2 or 125/2A"
                required
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none font-mono font-bold"
              />
              {matchedExistingLand && (
                <p className="text-[11px] text-teal-700 font-medium mt-1">
                  🔒 Parcel location details are locked to the registered record for Survey No. {matchedExistingLand.surveyNumber}. Enter the crop details below.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Land Area (Acres) * {matchedExistingLand && '🔒'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={newLandData.totalArea}
                  onChange={(e) => setNewLandData({ ...newLandData, totalArea: e.target.value })}
                  placeholder="e.g. 2.0"
                  required
                  disabled={Boolean(matchedExistingLand)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl outline-none font-bold ${
                    matchedExistingLand
                      ? 'bg-slate-200 text-slate-600 border border-slate-300 cursor-not-allowed'
                      : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-forest-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ownership Status {matchedExistingLand && '🔒'}
                </label>
                <select
                  value={newLandData.ownershipType}
                  onChange={(e) => setNewLandData({ ...newLandData, ownershipType: e.target.value })}
                  disabled={Boolean(matchedExistingLand)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl outline-none ${
                    matchedExistingLand
                      ? 'bg-slate-200 text-slate-600 border border-slate-300 cursor-not-allowed font-semibold'
                      : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-forest-500'
                  }`}
                >
                  <option value="Owned">Owned</option>
                  <option value="Leased">Leased / Tenant</option>
                  <option value="Worker">Worker / Cultivator</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Village / Town {matchedExistingLand && '🔒'}
              </label>
              <input
                type="text"
                value={newLandData.village}
                onChange={(e) => setNewLandData({ ...newLandData, village: e.target.value })}
                placeholder="e.g. Kankipadu"
                disabled={Boolean(matchedExistingLand)}
                className={`w-full px-3.5 py-2 text-xs rounded-xl outline-none ${
                  matchedExistingLand
                    ? 'bg-slate-200 text-slate-600 border border-slate-300 cursor-not-allowed font-semibold'
                    : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-forest-500'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mandal {matchedExistingLand && '🔒'}
                </label>
                <input
                  type="text"
                  value={newLandData.mandal}
                  onChange={(e) => setNewLandData({ ...newLandData, mandal: e.target.value })}
                  placeholder="e.g. Penamaluru"
                  disabled={Boolean(matchedExistingLand)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl outline-none ${
                    matchedExistingLand
                      ? 'bg-slate-200 text-slate-600 border border-slate-300 cursor-not-allowed font-semibold'
                      : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-forest-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District {matchedExistingLand && '🔒'}
                </label>
                <input
                  type="text"
                  value={newLandData.district}
                  onChange={(e) => setNewLandData({ ...newLandData, district: e.target.value })}
                  placeholder="e.g. Vijayawada"
                  disabled={Boolean(matchedExistingLand)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl outline-none ${
                    matchedExistingLand
                      ? 'bg-slate-200 text-slate-600 border border-slate-300 cursor-not-allowed font-semibold'
                      : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-forest-500'
                  }`}
                />
              </div>
            </div>

            {/* Optional Crop on Parcel & Estimated Duration */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-3.5">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Crop Details for this Parcel</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {matchedExistingLand ? 'Required for Existing Parcel' : 'Optional'}
                </span>
              </div>

              {/* Crop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Current Crop Name {matchedExistingLand && '*'}
                </label>
                <input
                  type="text"
                  value={newLandData.currentCrop}
                  onChange={(e) => setNewLandData({ ...newLandData, currentCrop: e.target.value })}
                  placeholder="e.g. Paddy (BPT 5204), Chilli, Red Gram, Guava"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-semibold text-slate-900 shadow-2xs"
                />
              </div>

              {matchedExistingLand && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border ${
                    remainingAvailableArea <= 0.001
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100/90 text-emerald-900 border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      Parcel Allocation: <strong>{allocatedArea.toFixed(1)} / {totalParcelArea} Acres used</strong>
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold self-start sm:self-center ${
                      remainingAvailableArea <= 0.001 ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {remainingAvailableArea <= 0.001 ? 'All Land Allocated' : `${remainingAvailableArea.toFixed(1)} Acres Available`}
                  </span>
                </div>
              )}

              {/* Cultivated Area and Duration in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Cultivated Area (Acres)
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Max: {matchedExistingLand ? remainingAvailableArea.toFixed(1) : (newLandData.totalArea || 0)} Ac
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={matchedExistingLand ? remainingAvailableArea : (newLandData.totalArea || 100)}
                    value={newLandData.cultivatedArea}
                    onChange={(e) => setNewLandData({ ...newLandData, cultivatedArea: e.target.value })}
                    placeholder={matchedExistingLand ? `e.g. ${remainingAvailableArea.toFixed(1)}` : `e.g. ${newLandData.totalArea || '2.0'}`}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-semibold text-slate-900 shadow-2xs"
                  />
                  <p className="text-[10px] text-emerald-800 font-medium mt-0.5">
                    Portion of parcel used for this crop.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Estimated Duration (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newLandData.estimatedDurationMonths}
                    onChange={(e) => setNewLandData({ ...newLandData, estimatedDurationMonths: e.target.value })}
                    placeholder="e.g. 4 or 6 months"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-semibold text-slate-900 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Expected crop lifecycle in months.
                  </p>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-600 font-bold">Quick suggestions:</span>
                {[
                  { name: 'Paddy', dur: '4' },
                  { name: 'Guava', dur: '12' },
                  { name: 'Cotton', dur: '6' },
                  { name: 'Chilli', dur: '5' },
                  { name: 'Red Gram', dur: '6' },
                  { name: 'Groundnut', dur: '4' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setNewLandData({
                        ...newLandData,
                        currentCrop: item.name,
                        estimatedDurationMonths: item.dur,
                        cultivatedArea: newLandData.cultivatedArea || newLandData.totalArea || '2.0'
                      })
                    }
                    className="text-[10px] font-bold text-emerald-900 bg-white hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
                  >
                    + {item.name} ({item.dur}m)
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddLandModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={landSaving}
                className="px-5 py-2 text-xs font-bold bg-forest-600 hover:bg-forest-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{landSaving ? 'Saving...' : 'Save Land Parcel'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
