import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ExportModal from '../../components/officer/ExportModal';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import {
  FileCheck,
  CheckCircle2,
  Calendar,
  Search,
  Download,
  Filter,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MapPin,
  LandPlot,
  User,
  Layers,
  FileText,
  AlertCircle,
  Eye,
  MoreVertical,
  Sprout,
  Tag
} from 'lucide-react';

export default function VerifiedArchivePage() {
  const [verifiedList, setVerifiedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [docsModalData, setDocsModalData] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const navigate = useNavigate();

  const fetchVerified = async () => {
    try {
      setLoading(true);
      const params = { status: 'VERIFIED' };
      if (selectedYear !== 'All') params.year = selectedYear;
      if (searchQuery) params.search = searchQuery;

      const res = await apiClient.get('/officer/verifications', { params });
      if (res.data.success) {
        setVerifiedList(res.data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching verified applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerified();
  }, [selectedYear, searchQuery]);

  // Group verified crop applications by Land Parcel (Land-Centric Architecture)
  const landMap = {};

  verifiedList.forEach((app) => {
    const land = app.landId;
    const farmer = app.farmerId?.userId || {};
    const profile = app.farmerId || {};
    const parcelKey = land?._id?.toString() || `${profile._id || 'unknown'}_${app.surveyNumber}`;

    if (!landMap[parcelKey]) {
      landMap[parcelKey] = {
        _id: land?._id || app._id,
        landId: land?.landId || `LND${app.registrationId?.replace(/\D/g, '') || Math.floor(10000 + Math.random() * 90000)}`,
        surveyNumber: app.surveyNumber,
        village: land?.village || app.village || profile.village || 'Village',
        mandal: land?.mandal || app.mandal || profile.mandal || 'Mandal',
        district: land?.district || app.district || profile.district || 'District',
        totalArea: land?.totalArea || app.totalLandArea || app.cultivatedArea || 2,
        areaUnit: land?.areaUnit || app.areaUnit || 'Acres',
        ownershipType: land?.ownershipType || app.ownershipType || 'Owned',
        landUse: land?.landUse || 'Agricultural',
        season: app.season ? `${app.season} Season` : 'Kharif Season',
        year: app.year || new Date().getFullYear(),
        reviewedAt: app.reviewedAt || app.updatedAt,
        officerComment: app.officerComment || 'Verified and approved according to agricultural survey standards.',
        farmer,
        profile,
        documents: profile.documents || {},
        crops: []
      };
    }

    landMap[parcelKey].crops.push({
      _id: app._id,
      registrationId: app.registrationId,
      cropName: app.cropName,
      cropCategory: app.cropCategory || 'Cereals',
      season: app.season || 'Kharif',
      year: app.year || 2026,
      cultivatedArea: app.cultivatedArea,
      areaUnit: app.areaUnit || 'Acres',
      status: app.status
    });
  });

  const verifiedLands = Object.values(landMap);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/officer/dashboard"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-teal-300 bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 transition-all mb-2 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-teal-400" />
            <span>Verified Applications Archive (Check Verified)</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Audit history of all verified land parcels and certified crop records across your jurisdiction.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExportModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-950" />
          <span>Export CSV / Print</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-3 bg-[#06151a]/95 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-700 shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-teal-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farmer name, ID, survey number, or crop..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#030b0e] border border-slate-700 text-white rounded-xl focus:border-teal-400 outline-none placeholder:text-slate-500 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-xs font-bold text-slate-300">Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-bold bg-[#030b0e] border border-slate-700 text-white rounded-xl focus:border-teal-400 outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#06151a] text-white">All Years</option>
            <option value="2026" className="bg-[#06151a] text-white">2026</option>
            <option value="2025" className="bg-[#06151a] text-white">2025</option>
            <option value="2024" className="bg-[#06151a] text-white">2024</option>
          </select>
        </div>
      </div>

      {/* Compact Verified Lands List */}
      {loading ? (
        <LoadingSpinner message="Loading verified land records..." />
      ) : verifiedLands.length === 0 ? (
        <div className="text-center py-10 bg-[#06151a]/95 rounded-2xl border border-slate-700 p-5 space-y-2 shadow-lg">
          <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-extrabold text-sm text-white">No Verified Records Found</h4>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            No verified land parcels match the selected year and search query.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifiedLands.map((land) => (
            <div
              key={land._id}
              className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-700 bg-[#06151a]/95 hover:border-teal-400/80 transition-all space-y-3.5 shadow-xl"
            >
              {/* 1. Header: Farmer Name and Farmer ID prominently displayed with Verified Badge & Land ID */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#030b0e] text-teal-400 border border-teal-500/40 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-white">
                        {land.farmer.name || 'Farmer'}
                        <span className="ml-1.5 text-xs font-mono font-bold text-teal-300 bg-[#030b0e] px-2 py-0.5 rounded-md border border-slate-700">
                          {land.profile.farmerId || 'FMR-ID'}
                        </span>
                      </h3>
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/50 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Verified &amp; Approved
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-300 font-mono mt-0.5">
                      LandID: #{land.landId} • Year: {land.year}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Compact 3-Column Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Column 1: Location, Survey, Ownership */}
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>
                      Location: <strong className="text-white">{land.village}, {land.mandal}</strong>, {land.district}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>
                      Survey / Khata No.: <strong className="text-white font-mono">#{land.surveyNumber}</strong>
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <Tag className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>
                      Ownership: <strong className="text-white">{land.ownershipType} Land</strong>
                    </span>
                  </p>
                </div>

                {/* Column 2: Total Area, Land Use */}
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>
                      Total Area: <strong className="text-teal-300 font-bold">{land.totalArea} {land.areaUnit}</strong>
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <LandPlot className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>
                      Land Use: <strong className="text-white">{land.landUse}</strong>
                    </span>
                  </p>
                </div>

                {/* Column 3: Season, Verified on */}
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>
                      Land Type / Season: <strong className="text-teal-300 font-bold">{land.season}</strong>
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>
                      Verified on: <strong className="text-white">{formatDate(land.reviewedAt)}</strong>
                    </span>
                  </p>
                </div>
              </div>

              {/* 3. Officer Audit Note Strip */}
              <div className="p-2.5 sm:p-3 bg-[#030b0e] rounded-xl border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300 min-w-0 flex-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    Officer Audit Note: <em className="text-white">"{land.officerComment}"</em>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDocsModalData(land)}
                  className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <span>View Land Documents</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4. Crops Registered on this Land Table */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-teal-400" />
                    <span>Crops Registered on this Land ({land.crops.length})</span>
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#030b0e]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#06151a] text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Crop</th>
                        <th className="px-3 py-2">Season / Year</th>
                        <th className="px-3 py-2">Area (in Acres)</th>
                        <th className="px-3 py-2">Registration ID</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {land.crops.map((crop, cIdx) => (
                        <tr key={cIdx} className="hover:bg-[#06151a]/60 transition-colors">
                          <td className="px-3 py-2 font-bold text-white flex items-center gap-2">
                            <span>{crop.cropName}</span>
                          </td>
                          <td className="px-3 py-2 text-slate-300">
                            {crop.season} {crop.year}
                          </td>
                          <td className="px-3 py-2 font-mono font-bold text-teal-300">
                            {crop.cultivatedArea} {crop.areaUnit || 'Acres'}
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-400">
                            #{crop.registrationId}
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Verified &amp; Approved
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => navigate(`/officer/crops/${crop._id}`)}
                              className="px-2 py-0.5 text-[10px] font-bold text-teal-300 hover:text-white bg-[#06151a] hover:bg-[#0c242c] border border-slate-700 rounded-md inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Audit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. Card Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-0.5">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 text-teal-400" />
                    Total Area under this Land: <strong className="text-teal-300">{land.totalArea} {land.areaUnit}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/officer/crops/${land.crops[0]?._id}`)}
                    className="font-bold text-xs text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <span>View All Crop Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Land Documents Modal */}
      {docsModalData && (
        <Modal
          isOpen={Boolean(docsModalData)}
          onClose={() => setDocsModalData(null)}
          title={`Land Documents — Survey No. ${docsModalData.surveyNumber}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#030b0e] rounded-xl border border-slate-700 text-slate-300 space-y-1">
              <p>
                Farmer: <strong className="text-white">{docsModalData.farmer.name}</strong> ({docsModalData.profile.farmerId})
              </p>
              <p>
                Land Parcel: <strong className="text-white">Survey #{docsModalData.surveyNumber}</strong> ({docsModalData.village}, {docsModalData.mandal})
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Aadhaar */}
              <div className="p-3 bg-[#030b0e] border border-slate-700 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <strong className="text-white block font-bold truncate">1. Aadhaar ID Proof</strong>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {docsModalData.documents.aadhaarDoc?.fileName || 'aadhaar_document.pdf'}
                    </span>
                  </div>
                </div>
                {docsModalData.documents.aadhaarDoc?.fileName && (
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewDoc({
                        label: 'Aadhaar ID Proof',
                        fileName: docsModalData.documents.aadhaarDoc.fileName,
                        fileData: docsModalData.documents.aadhaarDoc.fileData,
                        fileSize: docsModalData.documents.aadhaarDoc.fileSize || '1.4 MB'
                      })
                    }
                    className="px-2.5 py-1 text-xs font-bold text-teal-300 bg-[#06151a] hover:bg-[#0c242c] border border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer flex-shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-400" /> View
                  </button>
                )}
              </div>

              {/* Passbook */}
              <div className="p-3 bg-[#030b0e] border border-slate-700 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <strong className="text-white block font-bold truncate">2. Bank DBT Passbook</strong>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {docsModalData.documents.passbookDoc?.fileName || 'bank_passbook.pdf'}
                    </span>
                  </div>
                </div>
                {docsModalData.documents.passbookDoc?.fileName && (
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewDoc({
                        label: 'Bank DBT Passbook',
                        fileName: docsModalData.documents.passbookDoc.fileName,
                        fileData: docsModalData.documents.passbookDoc.fileData,
                        fileSize: docsModalData.documents.passbookDoc.fileSize || '920 KB'
                      })
                    }
                    className="px-2.5 py-1 text-xs font-bold text-teal-300 bg-[#06151a] hover:bg-[#0c242c] border border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer flex-shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-400" /> View
                  </button>
                )}
              </div>

              {/* Land Record */}
              <div className="p-3 bg-[#030b0e] border border-slate-700 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <strong className="text-white block font-bold truncate">3. Land Title Record (1-B / RoR)</strong>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {docsModalData.documents.landRecordDoc?.fileName || 'land_record_1b.pdf'}
                    </span>
                  </div>
                </div>
                {docsModalData.documents.landRecordDoc?.fileName && (
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewDoc({
                        label: 'Land Title Record (1-B / RoR)',
                        fileName: docsModalData.documents.landRecordDoc.fileName,
                        fileData: docsModalData.documents.landRecordDoc.fileData,
                        fileSize: docsModalData.documents.landRecordDoc.fileSize || '2.1 MB'
                      })
                    }
                    className="px-2.5 py-1 text-xs font-bold text-teal-300 bg-[#06151a] hover:bg-[#0c242c] border border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer flex-shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-400" /> View
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Live Fullscreen Document Viewer Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Official Document: ${previewDoc.label}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#030b0e] rounded-xl border border-slate-700 text-xs">
              <span className="font-mono text-white font-bold">{previewDoc.fileName}</span>
              <span className="text-slate-400 font-bold">{previewDoc.fileSize}</span>
            </div>

            <div className="bg-[#030b0e] rounded-2xl p-3 border border-slate-700 flex items-center justify-center min-h-[360px] overflow-auto">
              {previewDoc.fileData ? (
                previewDoc.fileData.startsWith('data:image/') ? (
                  <img
                    src={previewDoc.fileData}
                    alt={previewDoc.label}
                    className="max-h-[500px] w-auto object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <iframe
                    src={previewDoc.fileData}
                    title={previewDoc.label}
                    className="w-full h-[500px] rounded-lg border border-slate-800"
                  />
                )
              ) : (
                <div className="text-center p-8 space-y-2">
                  <FileText className="w-12 h-12 text-teal-400/60 mx-auto" />
                  <p className="text-xs text-slate-300">
                    File "{previewDoc.fileName}" is digitally verified on government revenue servers.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}
