import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import ReviewActionModal from '../../components/officer/ReviewActionModal';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  User,
  MapPin,
  FileCheck,
  Calendar,
  Layers,
  FlaskConical,
  Bug,
  ShieldCheck,
  FileText,
  Eye,
  CheckCircle2,
  RotateCcw,
  XCircle,
  History,
  AlertCircle
} from 'lucide-react';

export default function CropReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crop, setCrop] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/officer/crops/${id}`);
      if (res.data.success) {
        setCrop(res.data.crop);
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Error fetching crop details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

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
        if (actionType === 'VERIFY') {
          confetti({ particleCount: 70, spread: 60 });
          setActionSuccess('Application verified and approved successfully!');
        } else if (actionType === 'RETURN') {
          setActionSuccess('Application returned for correction with notice to farmer.');
        } else {
          setActionSuccess('Application rejected.');
        }

        fetchApplicationDetails();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Action failed',
      };
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading application & documents..." fullScreen />;
  }

  if (!crop) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-slate-500">Application not found.</p>
        <Link to="/officer/dashboard" className="text-xs font-bold text-blue-700 mt-2 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const farmer = crop.farmerId?.userId || {};
  const farmerProfile = crop.farmerId || {};
  const documents = farmerProfile.documents || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button (Wireframe 5: "Back to avoid accidental opening") */}
      <div className="flex items-center justify-between">
        <Link
          to="/officer/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        <StatusBadge status={crop.status} />
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-sm border border-emerald-200 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header Banner: Farmer Name (Location/Area) (Wireframe 5) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
            Crop Pre-Registration Application
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {farmer.name || 'Farmer Name'} ({farmerProfile.village || 'Village'}, {farmerProfile.district || 'District'})
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Farmer ID: <strong>{farmerProfile.farmerId || 'FMR000123'}</strong> • Reg ID: #{crop.registrationId} • Submitted on {formatDate(crop.submittedAt)}
          </p>
        </div>

        {/* Action Trigger Buttons (Wireframe 5: Accept / Reject) */}
        <button
          type="button"
          onClick={() => setReviewModalOpen(true)}
          className="w-full sm:w-auto px-8 py-3.5 bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-forest-200 transition-all flex items-center justify-center gap-2 flex-shrink-0"
        >
          <FileCheck className="w-5 h-5" />
          <span>Make Verification Decision</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details Section (Wireframe 5: Details) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Farmer Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-forest-600" />
              Farmer Personal & Contact Details
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                <strong className="text-slate-800 text-sm">{farmer.phone || '+91 98480 11223'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Email</span>
                <strong className="text-slate-800 text-sm truncate block">{farmer.email}</strong>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Residential Address</span>
                <strong className="text-slate-800 text-xs">{farmerProfile.address || `${farmerProfile.village}, ${farmerProfile.district}`}</strong>
              </div>
            </div>
          </div>

          {/* 2. Land & Crop Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-forest-600" />
              Land Survey & Crop Submission Details
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Crop & Category</span>
                <strong className="text-forest-800 text-sm">{crop.cropName}</strong>
                <p className="text-[11px] text-slate-500">{crop.cropCategory || 'Cereals'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Survey Number</span>
                <strong className="text-forest-800 text-sm">#{crop.surveyNumber}</strong>
                <p className="text-[11px] text-slate-500">{crop.ownershipType || 'Owned'} Land</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cultivated Area</span>
                <strong className="text-forest-800 text-sm">{crop.cultivatedArea} {crop.areaUnit}</strong>
                <p className="text-[11px] text-slate-500">Total Parcel: {crop.totalLandArea || crop.cultivatedArea} {crop.areaUnit}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Season & Sowing Date</span>
                <strong className="text-forest-800 text-sm">{crop.season} ({crop.year})</strong>
                <p className="text-[11px] text-slate-500">Sown: {formatDate(crop.sowingDate)}</p>
              </div>

              <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Agricultural Inputs Declared</span>
                <p className="text-xs text-slate-700">
                  Fertilizers: <strong>{crop.fertilizersUsed || 'None declared'}</strong>
                </p>
                <p className="text-xs text-slate-700">
                  Pesticides: <strong>{crop.pesticidesUsed || 'None declared'}</strong>
                </p>
                <p className="text-xs text-slate-700">
                  Irrigation Source: <strong>{crop.irrigationType || 'Borewell'}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Uploaded Documents Section (Wireframe 5: Docs) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-blue-600" />
              Attached Documents for Verification
            </h3>

            <div className="space-y-3">
              {/* Aadhaar Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <strong className="text-slate-800 block">1. Aadhaar ID Proof</strong>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {documents.aadhaarDoc?.fileName || 'aadhaar_doc.pdf'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Viewing Aadhaar document: ${documents.aadhaarDoc?.fileName || 'aadhaar_doc.pdf'} (Masked / Verified)`)}
                  className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
              </div>

              {/* Passbook */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <strong className="text-slate-800 block">2. Bank DBT Passbook</strong>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {documents.passbookDoc?.fileName || 'bank_passbook.pdf'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Viewing Bank Passbook: ${documents.passbookDoc?.fileName || 'bank_passbook.pdf'}`)}
                  className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
              </div>

              {/* Land Record */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <strong className="text-slate-800 block">3. Land Title (1-B / RoR)</strong>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {documents.landRecordDoc?.fileName || 'land_record.pdf'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Viewing Land Record: ${documents.landRecordDoc?.fileName || 'land_record.pdf'}`)}
                  className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
              </div>
            </div>
          </div>

          {/* Audit Verification History (Section 15) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
              <History className="w-4 h-4 text-forest-600" />
              Verification History & Audit Trail
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400">No previous audit logs.</p>
            ) : (
              <div className="space-y-3 relative pl-4 border-l-2 border-slate-100">
                {history.map((h) => (
                  <div key={h._id} className="relative space-y-0.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-forest-600 absolute -left-[21px] top-1" />
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 font-bold">{h.action}</strong>
                      <span className="text-[10px] text-slate-400">{formatDate(h.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold">{h.officerName}</p>
                    {h.comment && (
                      <p className="text-xs text-slate-700 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                        "{h.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Action Modal */}
      <ReviewActionModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        application={crop}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
}
