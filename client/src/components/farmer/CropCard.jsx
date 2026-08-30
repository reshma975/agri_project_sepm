import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Sprout, MapPin, Calendar, Layers, ChevronRight, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export default function CropCard({ crop, onClick }) {
  const hasSpecificCropIssue = crop.cropIssues && crop.cropIssues.length > 0;
  const isReturned = crop.status === 'RETURNED_FOR_CORRECTION';

  return (
    <div
      onClick={onClick}
      className={`glass-card bg-[#06151a]/90 rounded-2xl p-5 cursor-pointer border transition-all group ${
        hasSpecificCropIssue
          ? 'border-amber-500/50 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10'
          : 'border-teal-500/20 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-950/80 group-hover:bg-teal-900 text-teal-400 flex items-center justify-center transition-all border border-teal-500/30 shadow-sm">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-white group-hover:text-teal-300 transition-colors">
              {crop.cropName}
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              ID: {crop.registrationId} • Year {crop.year}
            </p>
          </div>
        </div>

        <StatusBadge status={crop.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-900/40 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
          <span>Survey No: <strong className="text-white font-bold">{crop.surveyNumber}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
          <span>Area: <strong className="text-white font-bold">{crop.cultivatedArea} {crop.areaUnit}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
          <span>Season: <strong className="text-white font-bold">{crop.season}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Sown: {formatDate(crop.sowingDate)}</span>
        </div>
      </div>

      {/* Targeted Crop-Specific Officer Issue Note */}
      {hasSpecificCropIssue ? (
        <div className="mt-3 p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-200 space-y-1">
          <strong className="block text-amber-300 font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Officer's Correction Note:
          </strong>
          {crop.cropIssues.map((iss) => (
            <p key={iss._id || iss.id}>"{iss.description}"</p>
          ))}
        </div>
      ) : isReturned && crop.officerComment ? (
        <div className="mt-3 p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-200 space-y-1">
          <strong className="block text-amber-300 font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Officer's Note:
          </strong>
          <p>"{crop.officerComment}"</p>
        </div>
      ) : null}

      <div className="mt-3.5 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
        <span>View / Edit Crop Details</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
