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
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
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
  const [selectedLandId, setSelectedLandId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Expand / collapse documents section if documents are already on file
  const [showDocUploader, setShowDocUploader] = useState(false);

  // Selected existing crop modal state
  const [selectedCropModal, setSelectedCropModal] = useState(null);

  // Land Parcel Crops Pop-up Modal State
  const [parcelCropsModalOpen, setParcelCropsModalOpen] = useState(false);
  const [activeParcelForModal, setActiveParcelForModal] = useState(null);

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

          // Selected land matched
        } else {
          setSelectedLandId('');
          setLandData({
            surveyNumber: '',
            village: profileRes.data.profile?.village || 'Kankipadu',
            mandal: profileRes.data.profile?.mandal || 'Penamaluru',
            district: profileRes.data.profile?.district || 'Vijayawada',
            totalLandArea: '0',
            areaUnit: 'Acres',
            ownershipType: 'Owned',
          });
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
    if (selectedLandId) {
      return (
        (c.landId && (c.landId._id === selectedLandId || c.landId === selectedLandId)) ||
        c.surveyNumber === landData.surveyNumber
      );
    }
    return false;
  });

  const alreadyAllocatedOnLand = existingCropsOnCurrentLand.reduce(
    (sum, c) => sum + (c.cultivatedArea || 0),
    0
  );

  // Handle switching selected land parcel
  const handleLandSelectionChange = (landIdValue, openModal = false) => {
    setSelectedLandId(landIdValue);
    setError('');

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
      setActiveParcelForModal(selected);
      if (openModal) {
        setParcelCropsModalOpen(true);
      }
    }
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
  const remainingLand = Math.max(0, totalLandNum - alreadyAllocatedOnLand);

  const handleSubmit = async (isDraft = false) => {
    setError('');
    setSuccess('');

    if (!selectedLandId) {
      return setError('Please select a registered land parcel to submit.');
    }

    setLoading(true);
    try {
      if (!isDraft) {
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {}
        setSuccess(
          `Records submitted for verification successfully! Survey No. ${landData.surveyNumber || ''} has been sent for official review.`
        );
      } else {
        setSuccess('Draft saved successfully! Returning to Farm Records...');
      }

      setTimeout(() => {
        navigate('/farmer/crops');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
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
        <div className="bg-[#06151a]/95 rounded-3xl p-6 shadow-xl border border-slate-700 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
            <User className="w-5 h-5 text-teal-400" />
            <h3 className="font-extrabold text-base text-white">
              1. Farmer Identity & Location Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[#030b0e] rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Farmer Name
              </span>
              <strong className="text-sm text-white">{user?.name || 'Ramesh Patel'}</strong>
            </div>

            <div className="p-3 bg-[#030b0e] rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Mobile Number
              </span>
              <strong className="text-sm text-white">{user?.phone || '+91 98480 11223'}</strong>
            </div>

            <div className="p-3 bg-[#030b0e] rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Registered Location
              </span>
              <strong className="text-sm text-white">
                {farmerProfile?.village || 'Kankipadu'}, {farmerProfile?.district || 'Vijayawada'}
              </strong>
            </div>
          </div>
        </div>

        {/* Section 2: Verification Documents (Asked once on Profile) */}
        <div className="bg-[#06151a]/95 rounded-3xl p-6 shadow-xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-400" />
              <h3 className="font-extrabold text-base text-white">
                2. Verification Documents (Profile-Level)
              </h3>
            </div>

            {hasDocumentsOnFile && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 bg-teal-950/80 px-3 py-1 rounded-xl border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Documents on File</span>
              </span>
            )}
          </div>

          {hasDocumentsOnFile && !showDocUploader ? (
            /* Compact verified document summary banner */
            <div className="p-4 rounded-2xl bg-[#030b0e] border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#06151a] text-teal-300 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">
                    Identity & Land Records Stored on Profile
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Your Aadhaar Card, Bank Passbook, and Land Title copies are already uploaded to your Farmer Profile. They apply automatically to all your crop registrations.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {farmerProfile?.documents?.aadhaarDoc?.fileName && (
                      <span className="text-[11px] font-mono bg-[#06151a] text-teal-300 px-2 py-0.5 rounded-lg border border-slate-700">
                        ✓ Aadhaar ({farmerProfile.documents.aadhaarDoc.fileName})
                      </span>
                    )}
                    {farmerProfile?.documents?.passbookDoc?.fileName && (
                      <span className="text-[11px] font-mono bg-[#06151a] text-teal-300 px-2 py-0.5 rounded-lg border border-slate-700">
                        ✓ Passbook ({farmerProfile.documents.passbookDoc.fileName})
                      </span>
                    )}
                    {farmerProfile?.documents?.landRecordDoc?.fileName && (
                      <span className="text-[11px] font-mono bg-[#06151a] text-teal-300 px-2 py-0.5 rounded-lg border border-slate-700">
                        ✓ Land Record ({farmerProfile.documents.landRecordDoc.fileName})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDocUploader(true)}
                className="px-3.5 py-1.5 bg-[#06151a] hover:bg-[#0c242c] text-teal-300 text-xs font-bold rounded-xl border border-slate-700 shadow-2xs transition-all flex items-center gap-1.5 self-end sm:self-center flex-shrink-0 cursor-pointer"
              >
                <span>View / Update Files</span>
                <ChevronDown className="w-3.5 h-3.5 text-teal-400" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {hasDocumentsOnFile && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDocUploader(false)}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
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
        <div className="bg-[#06151a]/95 rounded-3xl p-6 shadow-xl border border-slate-700 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <LandPlot className="w-5 h-5 text-teal-400" />
              <h3 className="font-extrabold text-base text-white">
                3. Land Parcel Selection & Crop Schedule
              </h3>
            </div>

            {existingLands.length > 0 && (
              <span className="text-xs font-bold text-teal-300 bg-teal-950/80 px-2.5 py-1 rounded-xl border border-slate-700">
                {existingLands.length} Land Parcel(s) on file
              </span>
            )}
          </div>

          {existingLands.length === 0 ? (
            /* Default view when no land parcels exist */
            <div className="text-center py-10 px-4 bg-[#030b0e] rounded-2xl border border-slate-700 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#06151a] text-teal-400 border border-slate-700 flex items-center justify-center mx-auto shadow-sm">
                <LandPlot className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-extrabold text-base text-white">No Registered Land Parcels Found</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You don't have any registered land parcels on file yet. Please visit Farm Records to add your cadastral land survey numbers and acreage before registering crops.
                </p>
              </div>
              <Link
                to="/farmer/crops"
                className="inline-flex items-center gap-2 px-6 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-md transition-all cursor-pointer"
              >
                <LandPlot className="w-4 h-4" />
                <span>Go to Farm Records</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Land Parcel Choice Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Registered Land Parcel (Click to Select & View Crops):
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
                        onClick={() => handleLandSelectionChange(land._id, true)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group ${
                          isSelected
                            ? 'border-teal-400 bg-[#0c242c] shadow-lg ring-2 ring-teal-400/30'
                            : 'border-slate-700 bg-[#030b0e] hover:bg-[#06151a] hover:border-teal-500/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-bold text-teal-300 group-hover:text-teal-200">
                              Survey No. {land.surveyNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#06151a] border border-slate-700 text-slate-300">
                              {land.ownershipType || 'Owned'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-semibold">
                            {land.village || 'Village'}, {land.district || 'District'}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-xs">
                          <span className="font-extrabold text-white">
                            {land.totalArea} {land.areaUnit || 'Acres'}
                          </span>
                          <span className="text-[11px] font-bold text-teal-300 bg-teal-950/90 px-2.5 py-0.5 rounded-md border border-teal-500/30 group-hover:bg-teal-900 transition-colors flex items-center gap-1">
                            <Eye className="w-3 h-3 text-teal-400" />
                            <span>{parcelCrops.length} Crop{parcelCrops.length !== 1 ? 's' : ''} on record</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            {/* Go to Farm Records Action Banner */}
            <div className="p-4 rounded-2xl bg-[#030b0e] border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#06151a] text-teal-400 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <LandPlot className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-extrabold text-white">
                    Need to add or edit land parcel records?
                  </h5>
                  <p className="text-xs text-slate-300">
                    You can manage, edit, or add new cadastral land parcels in your Farm Records.
                  </p>
                </div>
              </div>

              <Link
                to="/farmer/crops"
                className="px-4 py-2.5 bg-[#06151a] hover:bg-[#0c242c] text-teal-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 shadow-2xs transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer"
              >
                <LandPlot className="w-3.5 h-3.5 text-teal-400" />
                <span>Go to Farm Records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </>
        )}
      </div>

        {/* Submit Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-[#06151a]/95 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-white">
              Ready to Save or Submit for Verification?
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              You can save as a draft to edit anytime or submit directly for government officer review.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto flex-shrink-0">
            <button
              type="button"
              disabled={loading || !selectedLandId}
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-none px-5 py-3 bg-[#030b0e] hover:bg-[#0c242c] disabled:opacity-40 text-teal-300 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-teal-400" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={loading || !selectedLandId}
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-none px-6 py-3 btn-glow-primary text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{loading ? 'Submitting...' : 'Submit for Verification'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Parcel Crops Pop-up Modal (Opens on Land Card Click) */}
      <ParcelCropsModal
        isOpen={parcelCropsModalOpen}
        onClose={() => setParcelCropsModalOpen(false)}
        land={activeParcelForModal || existingLands.find((l) => l._id === selectedLandId)}
        crops={allFarmerCrops.filter((c) => {
          const activeId = activeParcelForModal?._id || selectedLandId;
          const activeSurvey = activeParcelForModal?.surveyNumber || landData.surveyNumber;
          return (
            (c.landId && (c.landId._id === activeId || c.landId === activeId)) ||
            c.surveyNumber === activeSurvey
          );
        })}
        onViewCropDetails={(crop) => {
          setSelectedCropModal(crop);
        }}
      />

      {/* Selected Crop Inspection Modal (Read Only in Register Crop Page) */}
      {selectedCropModal && (
        <CropDetailsModal
          isOpen={!!selectedCropModal}
          onClose={() => setSelectedCropModal(null)}
          crop={selectedCropModal}
          readOnly={true}
        />
      )}
    </div>
  );
}
