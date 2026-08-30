import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import apiClient from '../../api/apiClient';
import confetti from 'canvas-confetti';
import {
  Sprout,
  MapPin,
  Calendar,
  Layers,
  FlaskConical,
  Bug,
  Scale,
  IndianRupee,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Send,
  Save,
  FileText,
  Clock,
  RotateCcw,
  XCircle,
  X
} from 'lucide-react';

const toDateInputValue = (d) => {
  if (!d) return '';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CropDetailsModal({ isOpen, onClose, crop, onCropUpdated, readOnly = false, deadlineExpired = false }) {
  const [displayCrop, setDisplayCrop] = useState(crop);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editable Form Fields
  const [formData, setFormData] = useState({
    cropName: '',
    cropCategory: 'Cereals',
    cultivatedArea: '',
    season: 'Kharif',
    year: new Date().getFullYear().toString(),
    sowingDate: '',
    harvestDate: '',
    irrigationType: 'Borewell',
    fertilizersUsed: '',
    pesticidesUsed: '',
    expectedHarvest: '',
    actualHarvest: '',
    priceSold: '',
    comment: ''
  });

  // Sync state when crop prop changes
  useEffect(() => {
    if (crop) {
      setDisplayCrop(crop);
      setFormData({
        cropName: crop.cropName || '',
        cropCategory: crop.cropCategory || 'Cereals',
        cultivatedArea: crop.cultivatedArea !== undefined ? crop.cultivatedArea.toString() : '',
        season: crop.season || 'Kharif',
        year: crop.year ? crop.year.toString() : new Date().getFullYear().toString(),
        sowingDate: toDateInputValue(crop.sowingDate),
        harvestDate: toDateInputValue(crop.harvestDate),
        irrigationType: crop.irrigationType || 'Borewell',
        fertilizersUsed: crop.fertilizersUsed || '',
        pesticidesUsed: crop.pesticidesUsed || '',
        expectedHarvest: crop.expectedHarvest || '',
        actualHarvest: crop.actualHarvest || '',
        priceSold: crop.priceSold || '',
        comment: ''
      });
      setIsEditing(false);
      setMessage('');
      setErrorMessage('');

      if (isOpen && crop._id) {
        apiClient
          .get(`/farmers/crops/${crop._id}`)
          .then((res) => {
            if (res.data?.crop) {
              const freshCrop = res.data.crop;
              const allIssues = res.data.issues || [];
              const cropSpecific = allIssues.filter(
                (i) => i.cropId?.toString() === crop._id.toString() && i.status !== 'RESOLVED'
              );
              const landLevel = allIssues.filter(
                (i) => i.issueLevel === 'LAND' && i.status !== 'RESOLVED'
              );

              setDisplayCrop((prev) => ({
                ...prev,
                ...freshCrop,
                cropIssues: cropSpecific.length > 0 ? cropSpecific : prev.cropIssues || [],
                landIssues: landLevel.length > 0 ? landLevel : prev.landIssues || [],
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, [crop, isOpen]);

  if (!displayCrop) return null;

  const isDraft = displayCrop.status === 'DRAFT';
  const isReturned = displayCrop.status === 'RETURNED_FOR_CORRECTION';
  const isPending = ['SUBMITTED', 'UNDER_VERIFICATION'].includes(displayCrop.status);
  const isVerified = displayCrop.status === 'VERIFIED';
  const isRejected = displayCrop.status === 'REJECTED';

  // Farm records are editable by the farmer in farm records view
  const canEdit = !readOnly;

  // Handle direct submission (from Draft or Returned) or saving edits
  const handleSaveOrSubmit = async (shouldSubmit = false) => {
    setLoading(true);
    setErrorMessage('');
    setMessage('');

    if (shouldSubmit && deadlineExpired) {
      setLoading(false);
      return setErrorMessage('The crop registration deadline has passed. Submissions or resubmissions cannot be accepted after the deadline.');
    }

    try {
      const payload = {
        cropName: formData.cropName.trim() || displayCrop.cropName,
        cropCategory: formData.cropCategory,
        cultivatedArea: parseFloat(formData.cultivatedArea) || displayCrop.cultivatedArea,
        season: formData.season,
        year: parseInt(formData.year, 10) || displayCrop.year,
        sowingDate: formData.sowingDate ? new Date(formData.sowingDate) : displayCrop.sowingDate,
        harvestDate: formData.harvestDate ? new Date(formData.harvestDate) : null,
        irrigationType: formData.irrigationType,
        fertilizersUsed: formData.fertilizersUsed,
        pesticidesUsed: formData.pesticidesUsed,
        expectedHarvest: formData.expectedHarvest,
        actualHarvest: formData.actualHarvest,
        priceSold: formData.priceSold,
        submit: shouldSubmit,
        resubmit: shouldSubmit && isReturned,
        submitComment: formData.comment || (isDraft ? 'Draft submitted digitally by farmer for verification' : undefined),
        resubmitComment: formData.comment || (isReturned ? 'Corrected details and resubmitted by farmer' : undefined)
      };

      const res = await apiClient.put(`/farmers/crops/${displayCrop._id}`, payload);

      if (res.data.success) {
        const savedCrop = res.data.crop;
        setDisplayCrop(savedCrop);
        setFormData({
          cropName: savedCrop.cropName || '',
          cropCategory: savedCrop.cropCategory || 'Cereals',
          cultivatedArea: savedCrop.cultivatedArea !== undefined ? savedCrop.cultivatedArea.toString() : '',
          season: savedCrop.season || 'Kharif',
          year: savedCrop.year ? savedCrop.year.toString() : new Date().getFullYear().toString(),
          sowingDate: toDateInputValue(savedCrop.sowingDate),
          harvestDate: toDateInputValue(savedCrop.harvestDate),
          irrigationType: savedCrop.irrigationType || 'Borewell',
          fertilizersUsed: savedCrop.fertilizersUsed || '',
          pesticidesUsed: savedCrop.pesticidesUsed || '',
          expectedHarvest: savedCrop.expectedHarvest || '',
          actualHarvest: savedCrop.actualHarvest || '',
          priceSold: savedCrop.priceSold || '',
          comment: ''
        });

        if (shouldSubmit) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {}
          setMessage(isReturned ? '🎉 Application resubmitted successfully to Agriculture Officer!' : '🎉 Crop successfully submitted for Officer verification!');
        } else {
          setMessage('✅ Crop details saved successfully!');
        }

        setIsEditing(false);
        if (onCropUpdated) onCropUpdated(savedCrop);

        setTimeout(() => {
          setMessage('');
          if (shouldSubmit) {
            onClose();
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving/submitting crop:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update crop registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Crop Entry Details — ${displayCrop.cropName}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Top Header Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#030b0e] rounded-2xl border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#06151a] text-teal-400 border border-slate-700 flex items-center justify-center shadow-sm flex-shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">{displayCrop.cropName}</h3>
              <p className="text-xs text-slate-300 font-mono">
                Reg ID: {displayCrop.registrationId} • Year: {displayCrop.year} • {displayCrop.season} Season
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <StatusBadge status={displayCrop.status} />
          </div>
        </div>

        {/* Success / Error Notifications */}
        {message && (
          <div className="p-3.5 bg-emerald-950/80 text-emerald-300 rounded-xl text-xs sm:text-sm border border-emerald-800 flex items-center gap-2 font-medium animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-950/80 text-rose-300 rounded-xl text-xs sm:text-sm border border-rose-800 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}


        {/* 2. RETURNED FOR RESUBMISSION CALLOUT */}
        {(isReturned || (displayCrop.cropIssues && displayCrop.cropIssues.length > 0) || (displayCrop.landIssues && displayCrop.landIssues.length > 0)) && !isEditing && (
          <div className="p-4.5 rounded-2xl bg-amber-950/70 border border-amber-500/50 shadow-md flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#030b0e] text-amber-400 border border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <span>Resubmission Requested by Agriculture Officer</span>
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    displayCrop.resubmissionCount >= 3
                      ? 'bg-rose-900 border-rose-500 text-rose-200'
                      : 'bg-amber-900/80 border-amber-500/40 text-amber-200'
                  }`}>
                    Attempt {Math.min(displayCrop.resubmissionCount || 1, 3)} of 3
                  </span>
                  {displayCrop.resubmissionCount === 3 && (
                    <span className="text-[10px] font-black text-rose-300 bg-rose-950 px-2 py-0.5 rounded-md border border-rose-500/40">
                      ⚠️ Final Opportunity
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded-md border border-amber-500/30">
                    Action Needed
                  </span>
                </div>
              </div>

              {/* Crop-Specific Issues */}
              {Array.isArray(displayCrop.cropIssues) && displayCrop.cropIssues.length > 0 && (
                <div className="space-y-1.5">
                  {displayCrop.cropIssues.map((iss) => (
                    <div key={iss._id || iss.id} className="p-2.5 rounded-xl bg-[#030b0e] border border-amber-500/40 text-xs">
                      <span className="text-[10px] font-bold uppercase text-amber-300 block mb-0.5">
                        🌱 Officer's Correction Note on {displayCrop.cropName}:
                      </span>
                      <p className="text-white font-medium">"{iss.description}"</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Land / Document Level Issues */}
              {Array.isArray(displayCrop.landIssues) && displayCrop.landIssues.length > 0 && (
                <div className="space-y-1.5">
                  {displayCrop.landIssues.map((iss) => (
                    <div key={iss._id || iss.id} className="p-2.5 rounded-xl bg-[#030b0e] border border-amber-500/40 text-xs">
                      <span className="text-[10px] font-bold uppercase text-amber-300 block mb-0.5">
                        📄 Officer's Correction Note on Land / Documents:
                      </span>
                      <p className="text-white font-medium">"{iss.description}"</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct Crop Officer Comment fallback */}
              {displayCrop.officerComment && (
                <div className="p-2.5 rounded-xl bg-[#030b0e] border border-amber-500/40 text-xs">
                  <span className="text-[10px] font-bold uppercase text-amber-300 block mb-0.5">
                    ⚠️ Officer Remarks:
                  </span>
                  <p className="text-white font-medium">"{displayCrop.officerComment}"</p>
                </div>
              )}

              {/* Land Officer Comment fallback */}
              {!displayCrop.cropIssues?.length && !displayCrop.landIssues?.length && !displayCrop.officerComment && displayCrop.landId?.officerComment && (
                <div className="p-2.5 rounded-xl bg-[#030b0e] border border-amber-500/40 text-xs">
                  <span className="text-[10px] font-bold uppercase text-amber-300 block mb-0.5">
                    📄 Officer's Note on Land / Documents:
                  </span>
                  <p className="text-white font-medium">"{displayCrop.landId.officerComment}"</p>
                </div>
              )}

              <p className="text-[11px] text-slate-300">
                {readOnly
                  ? 'To update or correct crop information, simply go to your Farm Records page.'
                  : 'Please click "Edit Crop Details" below to update requested information. Once saved, submit your complete registration for verification from the Registration page.'}
              </p>

              {displayCrop.resubmissionCount === 3 && (
                <p className="text-[11px] text-rose-300 font-semibold bg-rose-950/80 p-2.5 rounded-xl border border-rose-500/40">
                  ⚠️ Note: This is your 3rd and final correction attempt. Please make sure all details and documents are fully accurate before resubmitting. Applications exceeding 3 attempts will be automatically rejected.
                </p>
              )}
            </div>
          </div>
        )}


        {/* 4. VERIFIED CALLOUT BANNER */}
        {isVerified && !isEditing && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-3 shadow-md">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block font-bold text-emerald-300 text-sm">
                ✅ Application Verified &amp; Certified
              </strong>
              <p className="text-slate-300 leading-relaxed">
                This crop record has passed official agricultural verification and is certified under State Agricultural registries.
                {displayCrop.reviewedAt && ` (Verified on ${formatDate(displayCrop.reviewedAt)})`}
              </p>
            </div>
          </div>
        )}

        {/* 5. REJECTED CALLOUT BANNER */}
        {isRejected && !isEditing && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-3 shadow-md">
            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <strong className="block font-bold text-rose-300 text-sm">
                ❌ Application Rejected by Agriculture Officer
              </strong>
              <p className="text-slate-300 leading-relaxed">
                {displayCrop.officerComment || 'This application was rejected following agricultural verification audit.'}
              </p>
              {displayCrop.resubmissionCount >= 3 && (
                <p className="text-[11px] text-rose-200 font-semibold bg-rose-900/60 p-2.5 rounded-xl border border-rose-500/40">
                  ⚠️ Limit Reached: Exceeded maximum allowed correction attempts (3 resubmissions). This case is closed. Please visit your local Mandal Agriculture Office for assistance or file a fresh registration during the next sowing window.
                </p>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE: 9 Core Data Fields */}
        {!isEditing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Crop & Category */}
            <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                1. Crop Category
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Sprout className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>{displayCrop.cropCategory || 'Cereals'}</span>
              </p>
              <p className="text-[10px] text-slate-300 font-medium">
                Crop Name: <strong className="text-teal-300">{displayCrop.cropName}</strong>
              </p>
            </div>

            {/* 2. Land Parcel & Survey No */}
            <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                2. Land Parcel &amp; Survey Number
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Survey No. {displayCrop.surveyNumber}</span>
                </p>
                {displayCrop.landId?.landId && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#06151a] text-teal-300 font-mono font-bold border border-slate-700">
                    {displayCrop.landId.landId}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-300 font-medium">
                Location: {displayCrop.landId?.village || displayCrop.village || 'Village'}, {displayCrop.landId?.district || displayCrop.district || 'Vijayawada'}
              </p>
            </div>

            {/* 3. Cultivated Area & Total Land */}
            <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                3. Land Cultivated
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                {displayCrop.cultivatedArea} {displayCrop.areaUnit || 'Acres'} (Total Parcel: {displayCrop.totalLandArea || displayCrop.cultivatedArea} {displayCrop.areaUnit || 'Acres'})
              </p>
            </div>

            {/* 4. Ownership Type */}
            <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                4. Land Status / Tenure
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                {displayCrop.ownershipType || 'Owned'} Land
              </p>
            </div>

            {/* 5. Start Date (Sowing Date) */}
            <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                5. Start Date (Sowing)
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                {formatDate(displayCrop.sowingDate)}
              </p>
            </div>

            {/* 6. End Date (Harvest Date) */}
            <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                6. End Date (Harvest)
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                {displayCrop.harvestDate ? formatDate(displayCrop.harvestDate) : 'In Progress (Estimated 120 Days)'}
              </p>
            </div>

            {/* 7. Fertilizers & Pesticides */}
            <div className="sm:col-span-2 p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                7. Fertilizers &amp; Pesticides Used
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2 text-slate-200 bg-[#06151a] p-2.5 rounded-xl border border-slate-700">
                  <FlaskConical className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Fertilizers: {displayCrop.fertilizersUsed || 'Urea (2 Bags), DAP (1 Bag), Potash (1 Bag)'}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-200 bg-[#06151a] p-2.5 rounded-xl border border-slate-700">
                  <Bug className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Pesticides: {displayCrop.pesticidesUsed || 'Organic Neem Oil, Chlorpyrifos'}</span>
                </div>
              </div>
            </div>

            {/* 8. Harvest Output */}
            <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                8. Final Harvest
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-400" />
                {displayCrop.actualHarvest || 'Nil (In Progress)'}
                <span className="text-xs text-slate-400 font-normal ml-1">
                  (Exp: {displayCrop.expectedHarvest || '35 Quintals'})
                </span>
              </p>
            </div>

            {/* 9. Price Sold */}
            <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                9. Price Sold
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-teal-400" />
                {displayCrop.priceSold || 'Pending Sale'}
              </p>
            </div>
          </div>
        )}

        {/* EDIT MODE: Form Fields */}
        {isEditing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveOrSubmit(false);
            }}
            className="p-5 rounded-2xl bg-[#030b0e] border border-slate-700 space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-teal-400" />
                {isDraft
                  ? 'Edit Draft Details'
                  : 'Edit Crop Entry Details'}
              </h4>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Crop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Crop Name *</label>
                <input
                  type="text"
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  required
                  placeholder="e.g. Guava, Chilli, Paddy (BPT 5204)"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400 font-semibold"
                />
              </div>

              {/* Crop Category */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Crop Category</label>
                <select
                  value={formData.cropCategory}
                  onChange={(e) => setFormData({ ...formData, cropCategory: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400 cursor-pointer"
                >
                  <option value="Cereals">Cereals (Paddy, Wheat, Maize)</option>
                  <option value="Pulses">Pulses (Red Gram, Black Gram)</option>
                  <option value="Oilseeds">Oilseeds (Groundnut, Mustard)</option>
                  <option value="Commercial / Cash">Commercial (Cotton, Sugarcane)</option>
                  <option value="Vegetables">Vegetables (Chilli, Tomato, Brinjal)</option>
                  <option value="Fruits">Fruits (Guava, Mango, Banana)</option>
                  <option value="Horticulture">Horticulture &amp; Spices</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Cultivated Area */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cultivated Area (Acres) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.cultivatedArea}
                  onChange={(e) => setFormData({ ...formData, cultivatedArea: e.target.value })}
                  required
                  placeholder="e.g. 2.0"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400 font-semibold"
                />
              </div>

              {/* Season & Year */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400 cursor-pointer"
                  >
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Sowing Date */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Sowing Start Date</label>
                <input
                  type="date"
                  value={formData.sowingDate}
                  onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400"
                />
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Harvest / End Date</label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400"
                />
              </div>

              {/* Fertilizers Used */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Fertilizers Note</label>
                <input
                  type="text"
                  value={formData.fertilizersUsed}
                  onChange={(e) => setFormData({ ...formData, fertilizersUsed: e.target.value })}
                  placeholder="e.g. Urea (2 Bags), DAP (1 Bag)"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400"
                />
              </div>

              {/* Pesticides Used */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Pesticides Note</label>
                <input
                  type="text"
                  value={formData.pesticidesUsed}
                  onChange={(e) => setFormData({ ...formData, pesticidesUsed: e.target.value })}
                  placeholder="e.g. Organic Neem Oil, Chlorpyrifos"
                  className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Expected Harvest */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Expected Harvest Output</label>
              <input
                type="text"
                value={formData.expectedHarvest}
                onChange={(e) => setFormData({ ...formData, expectedHarvest: e.target.value })}
                placeholder="e.g. 35 Quintals"
                className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400"
              />
            </div>

            {/* Correction Note for Officer */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Correction Notes / Remarks (Optional)
              </label>
              <input
                type="text"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="e.g. Updated cultivated area per patta survey details"
                className="w-full px-3 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl outline-none focus:border-teal-400"
              />
            </div>

            {/* Edit Mode Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-700">
              <p className="text-[11px] text-slate-400">
                💡 Edits will be saved to your records. Submit the complete registration to the Officer from the Registration page.
              </p>
              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#06151a] hover:bg-[#0c242c] border border-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-black rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-slate-950" />
                  <span>{loading ? 'Saving Changes...' : 'Save Crop Details'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Modal Bottom Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-2">
            {!isEditing && canEdit && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 bg-[#06151a] hover:bg-[#0c242c] text-teal-300 hover:text-white text-xs font-bold rounded-xl border border-teal-500/40 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:border-teal-400"
              >
                <Edit3 className="w-3.5 h-3.5 text-teal-400" />
                <span>Edit Crop Details</span>
              </button>
            )}
            {!canEdit && (
              <span className="text-xs text-slate-400 italic">
                {isVerified
                  ? '✅ Verified & certified official record (read-only).'
                  : isPending
                  ? '🔒 Application is under review with Agriculture Officer (read-only).'
                  : '🔒 To edit details, please go to the Farm Records page.'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
