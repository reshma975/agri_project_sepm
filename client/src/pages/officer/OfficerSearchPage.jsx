import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Search,
  User,
  MapPin,
  Phone,
  LandPlot,
  Sprout,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowLeft
} from 'lucide-react';

export default function OfficerSearchPage() {
  const [query, setQuery] = useState('FMR000123');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await apiClient.get(`/officer/farmers/search?query=${encodeURIComponent(query.trim())}`);
      if (res.data.success) {
        setResults(res.data.results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Back Navigation */}
      <div>
        <Link
          to="/officer/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-all mb-3 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="w-7 h-7 text-blue-600" />
          🔍 Officer Farmer Search Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Lookup farmer registration records by Farmer ID (e.g. FMR000123), Name, Mobile Number, or Village.
        </p>
      </div>

      {/* Prominent Search Bar (Section 21 Layout) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Farmer ID (FMR000123), Name, Mobile (+91...), or Village..."
              className="w-full pl-12 pr-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>Search Records</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-slate-500">
          <span className="font-bold text-slate-700">Quick Searches:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('FMR000123');
              handleSearch();
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono text-[11px]"
          >
            FMR000123
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('Ramesh');
              handleSearch();
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[11px]"
          >
            Ramesh Patel
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('Kankipadu');
              handleSearch();
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[11px]"
          >
            Kankipadu Village
          </button>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <LoadingSpinner message="Searching registered farmer database..." />
      ) : searched && results.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
          <User className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-base text-slate-800">No Farmer Record Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No farmer found matching "{query}". Check the Farmer ID or name and try again.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((item, idx) => {
            const profile = item.profile || {};
            const farmer = profile.userId || {};
            const crops = item.crops || [];
            const lands = item.lands || [];

            return (
              <div
                key={profile._id || idx}
                className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-md"
              >
                {/* Farmer Profile Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl border border-blue-200 flex-shrink-0">
                      👨‍🌾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-slate-900">{farmer.name}</h3>
                        <StatusBadge status={profile.registrationStatus || 'VERIFIED'} />
                      </div>
                      <p className="text-xs font-mono font-bold text-blue-800 mt-0.5">
                        Farmer ID: {profile.farmerId} • Mobile: {farmer.phone}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-forest-600" />
                        {profile.village}, {profile.district || 'Vijayawada'} • {profile.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Land Parcels</span>
                      <strong className="text-slate-800 text-sm">{lands.length} Parcels</strong>
                    </div>
                    <div className="border-l border-slate-200 pl-3">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Crop Entries</span>
                      <strong className="text-slate-800 text-sm">{crops.length} Total</strong>
                    </div>
                  </div>
                </div>

                {/* Crop Applications History */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                    Crop Pre-Registration Applications ({crops.length})
                  </h4>

                  {crops.length === 0 ? (
                    <p className="text-xs text-slate-400">No crop applications submitted yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {crops.map((c) => (
                        <div
                          key={c._id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-sm text-slate-900">{c.cropName}</h5>
                              <span className="text-xs text-slate-500">
                                Survey #{c.surveyNumber} • {c.cultivatedArea} {c.areaUnit}
                              </span>
                            </div>
                            <StatusBadge status={c.status} />
                          </div>

                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                            <span className="text-slate-500">{c.season} ({c.year})</span>
                            <button
                              onClick={() => navigate(`/officer/crops/${c._id}`)}
                              className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                            >
                              Review / Details <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
