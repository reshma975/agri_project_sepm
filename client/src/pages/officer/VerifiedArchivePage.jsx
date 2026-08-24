import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ExportModal from '../../components/officer/ExportModal';
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
  MapPin
} from 'lucide-react';

export default function VerifiedArchivePage() {
  const [verifiedList, setVerifiedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchVerified = async () => {
    try {
      setLoading(true);
      const params = { status: 'VERIFIED' };
      if (selectedYear !== 'All') params.year = selectedYear;
      if (searchQuery) params.search = searchQuery;

      const res = await apiClient.get('/officer/verifications', { params });
      if (res.data.success) {
        setVerifiedList(res.data.applications);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/officer/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-all mb-3 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            ✅ Verified Applications Archive (Check Verified)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Audit history of all verified and certified crop records across your jurisdiction.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExportModalOpen(true)}
          className="px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-forest-200 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV / Print</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified crop name, farmer name, or survey number..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-600">Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
          >
            <option value="All">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Verified List */}
      {loading ? (
        <LoadingSpinner message="Loading verified crop records..." />
      ) : verifiedList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
          <FileCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-base text-slate-800">No Verified Records Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No crop registrations match the selected year and search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verifiedList.map((app) => {
            const farmer = app.farmerId?.userId || {};
            const profile = app.farmerId || {};

            return (
              <div
                key={app._id}
                className="glass-card rounded-3xl p-5 border border-emerald-200 bg-white hover:border-forest-500 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">{app.cropName}</h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Reg ID: #{app.registrationId} • Year: {app.year}
                      </p>
                    </div>
                    <StatusBadge status="VERIFIED" />
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs space-y-1 text-slate-700">
                    <p>
                      Farmer: <strong>{farmer.name || 'Farmer'}</strong> ({profile.farmerId || 'FMR-ID'})
                    </p>
                    <p>
                      Location: {profile.village || 'Village'}, {profile.district || 'Vijayawada'}
                    </p>
                    <p>
                      Survey: #{app.surveyNumber} • Area: <strong>{app.cultivatedArea} {app.areaUnit}</strong> ({app.season} Season)
                    </p>
                  </div>

                  {app.officerComment && (
                    <p className="text-xs text-slate-600 italic">
                      Officer Audit Note: "{app.officerComment}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Verified on {formatDate(app.reviewedAt || app.updatedAt)}
                  </span>
                  <button
                    onClick={() => navigate(`/officer/crops/${app._id}`)}
                    className="font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
                  >
                    View Audit Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}
