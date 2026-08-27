import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import {
  User,
  MapPin,
  FileCheck,
  FileText,
  Eye,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function FarmerVerificationCard({
  farmerApp,
  onViewDoc,
  onVerifyFarmer,
  onReturnFarmer,
  onRejectFarmer,
  onReviewCrop
}) {
  const [expanded, setExpanded] = useState(true);

  const farmer = farmerApp.user || {};
  const profile = farmerApp.profile || {};
  const docs = farmerApp.documents || {};
  const crops = farmerApp.crops || [];
  const docStatus = farmerApp.documentsStatus || {};

  const totalArea = crops.reduce((sum, c) => sum + (c.cultivatedArea || 0), 0);

  return (
    <div className="glass-card bg-[#06151a]/95 rounded-3xl p-5 sm:p-6 border border-slate-700 hover:border-teal-400/80 transition-all shadow-xl space-y-5">
      {/* Farmer Identification Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700">
        <div className="flex items-start gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-[#030b0e] text-teal-400 border border-slate-700 flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">
            👨‍🌾
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">
                {farmer.name || 'Farmer Name'}
              </h3>
              <span className="text-xs font-mono font-bold text-teal-300 bg-[#030b0e] px-2.5 py-0.5 rounded-lg border border-slate-700">
                {profile.farmerId || farmerApp.farmerCode || 'FMR-ID'}
              </span>
              <StatusBadge status={profile.registrationStatus || 'UNDER_VERIFICATION'} />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                {profile.village || 'Village'}, <strong className="text-teal-300">{profile.mandal || 'Mandal'}</strong>
              </span>
              <span>•</span>
              <span>Phone: <strong className="text-white">{farmer.phone || '+91...'}</strong></span>
              <span>•</span>
              <span>Total Applications: <strong className="text-teal-300">{crops.length} Crop{crops.length !== 1 ? 's' : ''}</strong> ({totalArea.toFixed(1)} Acres)</span>
            </div>
          </div>
        </div>

        {/* Verification Action Decision Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onVerifyFarmer(farmerApp)}
            className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verify &amp; Approve</span>
          </button>

          <button
            type="button"
            onClick={() => onReturnFarmer(farmerApp)}
            className="px-4 py-2 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/50 text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Resubmit Needed</span>
          </button>

          <button
            type="button"
            onClick={() => onRejectFarmer(farmerApp)}
            className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/50 text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* Uploaded Verification Documents Section with Live VIEW Previews */}
      <div className="p-4 bg-[#030b0e] rounded-2xl border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Attached Verification Documents on File</span>
          </h4>
          {docStatus.allUploaded ? (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> All 3 Mandatory Docs Present
            </span>
          ) : (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Missing Some Mandatory Docs
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Aadhaar Document */}
          <div className="p-3 bg-[#06151a] rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Aadhaar ID</span>
              <strong className="text-white block truncate text-[11px] font-mono">
                {docs.aadhaarDoc?.fileName || 'Not uploaded'}
              </strong>
            </div>
            {docs.aadhaarDoc?.fileName ? (
              <button
                type="button"
                onClick={() =>
                  onViewDoc({
                    label: 'Aadhaar ID Proof',
                    fileName: docs.aadhaarDoc.fileName,
                    fileData: docs.aadhaarDoc.fileData,
                    fileSize: docs.aadhaarDoc.fileSize || '1.4 MB',
                    farmerName: farmer.name,
                    farmerCode: profile.farmerId,
                    mandal: profile.mandal
                  })
                }
                className="px-2.5 py-1 text-xs font-bold text-teal-300 bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-teal-400" /> View
              </button>
            ) : (
              <span className="text-[10px] text-rose-400 font-bold">Missing</span>
            )}
          </div>

          {/* Bank Passbook */}
          <div className="p-3 bg-[#06151a] rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Bank Passbook (DBT)</span>
              <strong className="text-white block truncate text-[11px] font-mono">
                {docs.passbookDoc?.fileName || 'Not uploaded'}
              </strong>
            </div>
            {docs.passbookDoc?.fileName ? (
              <button
                type="button"
                onClick={() =>
                  onViewDoc({
                    label: 'Bank DBT Passbook',
                    fileName: docs.passbookDoc.fileName,
                    fileData: docs.passbookDoc.fileData,
                    fileSize: docs.passbookDoc.fileSize || '920 KB',
                    farmerName: farmer.name,
                    farmerCode: profile.farmerId,
                    mandal: profile.mandal
                  })
                }
                className="px-2.5 py-1 text-xs font-bold text-teal-300 bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-teal-400" /> View
              </button>
            ) : (
              <span className="text-[10px] text-rose-400 font-bold">Missing</span>
            )}
          </div>

          {/* Land Record 1-B */}
          <div className="p-3 bg-[#06151a] rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Land Title (1-B / RoR)</span>
              <strong className="text-white block truncate text-[11px] font-mono">
                {docs.landRecordDoc?.fileName || 'Not uploaded'}
              </strong>
            </div>
            {docs.landRecordDoc?.fileName ? (
              <button
                type="button"
                onClick={() =>
                  onViewDoc({
                    label: 'Land Title (1-B / RoR Record)',
                    fileName: docs.landRecordDoc.fileName,
                    fileData: docs.landRecordDoc.fileData,
                    fileSize: docs.landRecordDoc.fileSize || '2.1 MB',
                    farmerName: farmer.name,
                    farmerCode: profile.farmerId,
                    mandal: profile.mandal
                  })
                }
                className="px-2.5 py-1 text-xs font-bold text-teal-300 bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-teal-400" /> View
              </button>
            ) : (
              <span className="text-[10px] text-rose-400 font-bold">Missing</span>
            )}
          </div>
        </div>
      </div>

      {/* Submitted Crops under this Farmer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Crops Submitted for Pre-Registration ({crops.length})</span>
          </h4>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>{expanded ? 'Collapse Crops' : 'Expand Crops'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
            {crops.map((crop) => (
              <div
                key={crop._id}
                className="p-4 bg-[#030b0e] rounded-2xl border border-slate-700/90 hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-extrabold text-sm text-white">
                        {crop.cropName}
                      </h5>
                      <p className="text-[11px] text-teal-300 font-semibold">
                        {crop.cropCategory || 'Cereals'} • {crop.season} ({crop.year})
                      </p>
                    </div>
                    <StatusBadge status={crop.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800 text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Survey Number</span>
                      <strong className="text-white">#{crop.surveyNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Cultivated Area</span>
                      <strong className="text-white">{crop.cultivatedArea} {crop.areaUnit || 'Acres'}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[10px]">Reg #{crop.registrationId}</span>
                  <button
                    type="button"
                    onClick={() => onReviewCrop(crop)}
                    className="font-bold text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
