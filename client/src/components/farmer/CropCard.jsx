import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Sprout, MapPin, Calendar, Layers, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export default function CropCard({ crop, onClick }) {
  return (
    <div
      onClick={onClick}
      className="glass-card bg-[#06151a]/90 rounded-2xl p-5 cursor-pointer border border-teal-500/20 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10 group transition-all"
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

      {crop.officerComment && crop.status === 'RETURNED_FOR_CORRECTION' && (
        <div className="mt-3 p-2.5 bg-orange-950/40 border border-orange-500/30 rounded-xl text-xs text-orange-300">
          <strong className="block text-orange-200 font-semibold mb-0.5">Officer Note:</strong>
          {crop.officerComment}
        </div>
      )}

      {crop.status === 'DRAFT' && (
        <div className="mt-3 p-2 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center justify-between font-medium">
          <span>📝 Saved as Draft</span>
          <span className="text-[10px] font-bold text-slate-950 bg-teal-400 px-2 py-0.5 rounded-md shadow-2xs">Click to Submit →</span>
        </div>
      )}

      <div className="mt-3.5 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
        <span>View / Edit Crop Details</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
