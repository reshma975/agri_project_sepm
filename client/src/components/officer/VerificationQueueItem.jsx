import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { User, MapPin, Sprout, Calendar, ArrowRight, FileCheck } from 'lucide-react';

export default function VerificationQueueItem({ application, onReview }) {
  const farmer = application.farmerId?.userId || {};
  const profile = application.farmerId || {};

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-forest-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Left: Farmer & Application Details */}
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center flex-shrink-0 border border-forest-200">
          <Sprout className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-extrabold text-base text-slate-800">
              {farmer.name || 'Farmer'}
            </h4>
            <span className="text-xs font-mono font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200">
              {profile.farmerId || 'FMR-ID'}
            </span>
            <StatusBadge status={application.status} />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-forest-600" />
              {profile.village || 'Village'}, {profile.district || 'District'}
            </span>
            <span>•</span>
            <span className="font-bold text-slate-700">
              Crop: {application.cropName} ({application.cultivatedArea} {application.areaUnit})
            </span>
            <span>•</span>
            <span>Survey: #{application.surveyNumber}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>Submitted: {formatDate(application.submittedAt || application.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Right: Review Action Button (Wireframe 5) */}
      <button
        onClick={() => onReview(application)}
        className="w-full sm:w-auto px-4 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-forest-200 transition-all flex items-center justify-center gap-2 flex-shrink-0"
      >
        <FileCheck className="w-4 h-4" />
        Review Application
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
