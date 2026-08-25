import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { User, MapPin, Sprout, Calendar, ArrowRight, FileCheck } from 'lucide-react';

export default function VerificationQueueItem({ application, onReview }) {
  const farmer = application.farmerId?.userId || {};
  const profile = application.farmerId || {};

  return (
    <div className="glass-card bg-[#06151a]/95 rounded-3xl p-4 sm:p-5 border border-slate-700 hover:border-teal-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
      {/* Left: Farmer & Application Details */}
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#030b0e] text-teal-400 flex items-center justify-center flex-shrink-0 border border-slate-700">
          <Sprout className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-extrabold text-base text-white">
              {farmer.name || 'Farmer'}
            </h4>
            <span className="text-xs font-mono font-bold text-teal-300 bg-[#030b0e] px-2.5 py-0.5 rounded-md border border-slate-700">
              {profile.farmerId || 'FMR-ID'}
            </span>
            <StatusBadge status={application.status} />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              {profile.village || 'Village'}, {profile.district || 'District'}
            </span>
            <span>•</span>
            <span className="font-bold text-white">
              Crop: <span className="text-teal-300">{application.cropName}</span> ({application.cultivatedArea} {application.areaUnit})
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

      {/* Right: Review Action Button */}
      <button
        onClick={() => onReview(application)}
        className="w-full sm:w-auto px-5 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
      >
        <FileCheck className="w-4 h-4 text-slate-950" />
        Review Application
        <ArrowRight className="w-4 h-4 text-slate-950" />
      </button>
    </div>
  );
}
