import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Sprout, MapPin, Eye, LandPlot } from 'lucide-react';

export default function ParcelCropsModal({
  isOpen,
  onClose,
  land,
  crops = [],
  onViewCropDetails,
}) {
  if (!land) return null;

  const totalAllocated = crops.reduce((sum, c) => sum + (c.cultivatedArea || 0), 0);

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
            {crops.map((crop, idx) => (
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
                  <StatusBadge status={crop.status} />
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

                {/* Officer remarks if returned for correction */}
                {crop.status === 'RETURNED_FOR_CORRECTION' && crop.officerComment && (
                  <div className="p-3 bg-orange-950/80 rounded-xl border border-orange-500/50 text-xs text-orange-200">
                    <strong className="text-orange-300">⚠️ Officer Remarks:</strong> "{crop.officerComment}"
                  </div>
                )}

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
            ))}
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
