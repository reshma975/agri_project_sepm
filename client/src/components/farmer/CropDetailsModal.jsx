import React, { useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import apiClient from '../../api/apiClient';
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
  History,
  Edit3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CropDetailsModal({ isOpen, onClose, crop, onCropUpdated }) {
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitComment, setResubmitComment] = useState('');
  const [cultivatedArea, setCultivatedArea] = useState(crop?.cultivatedArea || '');
  const [fertilizersUsed, setFertilizersUsed] = useState(crop?.fertilizersUsed || '');
  const [pesticidesUsed, setPesticidesUsed] = useState(crop?.pesticidesUsed || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!crop) return null;

  const isReturned = crop.status === 'RETURNED_FOR_CORRECTION';

  const handleResubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.put(`/farmers/crops/${crop._id}`, {
        cultivatedArea: Number(cultivatedArea),
        fertilizersUsed,
        pesticidesUsed,
        resubmit: true,
        resubmitComment: resubmitComment || 'Corrected details and resubmitted by farmer'
      });

      if (res.data.success) {
        setMessage('Application resubmitted successfully for officer verification!');
        setResubmitting(false);
        if (onCropUpdated) onCropUpdated(res.data.crop);
        setTimeout(() => {
          setMessage('');
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Crop Entry Details — ${crop.cropName}`} maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-forest-50/80 rounded-2xl border border-forest-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-600 text-white flex items-center justify-center shadow-sm">
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

        {message && (
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* 9 Data Fields From Wireframe 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Crop & Category */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              1. Crop Category
            </span>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-forest-600 flex-shrink-0" />
              <span>{crop.cropCategory || 'Cereals & Food Grains'}</span>
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Crop Name: <strong className="text-slate-700">{crop.cropName}</strong>
            </p>
          </div>

          {/* 2. Survey No */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              2. Survey Number (Area)
            </span>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-forest-600" />
              Survey No. {crop.surveyNumber}
            </p>
          </div>

          {/* 3. Cultivated Area & Total Land */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              3. Land Cultivated
            </span>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest-600" />
              {crop.cultivatedArea} {crop.areaUnit} (Total Parcel: {crop.totalLandArea || crop.cultivatedArea} {crop.areaUnit})
            </p>
          </div>

          {/* 4. Ownership Type (Owner / Worker / Leased) */}
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
                <span>Fertilizers: {crop.fertilizersUsed || 'Urea, DAP, Potash'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg">
                <Bug className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>Pesticides: {crop.pesticidesUsed || 'Neem Oil, Chlorpyrifos'}</span>
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
              {crop.actualHarvest || 'Initially Nil (In Progress)'}
              <span className="text-xs text-slate-400 font-normal">(Exp: {crop.expectedHarvest || '40 Qtl'})</span>
            </p>
          </div>

          {/* 9. Price Sold */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              9. Price Sold
            </span>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-forest-600" />
              {crop.priceSold || 'Pending Harvest / Sale'}
            </p>
          </div>
        </div>

        {/* Officer Review Remarks */}
        {crop.officerComment && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              Agriculture Officer Remarks
            </h4>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
              "{crop.officerComment}"
            </p>
          </div>
        )}

        {/* Resubmission Section for Returned Crops */}
        {isReturned && !resubmitting && (
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h5 className="text-sm font-bold text-orange-950">Action Required</h5>
              <p className="text-xs text-orange-800">
                This record was returned by the officer. You can edit the values and resubmit.
              </p>
            </div>
            <button
              onClick={() => setResubmitting(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              Edit & Resubmit
            </button>
          </div>
        )}

        {resubmitting && (
          <form onSubmit={handleResubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Update Details & Resubmit
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cultivated Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cultivatedArea}
                  onChange={(e) => setCultivatedArea(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fertilizers Note</label>
                <input
                  type="text"
                  value={fertilizersUsed}
                  onChange={(e) => setFertilizersUsed(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Correction Comment to Officer</label>
              <input
                type="text"
                placeholder="e.g. Corrected survey cultivated area as advised"
                value={resubmitComment}
                onChange={(e) => setResubmitComment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResubmitting(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-bold text-white bg-forest-600 hover:bg-forest-700 rounded-lg shadow-sm"
              >
                {loading ? 'Submitting...' : 'Submit to Officer'}
              </button>
            </div>
          </form>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}
