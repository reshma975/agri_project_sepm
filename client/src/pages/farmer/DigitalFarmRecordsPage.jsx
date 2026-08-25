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

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedYear !== 'All') params.year = selectedYear;
      if (statusFilter !== 'All') params.status = statusFilter;

      const [cropsRes, landsRes] = await Promise.all([
        apiClient.get('/farmers/crops', { params }),
        apiClient.get('/farmers/lands').catch(() => ({ data: { lands: [] } }))
      ]);

      if (cropsRes.data.success) {
        setCrops(cropsRes.data.crops);
      }
      if (landsRes.data?.lands) {
        setLands(landsRes.data.lands);
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

  const handleCreateLandSubmit = async (e) => {
    e.preventDefault();
    if (!newLandData.surveyNumber.trim()) {
      return setLandModalError('Please enter a Survey Number.');
    }
    if (!newLandData.totalArea || parseFloat(newLandData.totalArea) <= 0) {
      return setLandModalError('Please enter a valid Total Land Area in Acres.');
    }

    setLandSaving(true);
    setLandModalError('');
    setLandModalSuccess('');

    try {
      const res = await apiClient.post('/farmers/lands', {
        surveyNumber: newLandData.surveyNumber.trim(),
        totalArea: parseFloat(newLandData.totalArea),
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
          `Land Parcel (${res.data.land.landId || 'New'} • Survey No. ${res.data.land.surveyNumber}) added successfully!${
            res.data.registeredCrop ? ` Initial crop (${res.data.registeredCrop.cropName}) also registered!` : ''
          }`
        );
        fetchRecords();
        setTimeout(() => {
          setAddLandModalOpen(false);
          setLandModalSuccess('');
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
        }, 1300);
      }
    } catch (err) {
      setLandModalError(err.response?.data?.message || 'Failed to add land parcel');
    } finally {
      setLandSaving(false);
    }
  };

  // Build unique parcel map keyed by unique Land ID / MongoDB ID
  // Note: Survey Number is a cadastral field within a village, NOT the unique primary key.
  const parcelMap = {};

  // First seed all registered lands
  lands.forEach((l) => {
    const key = l._id || l.landId;
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
      crops: []
    };
  });

  // Next associate crops with their respective land parcel
  crops.forEach((c) => {
    const landObj = c.landId;
    const key = landObj?._id || landObj?.landId || `legacy-${c.surveyNumber}`;
    if (!parcelMap[key]) {
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
              setLandModalError('');
              setLandModalSuccess('');
              setAddLandModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#06171c]/90 hover:bg-[#0c242c] border border-teal-500/30 text-teal-300 text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2 hover:border-teal-400 cursor-pointer"
          >
            <LandPlot className="w-4 h-4 text-teal-400" />
            Add Land Parcel / Crop
          </button>

          <Link
            to="/farmer/crops/register"
            className="px-4 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Register Land & Crop
          </Link>
        </div>
      </div>

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
              <option value="VERIFIED" className="bg-[#06171c] text-white">✅ Verified</option>
              <option value="SUBMITTED" className="bg-[#06171c] text-white">⏳ Submitted / Pending</option>
              <option value="DRAFT" className="bg-[#06171c] text-white">📝 Drafts</option>
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
                const village = land?.village || 'Vijayawada';

                return (
                  <div
                    key={crop._id}
                    onClick={() => handleCardClick(crop)}
                    className="glass-card bg-[#06151a]/90 rounded-2xl border border-teal-500/20 hover:border-teal-400/60 hover:shadow-lg hover:shadow-teal-500/10 p-4 sm:p-5 transition-all duration-200 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left: Survey Number & Crop */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
                      {/* Survey Number Column */}
                      <div className="min-w-[180px]">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Survey Number
                        </span>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-950/80 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/30 group-hover:bg-teal-900 transition-colors">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm sm:text-base text-white font-mono">
                              Survey No. {crop.surveyNumber}
                            </span>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {village} • {parcelId}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Divider on desktop */}
                      <div className="hidden sm:block h-10 w-[1px] bg-teal-900/40" />

                      {/* Crop Name Column */}
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Crop
                        </span>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30 group-hover:bg-emerald-900 transition-colors">
                            <Sprout className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm sm:text-base text-white group-hover:text-teal-300 transition-colors">
                                {crop.cropName}
                              </span>
                              {crop.cropCategory && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-200 border border-teal-500/30 font-semibold">
                                  {crop.cropCategory}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">
                              ID: {crop.registrationId}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Action Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-teal-900/40">
                      <StatusBadge status={crop.status} />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(crop);
                        }}
                        className="px-4 py-2 bg-[#081e25] hover:bg-teal-400 hover:text-slate-950 text-teal-300 text-xs font-bold rounded-xl border border-teal-500/30 transition-all inline-flex items-center gap-1.5 shadow-2xs group-hover:border-teal-400 cursor-pointer"
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

            return (
              <div
                key={parcel._id || parcel.landId}
                className="glass-card bg-[#06151a]/90 rounded-3xl p-6 border border-teal-500/20 shadow-lg space-y-5 transition-all hover:border-teal-400/40"
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
                </div>

                {/* Multiple Crops List on this Parcel */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Crops Registered on {parcel.landId} (Survey No. {parcel.surveyNumber}) — {parcel.crops.length}
                  </h4>

                  {parcel.crops.length === 0 ? (
                    <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                      <span>No crops registered on this parcel for the selected filter.</span>
                      <Link
                        to={`/farmer/crops/register?survey=${parcel.surveyNumber}`}
                        className="font-bold underline text-teal-300 ml-2"
                      >
                        Register a Crop Now
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {parcel.crops.map((crop) => (
                        <div
                          key={crop._id}
                          onClick={() => handleCardClick(crop)}
                          className="p-4 rounded-2xl bg-[#041014] border border-teal-500/20 hover:border-teal-400/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
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
                      ))}
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
      />

      {/* Add New Land Parcel Modal */}
      {addLandModalOpen && (
        <Modal
          isOpen={addLandModalOpen}
          onClose={() => setAddLandModalOpen(false)}
          title="Add New Land Parcel / Crop"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateLandSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
              <span>
                Each cadastral land plot will receive an official Unique Parcel ID (e.g. <strong>LND-XXXX</strong>). Survey number is recorded per local revenue records.
              </span>
            </div>

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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Survey Number *
              </label>
              <input
                type="text"
                value={newLandData.surveyNumber}
                onChange={(e) => setNewLandData({ ...newLandData, surveyNumber: e.target.value })}
                placeholder="e.g. 99/3 or 125/2A"
                required
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Land Area (Acres) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={newLandData.totalArea}
                  onChange={(e) => setNewLandData({ ...newLandData, totalArea: e.target.value })}
                  placeholder="e.g. 2.0"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ownership Status
                </label>
                <select
                  value={newLandData.ownershipType}
                  onChange={(e) => setNewLandData({ ...newLandData, ownershipType: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
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
                Village / Town
              </label>
              <input
                type="text"
                value={newLandData.village}
                onChange={(e) => setNewLandData({ ...newLandData, village: e.target.value })}
                placeholder="e.g. Kankipadu"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mandal
                </label>
                <input
                  type="text"
                  value={newLandData.mandal}
                  onChange={(e) => setNewLandData({ ...newLandData, mandal: e.target.value })}
                  placeholder="e.g. Penamaluru"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={newLandData.district}
                  onChange={(e) => setNewLandData({ ...newLandData, district: e.target.value })}
                  placeholder="e.g. Vijayawada"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
                />
              </div>
            </div>

            {/* Optional Crop on Parcel & Estimated Duration */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Crop on Parcel (Optional)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Optional
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Current Crop Name
                  </label>
                  <input
                    type="text"
                    value={newLandData.currentCrop}
                    onChange={(e) => setNewLandData({ ...newLandData, currentCrop: e.target.value })}
                    placeholder="e.g. Paddy (BPT 5204) or Guava"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Estimated Duration (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newLandData.estimatedDurationMonths}
                    onChange={(e) => setNewLandData({ ...newLandData, estimatedDurationMonths: e.target.value })}
                    placeholder="e.g. 4 or 6 months"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-bold">Quick suggestions:</span>
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
                        estimatedDurationMonths: item.dur
                      })
                    }
                    className="text-[10px] font-bold text-emerald-800 bg-white hover:bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
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
