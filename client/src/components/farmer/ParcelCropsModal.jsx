import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Sprout, MapPin, Eye, LandPlot, AlertCircle } from 'lucide-react';

export default function ParcelCropsModal({
  isOpen,
  onClose,
  land,
  crops = [],
  onViewCropDetails,
}) {
  if (!land) return null;

  const totalAllocated = crops.reduce((sum, c) => sum + (c.cultivatedArea || 0), 0);

  // Extract Land/Document level issues to display ABOVE all crop cards
  const landIssueTexts = [];
  if (Array.isArray(land.landIssues) && land.landIssues.length > 0) {
    land.landIssues.forEach((i) => {
      if (i.description) landIssueTexts.push(i.description.replace(/^\[LAND\]\s*/i, ''));
    });
  } else if (Array.isArray(land.issues)) {
    land.issues
      .filter((i) => i.issueLevel === 'LAND' && i.status !== 'RESOLVED')
      .forEach((i) => {
        if (i.description) landIssueTexts.push(i.description.replace(/^\[LAND\]\s*/i, ''));
      });
  }

  // Fallback: If land.officerComment has land remarks
  if (landIssueTexts.length === 0 && land.officerComment) {
    const raw = land.officerComment.replace(/^\[LAND\]\s*/i, '').trim();
    if (raw) landIssueTexts.push(raw);
  }

  // Fallback from crops if any had [LAND] prefix
  if (landIssueTexts.length === 0) {
    crops.forEach((c) => {
      if (c.officerComment && c.officerComment.includes('[LAND]')) {
        const cleaned = c.officerComment.replace(/^\[LAND\]\s*/i, '').trim();
        if (cleaned && !landIssueTexts.includes(cleaned)) {
          landIssueTexts.push(cleaned);
        }
      }
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Survey No. ${land.surveyNumber} — Registered Crops`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Land Parcel Information Strip */}
        <div className="p-4 rounded-2xl bg-[#030b0e] border border-teal-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#06151a] text-teal-400 border border-teal-800/60 flex items-center justify-center flex-shrink-0">
              <LandPlot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-extrabold text-teal-300">
                  Survey No. {land.surveyNumber}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#06151a] border border-teal-900/60 text-slate-300">
                  {land.ownershipType || 'Owned'}
                </span>
                {land.overallVerificationStatus && (
                  <StatusBadge status={land.overallVerificationStatus} />
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                <MapPin className="w-3 h-3 inline text-teal-400 mr-1" />
                {land.village || 'Village'}, {land.district || 'District'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-teal-900/40 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Parcel Area
            </span>
            <strong className="text-sm font-black text-white">
              {land.totalArea} {land.areaUnit || 'Acres'}
            </strong>
          </div>
        </div>

        {/* 🌟 LAND-LEVEL OFFICER REMARKS BANNER (Displayed ABOVE all crop cards) */}
        {landIssueTexts.length > 0 && (
          <div className="p-4 bg-amber-950/80 border border-amber-500/60 rounded-2xl text-xs space-y-2 shadow-md">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="uppercase tracking-wider">Officer Remarks on Land Parcel / Documents:</span>
              </div>
              {land.resubmissionCount > 0 && (
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                  land.resubmissionCount >= 3
                    ? 'bg-rose-900 border-rose-500 text-rose-200'
                    : 'bg-amber-900/80 border-amber-500/40 text-amber-200'
                }`}>
                  Correction Attempt {land.resubmissionCount} of 3
                </span>
              )}
            </div>
            {landIssueTexts.map((text, idx) => (
              <p
                key={idx}
                className="text-white bg-[#030b0e] p-2.5 rounded-xl border border-amber-500/30 font-medium"
              >
                "{text}"
              </p>
            ))}
          </div>
        )}

        {/* Crops List Count Banner */}
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-teal-400" />
            <span>
              Cultivated Crops on Record ({crops.length})
            </span>
          </h4>
          <span className="text-xs font-bold text-slate-300">
            Total Cultivated: <strong className="text-white">{totalAllocated.toFixed(1)} {land.areaUnit || 'Acres'}</strong>
          </span>
        </div>

        {/* Crops Cards List */}
        {crops.length === 0 ? (
          <div className="p-8 text-center bg-[#030b0e] rounded-2xl border border-teal-900/60 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#06151a] text-teal-400 border border-teal-800/60 flex items-center justify-center mx-auto">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-bold text-white">No Crops Recorded on This Parcel</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active or past crop applications are linked to Survey No. {land.surveyNumber} yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {crops.map((crop, idx) => {
              // Only consider an issue crop-specific if it does NOT contain [LAND]
              const cropSpecificIssues = Array.isArray(crop.cropIssues)
                ? crop.cropIssues
                : [];
              const hasPureCropComment =
                crop.officerComment &&
                !crop.officerComment.includes('[LAND]') &&
                crop.status === 'RETURNED_FOR_CORRECTION';

              return (
                <div
                  key={crop._id || idx}
                  className="p-4 bg-[#030b0e] rounded-2xl border border-teal-900/60 hover:border-teal-400/60 transition-all space-y-3 shadow-md"
                >
                  {/* Header: Name, Variety, Category & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-teal-300 bg-[#06151a] px-2 py-0.5 rounded-lg border border-teal-900/60">
                          #{idx + 1}
                        </span>
                        <h5 className="text-sm font-extrabold text-white">
                          {crop.cropName}
                        </h5>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium ml-7 block mt-0.5">
                        {crop.cropCategory || 'Cereals'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <StatusBadge status={crop.status} />
                      {crop.resubmissionCount > 0 && crop.status === 'RETURNED_FOR_CORRECTION' && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                          crop.resubmissionCount >= 3
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                        }`}>
                          Attempt {crop.resubmissionCount}/3
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Grid info metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-teal-950/80 text-xs">
                    <div className="p-2 bg-[#06151a] rounded-xl border border-teal-900/40">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Cultivated</span>
                      <strong className="text-xs text-white">
                        {crop.cultivatedArea} {crop.areaUnit || 'Acres'}
                      </strong>
                    </div>

                    <div className="p-2 bg-[#06151a] rounded-xl border border-teal-900/40">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Season</span>
                      <strong className="text-xs text-white">
                        {crop.season} ({crop.year || new Date().getFullYear()})
                      </strong>
                    </div>

                    <div className="p-2 bg-[#06151a] rounded-xl border border-teal-900/40">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Sowing Date</span>
                      <strong className="text-xs text-white truncate block">
                        {crop.sowingDate ? new Date(crop.sowingDate).toLocaleDateString() : 'N/A'}
                      </strong>
                    </div>

                    <div className="p-2 bg-[#06151a] rounded-xl border border-teal-900/40">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Irrigation</span>
                      <strong className="text-xs text-white truncate block">
                        {crop.irrigationType || 'Borewell'}
                      </strong>
                    </div>
                  </div>

                  {/* Crop-Specific officer remarks (ONLY shown if it's a specific crop issue, NOT land issue) */}
                  {cropSpecificIssues.length > 0 ? (
                    <div className="p-3 bg-amber-950/80 rounded-xl border border-amber-500/50 text-xs text-amber-200 space-y-1">
                      <strong className="text-amber-300">⚠️ Specific Note on {crop.cropName}:</strong>
                      {cropSpecificIssues.map((iss) => (
                        <p key={iss._id || iss.id}>"{iss.description}"</p>
                      ))}
                    </div>
                  ) : hasPureCropComment ? (
                    <div className="p-3 bg-amber-950/80 rounded-xl border border-amber-500/50 text-xs text-amber-200">
                      <strong className="text-amber-300">⚠️ Officer Remarks on {crop.cropName}:</strong> "{crop.officerComment}"
                    </div>
                  ) : null}

                  {/* Footer action bar */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[10px] font-mono text-slate-500">
                      Reg ID: {crop.registrationId}
                    </span>
                    {onViewCropDetails && (
                      <button
                        type="button"
                        onClick={() => onViewCropDetails(crop)}
                        className="px-3 py-1.5 bg-[#06151a] hover:bg-[#0c242c] text-teal-300 hover:text-white rounded-xl border border-teal-900/60 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-400" />
                        <span>View Full Details</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-teal-900/60">
          <span className="text-xs text-slate-400">
            Click on any crop above to view full verification history.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#06151a] hover:bg-[#0c242c] text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-teal-900/60 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
