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
  X
} from 'lucide-react';

export default function CropDetailsModal({ isOpen, onClose, crop, onCropUpdated }) {
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

  // Sync form state with crop prop
  useEffect(() => {
    if (crop) {
      setFormData({
        cropName: crop.cropName || '',
        cropCategory: crop.cropCategory || 'Cereals',
        cultivatedArea: crop.cultivatedArea !== undefined ? crop.cultivatedArea.toString() : '',
        season: crop.season || 'Kharif',
        year: crop.year ? crop.year.toString() : new Date().getFullYear().toString(),
        sowingDate: crop.sowingDate ? new Date(crop.sowingDate).toISOString().split('T')[0] : '',
        harvestDate: crop.harvestDate ? new Date(crop.harvestDate).toISOString().split('T')[0] : '',
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
    }
  }, [crop, isOpen]);

  if (!crop) return null;

  const isDraft = crop.status === 'DRAFT';
  const isReturned = crop.status === 'RETURNED_FOR_CORRECTION';
  const canEdit = isDraft || isReturned;

  // Handle direct submission (from Draft or Returned) or saving draft edits
  const handleSaveOrSubmit = async (shouldSubmit = false) => {
    setLoading(true);
    setErrorMessage('');
    setMessage('');

    try {
      const payload = {
        cropName: formData.cropName.trim() || crop.cropName,
        cropCategory: formData.cropCategory,
        cultivatedArea: parseFloat(formData.cultivatedArea) || crop.cultivatedArea,
        season: formData.season,
        year: parseInt(formData.year, 10) || crop.year,
        sowingDate: formData.sowingDate ? new Date(formData.sowingDate) : crop.sowingDate,
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

      const res = await apiClient.put(`/farmers/crops/${crop._id}`, payload);

      if (res.data.success) {
        if (shouldSubmit) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {
            // Ignore confetti errors if not available
          }
          setMessage('🎉 Crop successfully submitted for Government Officer verification!');
        } else {
          setMessage('✅ Draft crop details updated successfully!');
        }

        setIsEditing(false);
        if (onCropUpdated) onCropUpdated(res.data.crop);

        setTimeout(() => {
          setMessage('');
          if (shouldSubmit) {
            onClose();
          }
        }, 1600);
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
      title={`Crop Entry Details — ${crop.cropName}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Top Header Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-forest-50/80 rounded-2xl border border-forest-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{crop.cropName}</h3>
              <p className="text-xs text-slate-500 font-mono">
                Reg ID: {crop.registrationId} • Year: {crop.year} • {crop.season} Season
              </p>
            </div>
          </div>
          <StatusBadge status={crop.status} />
        </div>

        {/* Success / Error Notifications */}
        {message && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs sm:text-sm border border-emerald-200 flex items-center gap-2 animate-fade-in font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs sm:text-sm border border-rose-200 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* DRAFT CALLOUT BANNER WITH ACTIONS */}
        {isDraft && !isEditing && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50/50 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <span>Saved as Draft</span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-md">
                    Not Submitted Yet
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Government officers will only review this crop once you submit it. You can edit details now or submit whenever you're ready.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-center flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-forest-700" />
                <span>Edit Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveOrSubmit(true)}
                disabled={loading}
                className="flex-1 sm:flex-initial px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold rounded-xl shadow-md shadow-forest-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Submitting...' : 'Submit Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* RETURNED FOR CORRECTION BANNER */}
        {isReturned && !isEditing && (
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span>Returned by Agriculture Officer</span>
              </h4>
              {crop.officerComment && (
                <p className="text-xs text-orange-800 font-medium italic">
                  "{crop.officerComment}"
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 self-end sm:self-center"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit & Resubmit</span>
            </button>
          </div>
        )}

        {/* VIEW MODE: 9 Core Data Fields */}
        {!isEditing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Crop & Category */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                1. Crop Category
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-forest-600 flex-shrink-0" />
                <span>{crop.cropCategory || 'Cereals'}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Crop Name: <strong className="text-slate-700">{crop.cropName}</strong>
              </p>
            </div>

            {/* 2. Land Parcel & Survey No */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                2. Land Parcel & Survey Number
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-forest-600 flex-shrink-0" />
                  <span>Survey No. {crop.surveyNumber}</span>
                </p>
                {crop.landId?.landId && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-forest-100 text-forest-800 font-mono font-bold border border-forest-200">
                    {crop.landId.landId}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Location: {crop.landId?.village || 'Village'}, {crop.landId?.district || 'Vijayawada'}
              </p>
            </div>

            {/* 3. Cultivated Area & Total Land */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                3. Land Cultivated
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest-600" />
                {crop.cultivatedArea} {crop.areaUnit || 'Acres'} (Total Parcel: {crop.totalLandArea || crop.cultivatedArea} {crop.areaUnit || 'Acres'})
              </p>
            </div>

            {/* 4. Ownership Type */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                4. Land Status / Tenure
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest-600" />
                {crop.ownershipType || 'Owned'} Land
              </p>
            </div>

            {/* 5. Start Date (Sowing Date) */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                5. Start Date (Sowing)
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-600" />
                {formatDate(crop.sowingDate)}
              </p>
            </div>

            {/* 6. End Date (Harvest Date) */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                6. End Date (Harvest)
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-600" />
                {crop.harvestDate ? formatDate(crop.harvestDate) : 'In Progress (Estimated 120 Days)'}
              </p>
            </div>

            {/* 7. Fertilizers & Pesticides */}
            <div className="sm:col-span-2 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                7. Fertilizers & Pesticides Used
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg">
                  <FlaskConical className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Fertilizers: {crop.fertilizersUsed || 'Urea (2 Bags), DAP (1 Bag), Potash (1 Bag)'}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg">
                  <Bug className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Pesticides: {crop.pesticidesUsed || 'Organic Neem Oil, Chlorpyrifos'}</span>
                </div>
              </div>
            </div>

            {/* 8. Harvest Output */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                8. Final Harvest
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Scale className="w-4 h-4 text-forest-600" />
                {crop.actualHarvest || 'Nil (In Progress)'}
                <span className="text-xs text-slate-400 font-normal ml-1">
                  (Exp: {crop.expectedHarvest || '35 Quintals'})
                </span>
              </p>
            </div>

            {/* 9. Price Sold */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                9. Price Sold
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-forest-600" />
                {crop.priceSold || 'Pending Sale'}
              </p>
            </div>
          </div>
        )}

        {/* EDIT MODE: Form Fields for Draft / Returned */}
        {isEditing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveOrSubmit(isReturned);
            }}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-forest-600" />
                {isDraft ? 'Edit Draft Details' : 'Edit & Resubmit Application'}
              </h4>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Crop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Crop Name *</label>
                <input
                  type="text"
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  required
                  placeholder="e.g. Chilli, Paddy (BPT 5204)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500 font-semibold"
                />
              </div>

              {/* Crop Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Crop Category</label>
                <select
                  value={formData.cropCategory}
                  onChange={(e) => setFormData({ ...formData, cropCategory: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
                >
                  <option value="Cereals">Cereals (Paddy, Wheat, Maize)</option>
                  <option value="Pulses">Pulses (Red Gram, Black Gram)</option>
                  <option value="Oilseeds">Oilseeds (Groundnut, Mustard)</option>
                  <option value="Commercial / Cash">Commercial (Cotton, Sugarcane)</option>
                  <option value="Vegetables">Vegetables (Chilli, Tomato, Brinjal)</option>
                  <option value="Fruits">Fruits (Guava, Mango, Banana)</option>
                  <option value="Horticulture">Horticulture & Spices</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Cultivated Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cultivated Area (Acres) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.cultivatedArea}
                  onChange={(e) => setFormData({ ...formData, cultivatedArea: e.target.value })}
                  required
                  placeholder="e.g. 2.0"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500 font-semibold"
                />
              </div>

              {/* Season & Year */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
                  >
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
                  />
                </div>
              </div>

              {/* Sowing Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sowing Start Date</label>
                <input
                  type="date"
                  value={formData.sowingDate}
                  onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
                />
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Harvest / End Date</label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
                />
              </div>

              {/* Fertilizers Used */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fertilizers Note</label>
                <input
                  type="text"
                  value={formData.fertilizersUsed}
                  onChange={(e) => setFormData({ ...formData, fertilizersUsed: e.target.value })}
                  placeholder="e.g. Urea (2 Bags), DAP (1 Bag)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
                />
              </div>

              {/* Pesticides Used */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pesticides Note</label>
                <input
                  type="text"
                  value={formData.pesticidesUsed}
                  onChange={(e) => setFormData({ ...formData, pesticidesUsed: e.target.value })}
                  placeholder="e.g. Organic Neem Oil, Chlorpyrifos"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
                />
              </div>
            </div>

            {/* Expected Harvest */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Harvest Output</label>
              <input
                type="text"
                value={formData.expectedHarvest}
                onChange={(e) => setFormData({ ...formData, expectedHarvest: e.target.value })}
                placeholder="e.g. 35 Quintals"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
              />
            </div>

            {/* Correction or Submission Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isReturned ? 'Correction Note for Officer *' : 'Optional Submission Note'}
              </label>
              <input
                type="text"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder={isReturned ? 'e.g. Updated cultivated area per patta record' : 'e.g. Sown on survey parcel 125/2'}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
              />
            </div>

            {/* Edit Mode Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>

              {isDraft && (
                <button
                  type="button"
                  onClick={() => handleSaveOrSubmit(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-forest-600" />
                  <span>{loading ? 'Saving...' : 'Save as Draft'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSaveOrSubmit(true)}
                disabled={loading}
                className="px-5 py-2 bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold rounded-xl shadow-md shadow-forest-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {loading
                    ? 'Submitting...'
                    : isReturned
                    ? 'Submit Correction to Officer'
                    : 'Submit for Verification'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Bottom Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            {isDraft && !isEditing && (
              <span className="text-[11px] text-slate-400 font-medium">
                Tip: You can submit this draft at any time.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDraft && !isEditing && (
              <button
                type="button"
                onClick={() => handleSaveOrSubmit(true)}
                disabled={loading}
                className="px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold rounded-xl shadow-md shadow-forest-200 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit for Verification</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
