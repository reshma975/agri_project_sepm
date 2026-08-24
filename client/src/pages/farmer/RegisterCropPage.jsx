import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import DocumentUploader from '../../components/farmer/DocumentUploader';
import CropDetailsModal from '../../components/farmer/CropDetailsModal';
import StatusBadge from '../../components/common/StatusBadge';
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
  Check,
  ShieldCheck,
  Eye,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

export default function RegisterCropPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [farmerProfile, setFarmerProfile] = useState(null);
  const [existingLands, setExistingLands] = useState([]);
  const [allFarmerCrops, setAllFarmerCrops] = useState([]);
  const [selectedLandId, setSelectedLandId] = useState('new'); // 'new' or Land._id
  const [loading, setLoading] = useState(false);
  const [savingLand, setSavingLand] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [landSuccess, setLandSuccess] = useState('');

  // Expand / collapse documents section if documents are already on file
  const [showDocUploader, setShowDocUploader] = useState(false);

  // Selected existing crop modal state
  const [selectedCropModal, setSelectedCropModal] = useState(null);

  // Land Parcel Info (Matches Land Model Schema)
  const [landData, setLandData] = useState({
    surveyNumber: '',
    village: '',
    mandal: '',
    district: 'Vijayawada',
    totalLandArea: '2.0',
    areaUnit: 'Acres',
    ownershipType: 'Owned',
  });

  // New crops being registered on this land parcel (starts empty until user clicks + Add Crop)
  const [cropsList, setCropsList] = useState([]);

  const loadData = async () => {
    try {
      const [profileRes, cropsRes] = await Promise.all([
        apiClient.get('/farmers/profile'),
        apiClient.get('/farmers/crops').catch(() => ({ data: { crops: [] } }))
      ]);

      if (profileRes.data.success) {
        setFarmerProfile(profileRes.data.profile);
        const lands = profileRes.data.lands || [];
        setExistingLands(lands);

        const crops = cropsRes.data?.crops || [];
        setAllFarmerCrops(crops);

        const preselectedSurvey = searchParams.get('survey');

        if (lands.length > 0) {
          const matchedLand = preselectedSurvey
            ? lands.find((l) => l.surveyNumber === preselectedSurvey) || lands[0]
            : lands[0];

          setSelectedLandId(matchedLand._id);

          setLandData({
            surveyNumber: matchedLand.surveyNumber || '',
            village: matchedLand.village || profileRes.data.profile?.village || '',
            mandal: matchedLand.mandal || profileRes.data.profile?.mandal || '',
            district: matchedLand.district || profileRes.data.profile?.district || 'Vijayawada',
            totalLandArea: matchedLand.totalArea?.toString() || '2.0',
            areaUnit: matchedLand.areaUnit || 'Acres',
            ownershipType: matchedLand.ownershipType || 'Owned',
          });

          setCropsList([]);
        } else {
          setSelectedLandId('new');
          setLandData({
            surveyNumber: '125/2',
            village: profileRes.data.profile?.village || 'Kankipadu',
            mandal: profileRes.data.profile?.mandal || 'Penamaluru',
            district: profileRes.data.profile?.district || 'Vijayawada',
            totalLandArea: '2.0',
            areaUnit: 'Acres',
            ownershipType: 'Owned',
          });
          setCropsList([]);
        }
      }
    } catch (err) {
      console.error('Error fetching farmer profile, lands and crops:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  // Existing crops on the currently selected land parcel
  const existingCropsOnCurrentLand = allFarmerCrops.filter((c) => {
    if (selectedLandId !== 'new') {
      return (
        (c.landId && (c.landId._id === selectedLandId || c.landId === selectedLandId)) ||
        c.surveyNumber === landData.surveyNumber
      );
    }
    return c.surveyNumber && c.surveyNumber === landData.surveyNumber;
  });

  const alreadyAllocatedOnLand = existingCropsOnCurrentLand.reduce(
    (sum, c) => sum + (c.cultivatedArea || 0),
    0
  );

  // Handle switching selected land parcel
  const handleLandSelectionChange = (landIdValue) => {
    setSelectedLandId(landIdValue);
    setError('');
    setLandSuccess('');
    setCropsList([]);

    if (landIdValue === 'new') {
      setLandData({
        surveyNumber: '',
        village: farmerProfile?.village || 'Kankipadu',
        mandal: farmerProfile?.mandal || 'Penamaluru',
        district: farmerProfile?.district || 'Vijayawada',
        totalLandArea: '2.0',
        areaUnit: 'Acres',
        ownershipType: 'Owned',
      });
    } else {
      const selected = existingLands.find((l) => l._id === landIdValue);
      if (selected) {
        setLandData({
          surveyNumber: selected.surveyNumber,
          village: selected.village || farmerProfile?.village || '',
          mandal: selected.mandal || farmerProfile?.mandal || '',
          district: selected.district || farmerProfile?.district || 'Vijayawada',
          totalLandArea: selected.totalArea?.toString() || '2.0',
          areaUnit: selected.areaUnit || 'Acres',
          ownershipType: selected.ownershipType || 'Owned',
        });
      }
    }
  };

  const handleLandDataChange = (e) => {
    const { name, value } = e.target;
    setLandData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setLandSuccess('');

    if (name === 'totalLandArea' && cropsList.length === 1 && selectedLandId === 'new') {
      setCropsList((prev) => [{ ...prev[0], cultivatedArea: value }]);
    }
  };

  // Explicitly Save New Land Parcel to Profile
  const handleSaveLandParcel = async () => {
    if (!landData.surveyNumber || !landData.surveyNumber.trim()) {
      return setError('Please enter a Survey Number for the land parcel (e.g. 88/1).');
    }
    if (!landData.totalLandArea || parseFloat(landData.totalLandArea) <= 0) {
      return setError('Please enter a valid Total Land Area.');
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
        setLandSuccess(`✅ Land Parcel (Survey No. ${newLand.surveyNumber} — ${newLand.totalArea} ${newLand.areaUnit}) saved successfully!`);
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
    const currentNewlyAllocated = cropsList.reduce((acc, c) => acc + (parseFloat(c.cultivatedArea) || 0), 0);
    const remaining = Math.max(0, totalAreaNum - alreadyAllocatedOnLand - currentNewlyAllocated);

    setCropsList((prev) => [
      ...prev,
      {
        id: Date.now(),
        cropName: '',
        cropCategory: 'Cereals',
        cultivatedArea: remaining > 0 ? remaining.toFixed(1) : '1.0',
        season: 'Kharif',
        year: new Date().getFullYear().toString(),
        sowingDate: new Date().toISOString().split('T')[0],
        harvestDate: '',
        irrigationType: 'Borewell',
        fertilizersUsed: '',
        pesticidesUsed: '',
        expectedHarvest: '',
      }
    ]);
  };

  const removeCrop = (index) => {
    setCropsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDocumentsUpdated = (updatedDocs) => {
    if (farmerProfile) {
      setFarmerProfile({ ...farmerProfile, documents: updatedDocs });
    }
  };

  // Check if documents are already on file
  const hasDocumentsOnFile =
    farmerProfile?.documents?.aadhaarDoc?.fileName ||
    farmerProfile?.documents?.passbookDoc?.fileName ||
    farmerProfile?.documents?.landRecordDoc?.fileName;

  // Total allocated area calculation
  const totalLandNum = parseFloat(landData.totalLandArea) || 0;
  const newCropsSum = cropsList.reduce((acc, c) => acc + (parseFloat(c.cultivatedArea) || 0), 0);
  const totalAllocatedSum = alreadyAllocatedOnLand + newCropsSum;
  const remainingLand = totalLandNum - totalAllocatedSum;
  const isAreaExceeded = totalLandNum > 0 && totalAllocatedSum > totalLandNum;

  const handleSubmit = async (isDraft = false) => {
    setError('');
    setSuccess('');

    if (!landData.surveyNumber || !landData.surveyNumber.trim()) {
      return setError('Please provide the Survey Number for this land parcel.');
    }
    if (!landData.totalLandArea || parseFloat(landData.totalLandArea) <= 0) {
      return setError(`Please enter a valid Total Land Area in ${landData.areaUnit}.`);
    }

    if (cropsList.length === 0) {
      return setError('Please click "+ Add Crop" to add at least one crop before saving or submitting.');
    }

    for (let i = 0; i < cropsList.length; i++) {
      const c = cropsList[i];
      if (!c.cropName || !c.cropName.trim()) {
        return setError(`Please provide a crop name for Crop #${i + 1}.`);
      }
      if (!c.cultivatedArea || parseFloat(c.cultivatedArea) <= 0) {
        return setError(`Please enter a valid cultivated area for Crop #${i + 1} (${c.cropName}).`);
      }
      if (!c.sowingDate) {
        return setError(`Please select a sowing start date for Crop #${i + 1} (${c.cropName}).`);
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
          cropName: c.cropName.trim(),
          cropCategory: c.cropCategory,
          cultivatedArea: parseFloat(c.cultivatedArea),
          season: c.season,
          year: parseInt(c.year, 10),
          sowingDate: c.sowingDate,
          harvestDate: c.harvestDate || undefined,
          irrigationType: c.irrigationType,
          fertilizersUsed: c.fertilizersUsed?.trim() || '',
          pesticidesUsed: c.pesticidesUsed?.trim() || '',
          expectedHarvest: c.expectedHarvest?.trim() || '',
        })),
        isDraft,
      };

      const res = await apiClient.post('/farmers/crops', payload);

      if (res.data.success) {
        if (!isDraft) {
          try {
            confetti({
              particleCount: 90,
              spread: 80,
              origin: { y: 0.6 }
            });
          } catch (e) {}
          setSuccess(
            `${cropsList.length} crop record(s) registered successfully on Survey No. ${landData.surveyNumber}!`
          );
        } else {
          setSuccess('Draft crop registrations saved successfully! You can submit them anytime.');
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
      {/* Top Header & Navigation */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Link
            to="/farmer/crops"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200/80 transition-all shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Farm Records
          </Link>
          <Link
            to="/farmer/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all"
          >
            Dashboard
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
          <span className="text-emerald-400">🌾</span>
          <span className="text-white font-extrabold">Register Crops & Land Parcels</span>
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
          Select or add your land parcels, view existing crops on the parcel, add new seasonal crops, and submit for verification.
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

        {/* Section 2: Verification Documents (Asked once on Profile) */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-forest-600" />
              <h3 className="font-bold text-base text-slate-800">
                2. Verification Documents (Profile-Level)
              </h3>
            </div>

            {hasDocumentsOnFile && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Documents on File</span>
              </span>
            )}
          </div>

          {hasDocumentsOnFile && !showDocUploader ? (
            /* Compact verified document summary banner */
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    Identity & Land Records Stored on Profile
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Your Aadhaar Card, Bank Passbook, and Land Title copies are already uploaded to your Farmer Profile. They apply automatically to all your crop registrations.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {farmerProfile?.documents?.aadhaarDoc?.fileName && (
                      <span className="text-[11px] font-mono bg-white text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-200">
                        ✓ Aadhaar ({farmerProfile.documents.aadhaarDoc.fileName})
                      </span>
                    )}
                    {farmerProfile?.documents?.passbookDoc?.fileName && (
                      <span className="text-[11px] font-mono bg-white text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-200">
                        ✓ Passbook ({farmerProfile.documents.passbookDoc.fileName})
                      </span>
                    )}
                    {farmerProfile?.documents?.landRecordDoc?.fileName && (
                      <span className="text-[11px] font-mono bg-white text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-200">
                        ✓ Land Record ({farmerProfile.documents.landRecordDoc.fileName})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDocUploader(true)}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center gap-1.5 self-end sm:self-center flex-shrink-0"
              >
                <span>View / Update Files</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {hasDocumentsOnFile && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDocUploader(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <span>Hide Document Uploader</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <DocumentUploader
                documents={farmerProfile?.documents}
                onDocumentUpdated={handleDocumentsUpdated}
              />
            </div>
          )}
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
                const parcelCrops = allFarmerCrops.filter(
                  (c) =>
                    (c.landId && (c.landId._id === land._id || c.landId === land._id)) ||
                    c.surveyNumber === land.surveyNumber
                );

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

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {land.totalArea} {land.areaUnit || 'Acres'}
                      </span>
                      <span className="text-[11px] font-semibold text-forest-700 bg-forest-100 px-2 py-0.5 rounded-md">
                        {parcelCrops.length} Crop{parcelCrops.length !== 1 ? 's' : ''} on record
                      </span>
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
                {selectedLandId === 'new'
                  ? 'New Land Parcel Details'
                  : `Selected Land: Survey No. ${landData.surveyNumber}`}
              </h4>

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
                  Total Land Parcel Area *
                </label>
                <div className="flex gap-2">
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
                  <select
                    name="areaUnit"
                    value={landData.areaUnit}
                    onChange={handleLandDataChange}
                    className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none font-semibold text-slate-700"
                  >
                    <option value="Acres">Acres</option>
                    <option value="Hectares">Hectares</option>
                    <option value="Guntas">Guntas</option>
                    <option value="Cents">Cents</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Land Ownership Status
                </label>
                <select
                  name="ownershipType"
                  value={landData.ownershipType}
                  onChange={handleLandDataChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none font-semibold"
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
                  placeholder="e.g. Vijayawada"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-forest-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* CROPS ALREADY REGISTERED ON THIS LAND PARCEL */}
          {existingCropsOnCurrentLand.length > 0 && (
            <div className="p-5 bg-forest-50/60 rounded-2xl border border-forest-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-forest-700" />
                  <span>
                    Existing Crops Registered on Survey No. {landData.surveyNumber} ({existingCropsOnCurrentLand.length})
                  </span>
                </h4>
                <span className="text-[11px] font-bold text-forest-800">
                  Total on Record: {alreadyAllocatedOnLand.toFixed(1)} {landData.areaUnit}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {existingCropsOnCurrentLand.map((crop) => (
                  <div
                    key={crop._id}
                    className="p-3.5 bg-white rounded-xl border border-forest-200 shadow-2xs flex flex-col justify-between space-y-2 hover:border-forest-400 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <strong className="text-xs font-extrabold text-slate-900 block truncate">
                          {crop.cropName}
                        </strong>
                        <StatusBadge status={crop.status} />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {crop.cultivatedArea} {crop.areaUnit || 'Acres'} • {crop.season} ({crop.year})
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        {crop.registrationId}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCropModal(crop)}
                        className="text-[11px] font-bold text-forest-700 hover:text-forest-900 underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View / Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real-Time Land Allocation Bar */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-1">
              <span className="text-slate-700">
                Land Parcel Allocation (Survey No. {landData.surveyNumber || 'New'}):
              </span>
              <span className={isAreaExceeded ? 'text-rose-600' : 'text-emerald-800'}>
                {alreadyAllocatedOnLand > 0 ? `Already on File: ${alreadyAllocatedOnLand.toFixed(1)} + ` : ''}
                Newly Adding: <strong>{newCropsSum.toFixed(1)}</strong> / {totalLandNum.toFixed(1)} {landData.areaUnit}{' '}
                {remainingLand >= 0
                  ? `(${remainingLand.toFixed(1)} ${landData.areaUnit} unallocated)`
                  : `(⚠️ Exceeded by ${Math.abs(remainingLand).toFixed(1)} ${landData.areaUnit})`}
              </span>
            </div>

            {/* Visual Progress Bar with Segmented Fill */}
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex shadow-inner">
              {alreadyAllocatedOnLand > 0 && (
                <div
                  className="bg-forest-800 h-full transition-all duration-300 border-r border-white/40"
                  title={`Already Registered: ${alreadyAllocatedOnLand} ${landData.areaUnit}`}
                  style={{
                    width: `${Math.min(100, totalLandNum > 0 ? (alreadyAllocatedOnLand / totalLandNum) * 100 : 0)}%`
                  }}
                />
              )}
              <div
                className={`h-full transition-all duration-300 ${
                  isAreaExceeded ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                title={`Newly Adding: ${newCropsSum} ${landData.areaUnit}`}
                style={{
                  width: `${Math.min(
                    100 - (totalLandNum > 0 ? (alreadyAllocatedOnLand / totalLandNum) * 100 : 0),
                    totalLandNum > 0 ? (newCropsSum / totalLandNum) * 100 : 0
                  )}%`
                }}
              />
            </div>
          </div>

          {/* NEW CROPS LIST TO REGISTER */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-forest-600" />
                {existingCropsOnCurrentLand.length > 0
                  ? `Add Crops to Survey No. ${landData.surveyNumber || 'Land'}${cropsList.length > 0 ? ` (${cropsList.length})` : ''}`
                  : `Crops to Cultivate on Survey No. ${landData.surveyNumber || 'New Land'}${cropsList.length > 0 ? ` (${cropsList.length})` : ''}`}
              </h4>

              <button
                type="button"
                onClick={addAnotherCrop}
                className="px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                <span>{cropsList.length === 0 ? '+ Add Crop' : '+ Add Another Crop'}</span>
              </button>
            </div>

            {cropsList.length > 0 &&
              cropsList.map((crop, index) => (
                <div
                  key={crop.id || index}
                  className="p-5 bg-white rounded-2xl border-2 border-forest-100 shadow-sm space-y-4 transition-all hover:border-forest-300 animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-forest-800 bg-forest-100 px-3 py-1 rounded-xl">
                      🌾 Crop #{index + 1}: {crop.cropName || 'New Crop Entry'}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeCrop(index)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove this crop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
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
                        <option value="Cereals">🌾 Cereals & Food Grains (Paddy, Wheat, Maize, Millets)</option>
                        <option value="Pulses">🌱 Pulses & Legumes (Red Gram, Bengal Gram, Green Gram)</option>
                        <option value="Oilseeds">🌻 Oilseeds (Groundnut, Mustard, Soybean, Sunflower)</option>
                        <option value="Commercial / Cash">🌿 Commercial / Cash (Cotton, Sugarcane, Tobacco, Jute)</option>
                        <option value="Horticulture">🌳 Horticulture & Plantation (Coconut, Rubber, Areca, Spices)</option>
                        <option value="Vegetables">🥦 Vegetables (Tomato, Brinjal, Okra, Chilli, Onion)</option>
                        <option value="Fruits">🍎 Fruits (Guava, Mango, Banana, Papaya, Citrus)</option>
                        <option value="Other">🌾 Other Crops</option>
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
                        placeholder="e.g. Paddy (BPT 5204) or Chilli"
                        required
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none font-bold text-slate-800"
                      />
                    </div>

                    {/* Cultivated Area */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cultivated Area ({landData.areaUnit}) *
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
                        <option value="Kharif">Kharif (Monsoon Season)</option>
                        <option value="Rabi">Rabi (Winter Season)</option>
                        <option value="Zaid">Zaid (Summer Season)</option>
                        <option value="Annual">Annual Crop</option>
                        <option value="Perennial">Perennial Plantation</option>
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
                        <option value="Canal">Canal Irrigation</option>
                        <option value="Rainfed">Rainfed (Monsoon)</option>
                        <option value="Drip Irrigation">Drip Irrigation</option>
                        <option value="Sprinkler">Sprinkler</option>
                        <option value="Well">Open Well</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Harvest Yield */}
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
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Fertilizers & Pesticides Planned / Used
                      </label>
                      <input
                        type="text"
                        value={crop.fertilizersUsed}
                        onChange={(e) => handleCropChange(index, 'fertilizersUsed', e.target.value)}
                        placeholder="e.g. Urea (2 Bags), DAP (1 Bag), Neem Oil"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-forest-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Presets:</span>
                    {[
                      { name: 'Paddy (BPT 5204)', cat: 'Cereals' },
                      { name: 'Guava (Lucknow 49)', cat: 'Fruits' },
                      { name: 'Cotton (Bt Hybrid)', cat: 'Commercial / Cash' },
                      { name: 'Chilli (Teja)', cat: 'Vegetables' },
                      { name: 'Red Gram (Tur)', cat: 'Pulses' },
                      { name: 'Groundnut (TMV 2)', cat: 'Oilseeds' },
                      { name: 'Tomato (Arka Rakshak)', cat: 'Vegetables' },
                      { name: 'Coconut (Tall x Dwarf)', cat: 'Horticulture' }
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          handleCropChange(index, 'cropName', preset.name);
                          handleCropChange(index, 'cropCategory', preset.cat);
                        }}
                        className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-forest-100 hover:text-forest-800 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200 shadow-md">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Ready to Save or Submit for Verification?
            </h4>
            <p className="text-xs text-slate-500">
              {cropsList.length === 0
                ? 'Click "+ Add Crop" above to configure a crop before saving or submitting.'
                : 'You can save as a draft to edit anytime or submit directly for government officer review.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={loading || cropsList.length === 0}
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-none px-5 py-3 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-forest-700" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={loading || isAreaExceeded || cropsList.length === 0}
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-none px-6 py-3 bg-forest-600 hover:bg-forest-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-forest-200 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit for Verification'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Crop Inspection Modal */}
      {selectedCropModal && (
        <CropDetailsModal
          isOpen={!!selectedCropModal}
          onClose={() => setSelectedCropModal(null)}
          crop={selectedCropModal}
          onCropUpdated={(updated) => {
            setAllFarmerCrops((prev) =>
              prev.map((c) => (c._id === updated._id ? updated : c))
            );
            setSelectedCropModal(updated);
          }}
        />
      )}
    </div>
  );
}
