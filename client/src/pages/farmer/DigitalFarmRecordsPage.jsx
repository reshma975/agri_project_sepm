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
  AlertCircle
} from 'lucide-react';

export default function DigitalFarmRecordsPage() {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedSurvey, setSelectedSurvey] = useState('All');
  const [viewMode, setViewMode] = useState('parcels'); // 'parcels' | 'grid'
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
    ownershipType: 'Owned'
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
        ownershipType: newLandData.ownershipType
      });

      if (res.data.success) {
        setLandModalSuccess(`Land Parcel (Survey No. ${res.data.land.surveyNumber}) added successfully!`);
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
            ownershipType: 'Owned'
          });
        }, 1200);
      }
    } catch (err) {
      setLandModalError(err.response?.data?.message || 'Failed to add land parcel');
    } finally {
      setLandSaving(false);
    }
  };

  // Filter crops by selected survey if chosen
  const filteredCrops = crops.filter((crop) => {
    if (selectedSurvey !== 'All' && crop.surveyNumber !== selectedSurvey) {
      return false;
    }
    return true;
  });

  // Group crops by land / survey number for parcels view
  const surveyGroups = {};

  // First seed from registered lands
  lands.forEach((l) => {
    surveyGroups[l.surveyNumber] = {
      land: l,
      surveyNumber: l.surveyNumber,
      village: l.village,
      mandal: l.mandal,
      district: l.district,
      totalArea: l.totalArea,
      areaUnit: l.areaUnit || 'Acres',
      ownershipType: l.ownershipType || 'Owned',
      crops: []
    };
  });

  // Then map crops into groups
  filteredCrops.forEach((c) => {
    const s = c.surveyNumber || 'Unassigned';
    if (!surveyGroups[s]) {
      surveyGroups[s] = {
        land: c.landId || null,
        surveyNumber: s,
        village: c.landId?.village || 'Village',
        district: c.landId?.district || 'District',
        totalArea: c.totalLandArea || c.cultivatedArea || 0,
        areaUnit: c.areaUnit || 'Acres',
        ownershipType: c.ownershipType || 'Owned',
        crops: []
      };
    }
    surveyGroups[s].crops.push(c);
  });

  const parcelList = Object.values(surveyGroups).filter((group) => {
    if (selectedSurvey !== 'All' && group.surveyNumber !== selectedSurvey) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/farmer/dashboard"
            className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            🌾 Digital Farm & Land Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Manage multiple land parcels, track multiple crops per land, and monitor official officer verifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setLandModalError('');
              setLandModalSuccess('');
              setAddLandModalOpen(true);
            }}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
          >
            <LandPlot className="w-4 h-4 text-forest-600" />
            + Add Land Parcel
          </button>

          <Link
            to="/farmer/crops/register"
            className="px-4 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-forest-200 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Register Land & Crop
          </Link>
        </div>
      </div>

      {/* Filter & View Mode Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-forest-600" />
            <span>Filter By:</span>
          </div>

          {/* Survey / Land Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Land Parcel:</span>
            <select
              value={selectedSurvey}
              onChange={(e) => setSelectedSurvey(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
            >
              <option value="All">All Land Parcels ({Object.keys(surveyGroups).length})</option>
              {Object.keys(surveyGroups).map((survey) => (
                <option key={survey} value={survey}>
                  Survey No. {survey}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
            >
              <option value="All">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="VERIFIED">✅ Verified</option>
              <option value="SUBMITTED">⏳ Submitted / Pending</option>
              <option value="RETURNED_FOR_CORRECTION">↩️ Returned for Correction</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-end lg:self-center">
          <button
            type="button"
            onClick={() => setViewMode('parcels')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'parcels'
                ? 'bg-white text-forest-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LandPlot className="w-3.5 h-3.5" />
            <span>Land Parcels View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-white text-forest-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>All Crops Grid</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Fetching your digital farm records..." />
      ) : filteredCrops.length === 0 && parcelList.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No crop registrations found"
          description="You have no crop entries recorded at this time. Start by registering your current Kharif or Rabi crop to maintain your digital farm records."
          actionText="+ Register New Crop"
          onAction={() => navigate('/farmer/crops/register')}
        />
      ) : viewMode === 'parcels' ? (
        /* Land Parcels & Multi-Crop Grouped View */
        <div className="space-y-6">
          {parcelList.map((parcel) => {
            const cultivatedTotal = parcel.crops.reduce((acc, c) => acc + (c.cultivatedArea || 0), 0);
            const remaining = Math.max(0, (parcel.totalArea || 0) - cultivatedTotal);

            return (
              <div
                key={parcel.surveyNumber}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5 transition-all hover:border-forest-300"
              >
                {/* Land Parcel Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center flex-shrink-0 border border-forest-200">
                      <LandPlot className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-900 font-mono">
                          Survey No. {parcel.surveyNumber}
                        </h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {parcel.ownershipType || 'Owned'} Land
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {parcel.village ? `${parcel.village}, ` : ''}{parcel.district || 'Vijayawada'} • Total Area:{' '}
                        <strong className="text-slate-800 font-semibold">{parcel.totalArea} {parcel.areaUnit}</strong>
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/farmer/crops/register?survey=${parcel.surveyNumber}`}
                    className="px-3.5 py-2 bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold rounded-xl border border-forest-200 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Crop on this Land</span>
                  </Link>
                </div>

                {/* Land Allocation Bar */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">
                      Cultivated: <strong className="text-forest-800">{cultivatedTotal.toFixed(1)} {parcel.areaUnit}</strong> across {parcel.crops.length} crop(s)
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {remaining > 0 ? `${remaining.toFixed(1)} ${parcel.areaUnit} unallocated` : 'Fully Allocated'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-forest-600 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, parcel.totalArea > 0 ? (cultivatedTotal / parcel.totalArea) * 100 : 0)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Multiple Crops List on this Parcel */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Crops Registered on Survey No. {parcel.surveyNumber} ({parcel.crops.length})
                  </h4>

                  {parcel.crops.length === 0 ? (
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                      <span>No crops registered on this parcel for the selected filter.</span>
                      <Link
                        to={`/farmer/crops/register?survey=${parcel.surveyNumber}`}
                        className="font-bold underline text-amber-900 ml-2"
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
                          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-forest-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-extrabold text-sm text-slate-900 group-hover:text-forest-700 transition-colors">
                                  {crop.cropName}
                                </h5>
                                <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                                  {crop.cropCategory || 'Cereals & Food Grains'}
                                </span>
                              </div>
                              <StatusBadge status={crop.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-600">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Cultivated Area</span>
                                <strong>{crop.cultivatedArea} {crop.areaUnit}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Season</span>
                                <strong>{crop.season} ({crop.year})</strong>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-forest-700">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" /> View Details
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
        /* All Crops Standard Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard key={crop._id} crop={crop} onClick={() => handleCardClick(crop)} />
          ))}
        </div>
      )}

      {/* Complete Crop Details Modal */}
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
          title="Add New Land Parcel"
          maxWidth="max-w-md"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Survey Number *
              </label>
              <input
                type="text"
                value={newLandData.surveyNumber}
                onChange={(e) => setNewLandData({ ...newLandData, surveyNumber: e.target.value })}
                placeholder="e.g. 88/1 or 125/2"
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
