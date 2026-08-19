import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Sprout, MapPin, Calendar, Layers, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export default function CropCard({ crop, onClick }) {
  return (
    <div
      onClick={onClick}
      className="glass-card rounded-2xl p-5 cursor-pointer hover:border-forest-400 group transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-forest-100 group-hover:bg-forest-600 group-hover:text-white text-forest-700 flex items-center justify-center transition-all shadow-sm">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-800 group-hover:text-forest-700 transition-colors">
              {crop.cropName}
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              ID: {crop.registrationId} • Year {crop.year}
            </p>
          </div>
        </div>

        <StatusBadge status={crop.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-forest-500 flex-shrink-0" />
          <span>Survey No: <strong className="text-slate-800">{crop.surveyNumber}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-forest-500 flex-shrink-0" />
          <span>Area: <strong className="text-slate-800">{crop.cultivatedArea} {crop.areaUnit}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-forest-500 flex-shrink-0" />
          <span>Season: <strong className="text-slate-800">{crop.season}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Sown: {formatDate(crop.sowingDate)}</span>
        </div>
      </div>

      {crop.officerComment && crop.status === 'RETURNED_FOR_CORRECTION' && (
        <div className="mt-3 p-2.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800">
          <strong className="block text-orange-900 font-semibold mb-0.5">Officer Note:</strong>
          {crop.officerComment}
        </div>
      )}

      <div className="mt-3.5 flex items-center justify-between text-xs font-semibold text-forest-700 group-hover:translate-x-1 transition-transform">
        <span>View Complete Details</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
