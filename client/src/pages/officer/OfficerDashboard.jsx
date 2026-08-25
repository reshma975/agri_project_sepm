import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import VerificationQueueItem from '../../components/officer/VerificationQueueItem';
import ReviewActionModal from '../../components/officer/ReviewActionModal';
import ExportModal from '../../components/officer/ExportModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Search,
  Download,
  Filter,
  MapPin,
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterArea, setFilterArea] = useState('assigned'); // 'assigned' | 'all'

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/officer/dashboard', {
        params: { filterArea },
      });
      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Error fetching officer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filterArea]);

  const handleActionComplete = async (cropId, actionType, comment) => {
    try {
      let endpoint = `/officer/crops/${cropId}/verify`;
      if (actionType === 'RETURN') endpoint = `/officer/crops/${cropId}/return`;
      if (actionType === 'REJECT') endpoint = `/officer/crops/${cropId}/reject`;

      const res = await apiClient.put(endpoint, {
        comment,
        reason: comment,
      });

      if (res.data.success) {
        fetchDashboard();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to record officer action',
      };
    }
  };

  const officer = dashboardData?.officer || user?.profile || {};
  const stats = dashboardData?.stats || { pending: 0, verified: 0, returned: 0, rejected: 0 };
  const applications = dashboardData?.pendingApplications || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hi, {user?.name || user?.username || 'Officer'} 🏛️
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#030b0e] text-teal-300 border border-slate-700">
              {officer.designation || 'Agricultural Officer (AAO)'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-400" />
            Assigned Area: <strong className="text-white">{officer.assignedArea || 'Vijayawada Mandal'}</strong> • License #{officer.licenseNumber || 'AP-AGRI-OFF-2024'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Link
            to="/officer/search"
            className="px-4 py-2.5 bg-[#030b0e] hover:bg-[#0c242c] text-white text-xs sm:text-sm font-bold rounded-2xl border border-slate-700 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4 text-teal-400" />
            <span>Search Farmer</span>
          </Link>

          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Export Reports</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.pending}</p>
          <span className="text-[11px] text-slate-400 font-medium">Awaiting field verification</span>
        </div>

        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-teal-300">
            <span>Verified & Approved</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.verified}</p>
          <span className="text-[11px] text-slate-400 font-medium">Passed official survey audit</span>
        </div>

        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Returned for Correction</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.returned}</p>
          <span className="text-[11px] text-slate-400 font-medium">Sent notes to farmers</span>
        </div>

        <div className="glass-card bg-[#06151a]/95 rounded-2xl p-5 border border-slate-700 space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.rejected}</p>
          <span className="text-[11px] text-slate-400 font-medium">Non-compliant records</span>
        </div>
      </div>

      {/* Main Section: Pending Verifications */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-teal-400" />
              Pending Crop Verifications Queue
            </h2>
            <p className="text-xs text-slate-400">
              * Officer receives digital applications related to their assigned area jurisdiction.
            </p>
          </div>

          {/* Area Filter Selector */}
          <div className="flex items-center gap-1.5 bg-[#030b0e] px-3.5 py-2 rounded-2xl border border-slate-700 text-xs font-bold text-white shadow-xs">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-white"
            >
              <option value="assigned" className="bg-[#06151a] text-white">My Assigned Area ({officer.district || 'Vijayawada'})</option>
              <option value="all" className="bg-[#06151a] text-white">All District Regions</option>
            </select>
          </div>
        </div>

        {/* Applications Queue */}
        {loading ? (
          <LoadingSpinner message="Fetching pending crop verification requests..." />
        ) : applications.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All verifications clear!"
            description="There are currently no pending crop applications in your assigned area queue."
            actionText="Check Verified Records"
            onAction={() => navigate('/officer/archive')}
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <VerificationQueueItem
                key={app._id}
                application={app}
                onReview={(item) => navigate(`/officer/crops/${item._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Action Modal */}
      <ReviewActionModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onActionComplete={handleActionComplete}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}
