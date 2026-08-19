import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import DocumentUploader from '../../components/farmer/DocumentUploader';
import confetti from 'canvas-confetti';
import {
  Sprout,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  FileCheck,
  Calendar,
  Layers,
  FlaskConical,
  Bug,
  Scale,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  LandPlot,
  Check
} from 'lucide-react';

export default function RegisterCropPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [farmerProfile, setFarmerProfile] = useState(null);
  const [existingLands, setExistingLands] = useState([]);
  const [selectedLandId, setSelectedLandId] = useState('new'); // 'new' or Land._id
  const [loading, setLoading] = useState(false);
  const [savingLand, setSavingLand] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [landSuccess, setLandSuccess] = useState('');

  // Land Parcel Info
  const [landData, setLandData] = useState({
    surveyNumber: '',
    village: '',
    mandal: '',
    district: 'Vijayawada',
    totalLandArea: '2.5',
    areaUnit: 'Acres',
    ownershipType: 'Owned',
  });

  // Multiple Crops on this Land Parcel
  const [cropsList, setCropsList] = useState([
    {
      id: 1,
      cropName: 'Paddy (BPT 5204)',
      cropCategory: 'Cereals & Food Grains',
      cultivatedArea: '2.5',
      season: 'Kharif',
      year: new Date().getFullYear().toString(),
      sowingDate: new Date().toISOString().split('T')[0],
      harvestDate: '',
      irrigationType: 'Borewell',
      fertilizersUsed: 'Urea (2 Bags), DAP (1 Bag), Potash (1 Bag)',
      pesticidesUsed: 'Organic Neem Oil, Chlorpyrifos',
      expectedHarvest: '45 Quintals',
    }
  ]);

  useEffect(() => {
    const loadProfileAndLands = async () => {
      try {
        const res = await apiClient.get('/farmers/profile');
        if (res.data.success) {
          setFarmerProfile(res.data.profile);
          const lands = res.data.lands || [];
          setExistingLands(lands);

          const preselectedSurvey = searchParams.get('survey');

          if (lands.length > 0) {
            const matchedLand = preselectedSurvey
              ? lands.find((l) => l.surveyNumber === preselectedSurvey) || lands[0]
              : lands[0];

            setSelectedLandId(matchedLand._id);
            setLandData({
              surveyNumber: matchedLand.surveyNumber || '',
              village: matchedLand.village || res.data.profile?.village || '',
              mandal: matchedLand.mandal || res.data.profile?.mandal || '',
              district: matchedLand.district || res.data.profile?.district || 'Vijayawada',
              totalLandArea: matchedLand.totalArea?.toString() || '2.5',
              areaUnit: matchedLand.areaUnit || 'Acres',
              ownershipType: matchedLand.ownershipType || 'Owned',
            });

            setCropsList([
              {
                id: 1,
                cropName: 'Paddy (BPT 5204)',
                cropCategory: 'Cereals & Food Grains',
                cultivatedArea: matchedLand.totalArea?.toString() || '2.5',
                season: 'Kharif',
                year: new Date().getFullYear().toString(),
                sowingDate: new Date().toISOString().split('T')[0],
                harvestDate: '',
                irrigationType: 'Borewell',
                fertilizersUsed: 'Urea (2 Bags), DAP (1 Bag), Potash (1 Bag)',
                pesticidesUsed: 'Organic Neem Oil, Chlorpyrifos',
                expectedHarvest: '45 Quintals',
              }
            ]);
          } else {
            setSelectedLandId('new');
            setLandData({
              surveyNumber: '125/2',
              village: res.data.profile?.village || 'Kankipadu',
              mandal: res.data.profile?.mandal || 'Penamaluru',
              district: res.data.profile?.district || 'Vijayawada',
              totalLandArea: '2.5',
              areaUnit: 'Acres',
              ownershipType: 'Owned',
            });
          }
        }
      } catch (err) {
        console.error('Error fetching farmer profile and lands:', err);
      }
    };
    loadProfileAndLands();
  }, [searchParams]);

  // Handle switching selected land parcel
  const handleLandSelectionChange = (landIdValue) => {
    setSelectedLandId(landIdValue);
    setError('');
    setLandSuccess('');

    if (landIdValue === 'new') {
      setLandData({
        surveyNumber: '',
        village: farmerProfile?.village || 'Kankipadu',
        mandal: farmerProfile?.mandal || '',
        district: farmerProfile?.district || 'Vijayawada',
        totalLandArea: '2.0',
        areaUnit: 'Acres',
        ownershipType: 'Owned',
      });
      // Adjust default first crop cultivated area to match new land area
      setCropsList([
        {
          id: 1,
          cropName: 'Paddy (BPT 5204)',
          cropCategory: 'Cereals & Food Grains',
          cultivatedArea: '2.0',
          season: 'Kharif',
          year: new Date().getFullYear().toString(),
          sowingDate: new Date().toISOString().split('T')[0],
          harvestDate: '',
          irrigationType: 'Borewell',
          fertilizersUsed: 'Urea (2 Bags), DAP (1 Bag), Potash (1 Bag)',
          pesticidesUsed: 'Organic Neem Oil, Chlorpyrifos',
          expectedHarvest: '35 Quintals',
        }
      ]);
    } else {
      const selected = existingLands.find((l) => l._id === landIdValue);
      if (selected) {
        setLandData({
          surveyNumber: selected.surveyNumber,
          village: selected.village || farmerProfile?.village || '',
          mandal: selected.mandal || '',
          district: selected.district || farmerProfile?.district || 'Vijayawada',
          totalLandArea: selected.totalArea?.toString() || '2.0',
          areaUnit: selected.areaUnit || 'Acres',
          ownershipType: selected.ownershipType || 'Owned',
        });
        setCropsList([
          {
            id: 1,
            cropName: 'Paddy (BPT 5204)',
            cropCategory: 'Cereals & Food Grains',
            cultivatedArea: selected.totalArea?.toString() || '2.0',
            season: 'Kharif',
            year: new Date().getFullYear().toString(),
            sowingDate: new Date().toISOString().split('T')[0],
            harvestDate: '',
            irrigationType: 'Borewell',
            fertilizersUsed: 'Urea (2 Bags), DAP (1 Bag), Potash (1 Bag)',
            pesticidesUsed: 'Organic Neem Oil, Chlorpyrifos',
            expectedHarvest: '40 Quintals',
          }
        ]);
      }
    }
  };

  const handleLandDataChange = (e) => {
    const { name, value } = e.target;
    setLandData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setLandSuccess('');

    // If total land area changed on new parcel, update first crop if only 1 crop exists
    if (name === 'totalLandArea' && cropsList.length === 1) {
      setCropsList((prev) => [{ ...prev[0], cultivatedArea: value }]);
    }
  };

  // Explicitly Save New Land Parcel to Profile
  const handleSaveLandParcel = async () => {
    if (!landData.surveyNumber || !landData.surveyNumber.trim()) {
      return setError('Please enter a Survey Number for the land parcel (e.g. 88/1).');
    }
    if (!landData.totalLandArea || parseFloat(landData.totalLandArea) <= 0) {
      return setError('Please enter a valid Total Land Area in Acres.');
    }

    setSavingLand(true);
    setError('');
    setLandSuccess('');

    try {
      const res = await apiClient.post('/farmers/lands', {
        surveyNumber: landData.surveyNumber.trim(),
        totalArea: parseFloat(landData.totalLandArea),
        village: landData.village || farmerProfile?.village || 'Village',
        mandal: landData.mandal || farmerProfile?.mandal || '',
        district: landData.district || farmerProfile?.district || 'Vijayawada',
        areaUnit: landData.areaUnit || 'Acres',
        ownershipType: landData.ownershipType || 'Owned'
      });

      if (res.data.success) {
        const newLand = res.data.land;
        setExistingLands((prev) => [newLand, ...prev.filter((l) => l._id !== newLand._id)]);
        setSelectedLandId(newLand._id);
        setLandSuccess(`✅ Land Parcel (Survey No. ${newLand.surveyNumber} — ${newLand.totalArea} Acres) saved successfully!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save new land parcel');
    } finally {
      setSavingLand(false);
    }
  };

  // Crop list manipulation
  const handleCropChange = (index, field, value) => {
    const updated = [...cropsList];
    updated[index][field] = value;
    setCropsList(updated);
    setError('');
  };

  const addAnotherCrop = () => {
    const totalAreaNum = parseFloat(landData.totalLandArea) || 0;
    const currentAllocated = cropsList.reduce((acc, c) => acc + (parseFloat(c.cultivatedArea) || 0), 0);
    const remaining = Math.max(0, totalAreaNum - currentAllocated);

    setCropsList([
      ...cropsList,
      {
        id: Date.now(),
        cropName: 'Guava (Lucknow 49 / Sardar)',
        cropCategory: 'Fruits & Horticulture',
        cultivatedArea: remaining > 0 ? remaining.toFixed(1) : '1.0',
        season: 'Kharif',
        year: new Date().getFullYear().toString(),
        sowingDate: new Date().toISOString().split('T')[0],
        harvestDate: '',
        irrigationType: 'Drip Irrigation',
        fertilizersUsed: 'FYM (5 Bags), Vermicompost, NPK',
        pesticidesUsed: 'Neem Oil, Trichoderma',
        expectedHarvest: '25 Quintals',
      }
    ]);
  };

  const removeCrop = (index) => {
    if (cropsList.length <= 1) return;
    setCropsList(cropsList.filter((_, idx) => idx !== index));
  };

  const handleDocumentsUpdated = (updatedDocs) => {
    if (farmerProfile) {
      setFarmerProfile({ ...farmerProfile, documents: updatedDocs });
    }
  };

  // Total allocated area calculation
  const totalLandNum = parseFloat(landData.totalLandArea) || 0;
  const totalCultivatedSum = cropsList.reduce((acc, c) => acc + (parseFloat(c.cultivatedArea) || 0), 0);
  const remainingLand = totalLandNum - totalCultivatedSum;
  const isAreaExceeded = totalLandNum > 0 && totalCultivatedSum > totalLandNum;

  const handleSubmit = async (isDraft = false) => {
    setError('');
    setSuccess('');

    if (!landData.surveyNumber || !landData.surveyNumber.trim()) {
      return setError('Please provide the Survey Number for this land parcel.');
    }
    if (!landData.totalLandArea || parseFloat(landData.totalLandArea) <= 0) {
      return setError('Please enter a valid Total Land Area in Acres.');
    }

    for (let i = 0; i < cropsList.length; i++) {
      const c = cropsList[i];
      if (!c.cropName || !c.cultivatedArea || !c.sowingDate) {
        return setError(`Please complete all required fields for Crop #${i + 1} (${c.cropName || 'Entry'}).`);
      }
    }

    setLoading(true);
    try {
      const payload = {
        landId: selectedLandId !== 'new' ? selectedLandId : undefined,
        surveyNumber: landData.surveyNumber.trim(),
        village: landData.village,
        mandal: landData.mandal,
        district: landData.district,
        totalLandArea: parseFloat(landData.totalLandArea),
        areaUnit: landData.areaUnit,
        ownershipType: landData.ownershipType,
        crops: cropsList.map((c) => ({
          cropName: c.cropName,
          cropCategory: c.cropCategory,
          cultivatedArea: parseFloat(c.cultivatedArea),
          season: c.season,
          year: parseInt(c.year, 10),
          sowingDate: c.sowingDate,
          harvestDate: c.harvestDate || undefined,
          irrigationType: c.irrigationType,
          fertilizersUsed: c.fertilizersUsed,
          pesticidesUsed: c.pesticidesUsed,
          expectedHarvest: c.expectedHarvest,
        })),
        isDraft,
      };

      const res = await apiClient.post('/farmers/crops', payload);

      if (res.data.success) {
        if (!isDraft) {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 }
          });
          setSuccess(
            `${cropsList.length} crop record(s) registered successfully on Survey No. ${landData.surveyNumber}!`
          );
        } else {
          setSuccess('Draft crop registrations saved successfully!');
        }

        setTimeout(() => {
          navigate('/farmer/crops');
        }, 1600);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit crop application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div>
        <Link
          to="/farmer/crops"
          className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Records
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          🌾 Register Crops & Land Parcels
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Select or add your land parcels, define multiple crops cultivated on each parcel, and submit for verification.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs sm:text-sm border border-rose-200 flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-xs sm:text-sm border border-emerald-200 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: Farmer Identity Details */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-forest-600" />
            <h3 className="font-bold text-base text-slate-800">
              1. Farmer Identity & Location Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Farmer Name
              </span>
              <strong className="text-sm text-slate-800">{user?.name || 'Ramesh Patel'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Mobile Number
              </span>
              <strong className="text-sm text-slate-800">{user?.phone || '+91 98480 11223'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Registered Location
              </span>
              <strong className="text-sm text-slate-800">
                {farmerProfile?.village || 'Kankipadu'}, {farmerProfile?.district || 'Vijayawada'}
              </strong>
            </div>
          </div>
        </div>

        {/* Section 2: Verification Documents */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileCheck className="w-5 h-5 text-forest-600" />
            <h3 className="font-bold text-base text-slate-800">
              2. Verification Documents (Aadhaar, Passbook, Land Record)
            </h3>
          </div>

          <DocumentUploader
            documents={farmerProfile?.documents}
            onDocumentUpdated={handleDocumentsUpdated}
          />
        </div>

        {/* Section 3: Land Parcel Selection & Multi-Crop Schedule */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <LandPlot className="w-5 h-5 text-forest-600" />
              <h3 className="font-bold text-base text-slate-800">
                3. Land Parcel Selection & Crop Schedule
              </h3>
            </div>

            {existingLands.length > 0 && (
              <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-xl border border-forest-200">
                {existingLands.length} Land Parcel(s) on file
              </span>
            )}
          </div>

          {/* Land Parcel Choice Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Registered Land Parcel:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {existingLands.map((land) => {
                const isSelected = selectedLandId === land._id;
                return (
                  <button
                    key={land._id}
                    type="button"
                    onClick={() => handleLandSelectionChange(land._id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-forest-600 bg-forest-50/80 shadow-md ring-2 ring-forest-400/30'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-forest-800">
                          Survey No. {land.surveyNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          {land.ownershipType || 'Owned'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold">
                        {land.village || 'Village'}, {land.district || 'District'}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs font-bold text-slate-800">
                      {land.totalArea} {land.areaUnit || 'Acres'}
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleLandSelectionChange('new')}
                className={`p-3.5 rounded-2xl border-2 border-dashed text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  selectedLandId === 'new'
                    ? 'border-forest-600 bg-forest-50 text-forest-800 ring-2 ring-forest-400/30 shadow-sm'
                    : 'border-slate-300 hover:border-forest-500 hover:bg-forest-50/30 text-slate-600'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-bold">+ Add New Land Parcel</span>
              </button>
            </div>
          </div>

          {/* Land Parcel Form Block */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-forest-600" />
                {selectedLandId === 'new' ? 'New Land Parcel Details' : `Selected Land: Survey No. ${landData.surveyNumber}`}
              </h4>

              {/* Direct Save Land Button when creating a new parcel */}
              {selectedLandId === 'new' && (
                <button
                  type="button"
                  onClick={handleSaveLandParcel}
                  disabled={savingLand || !landData.surveyNumber}
                  className="px-4 py-1.5 bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingLand ? 'Saving Land...' : 'Save Land Parcel to List'}</span>
                </button>
              )}
            </div>

            {landSuccess && (
              <div className="p-3 bg-emerald-100/80 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{landSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Survey Number *
                </label>
                <input
                  type="text"
                  name="surveyNumber"
                  value={landData.surveyNumber}
                  onChange={handleLandDataChange}
                  placeholder="e.g. 125/2 or 88/1"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Total Land Parcel Area (Acres) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  name="totalLandArea"
                  value={landData.totalLandArea}
                  onChange={handleLandDataChange}
                  placeholder="e.g. 2.5"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Land Ownership Status
                </label>
                <select
                  name="ownershipType"
                  value={landData.ownershipType}
                  onChange={handleLandDataChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none"
                >
                  <option value="Owned">Owned Land</option>
                  <option value="Leased">Leased / Tenant</option>
                  <option value="Worker">Worker / Cultivator</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Village / Town
                </label>
                <input
                  type="text"
                  name="village"
                  value={landData.village}
                  onChange={handleLandDataChange}
                  placeholder="e.g. Kankipadu"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mandal
                </label>
                <input
                  type="text"
                  name="mandal"
                  value={landData.mandal}
                  onChange={handleLandDataChange}
                  placeholder="e.g. Penamaluru"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  District & State
                </label>
                <input
                  type="text"
                  name="district"
                  value={landData.district}
                  onChange={handleLandDataChange}
                  placeholder="e.g. Vijayawada, AP"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Real-Time Land Allocation Bar */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-1">
              <span className="text-slate-700">
                Land Parcel Allocation (Survey No. {landData.surveyNumber || 'New'}):
              </span>
              <span className={isAreaExceeded ? 'text-rose-600' : 'text-emerald-800'}>
                Allocated: <strong>{totalCultivatedSum.toFixed(1)}</strong> / {totalLandNum.toFixed(1)} Acres{' '}
                {remainingLand >= 0 ? `(${remainingLand.toFixed(1)} Acres unallocated)` : `(⚠️ Exceeded by ${Math.abs(remainingLand).toFixed(1)} Acres)`}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  isAreaExceeded ? 'bg-rose-500' : 'bg-forest-600'
                }`}
                style={{
                  width: `${Math.min(100, totalLandNum > 0 ? (totalCultivatedSum / totalLandNum) * 100 : 0)}%`
                }}
              />
            </div>
          </div>

          {/* Multiple Crops List on this Land Parcel */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-forest-600" />
                Crops Cultivated on this Land Parcel ({cropsList.length})
              </h4>

              <button
                type="button"
                onClick={addAnotherCrop}
                className="px-3.5 py-1.5 bg-forest-100 hover:bg-forest-200 text-forest-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                + Add Another Crop on this Land
              </button>
            </div>

            {cropsList.map((crop, index) => (
              <div
                key={crop.id || index}
                className="p-5 bg-white rounded-2xl border-2 border-forest-100 shadow-sm space-y-4 transition-all hover:border-forest-300"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-forest-800 bg-forest-100 px-3 py-1 rounded-xl">
                    🌾 Crop #{index + 1}: {crop.cropName || 'New Crop'}
                  </span>

                  {cropsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCrop(index)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove this crop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Crop</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Crop Category *
                    </label>
                    <select
                      value={crop.cropCategory}
                      onChange={(e) => handleCropChange(index, 'cropCategory', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none font-semibold"
                    >
                      <option value="Cereals & Food Grains">🌾 Cereals & Food Grains (Paddy, Wheat, Maize)</option>
                      <option value="Fruits & Horticulture">🍎 Fruits & Horticulture (Guava, Mango, Banana)</option>
                      <option value="Pulses & Legumes">🌱 Pulses & Legumes (Red Gram, Bengal Gram)</option>
                      <option value="Commercial & Cash Crops">🌿 Commercial & Cash Crops (Cotton, Sugarcane)</option>
                      <option value="Vegetables">🥦 Vegetables (Tomato, Brinjal, Okra, Chilli)</option>
                      <option value="Oilseeds">🌻 Oilseeds (Groundnut, Mustard, Soybean)</option>
                      <option value="Spices & Condiments">🌶️ Spices & Condiments (Chilli, Turmeric)</option>
                      <option value="Other">🍃 Other Crops</option>
                    </select>
                  </div>

                  {/* Crop Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Crop Name & Variety *
                    </label>
                    <input
                      type="text"
                      value={crop.cropName}
                      onChange={(e) => handleCropChange(index, 'cropName', e.target.value)}
                      placeholder="e.g. Paddy (BPT 5204) or Guava (Lucknow 49)"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none font-semibold"
                    />
                  </div>

                  {/* Cultivated Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cultivated Area (Acres) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={crop.cultivatedArea}
                      onChange={(e) => handleCropChange(index, 'cultivatedArea', e.target.value)}
                      placeholder="e.g. 2.0"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none font-bold"
                    />
                  </div>

                  {/* Season */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Crop Season *
                    </label>
                    <select
                      value={crop.season}
                      onChange={(e) => handleCropChange(index, 'season', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
                    >
                      <option value="Kharif">Kharif (Monsoon)</option>
                      <option value="Rabi">Rabi (Winter)</option>
                      <option value="Zaid">Zaid (Summer)</option>
                      <option value="Annual">Annual / Cash Crop</option>
                      <option value="Perennial">Perennial / Orchard</option>
                    </select>
                  </div>

                  {/* Sowing Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sowing Start Date *
                    </label>
                    <input
                      type="date"
                      value={crop.sowingDate}
                      onChange={(e) => handleCropChange(index, 'sowingDate', e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
                    />
                  </div>

                  {/* Irrigation Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Irrigation Source
                    </label>
                    <select
                      value={crop.irrigationType}
                      onChange={(e) => handleCropChange(index, 'irrigationType', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
                    >
                      <option value="Borewell">Borewell</option>
                      <option value="Canal">Canal</option>
                      <option value="Rainfed">Rainfed</option>
                      <option value="Drip Irrigation">Drip Irrigation</option>
                      <option value="Sprinkler">Sprinkler</option>
                    </select>
                  </div>

                  {/* Expected Harvest */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expected Harvest Output
                    </label>
                    <input
                      type="text"
                      value={crop.expectedHarvest}
                      onChange={(e) => handleCropChange(index, 'expectedHarvest', e.target.value)}
                      placeholder="e.g. 40 Quintals"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
                    />
                  </div>

                  {/* Fertilizers & Pesticides */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fertilizers & Pesticides Planned / Used
                    </label>
                    <input
                      type="text"
                      value={crop.fertilizersUsed}
                      onChange={(e) => handleCropChange(index, 'fertilizersUsed', e.target.value)}
                      placeholder="e.g. Urea (2 Bags), DAP (1 Bag), Organic Neem Oil"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Presets:</span>
                  {[
                    { name: 'Paddy (BPT 5204)', cat: 'Cereals & Food Grains' },
                    { name: 'Guava (Lucknow 49 / Sardar)', cat: 'Fruits & Horticulture' },
                    { name: 'Cotton (Bt Hybrid)', cat: 'Commercial & Cash Crops' },
                    { name: 'Chilli (Teja)', cat: 'Spices & Condiments' },
                    { name: 'Red Gram (Tur)', cat: 'Pulses & Legumes' },
                    { name: 'Tomato (Arka)', cat: 'Vegetables' },
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        handleCropChange(index, 'cropName', preset.name);
                        handleCropChange(index, 'cropCategory', preset.cat);
                      }}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-lg border bg-slate-50 hover:bg-forest-50 text-slate-700 border-slate-200"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-forest-600 hover:bg-forest-700 text-white font-extrabold rounded-2xl shadow-lg shadow-forest-200 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Submitting...' : `Submit ${cropsList.length} Crop(s) for Verification`}
          </button>
        </div>
      </div>
    </div>
  );
}
