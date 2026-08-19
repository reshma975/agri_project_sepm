import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import WeatherBanner from '../../components/farmer/WeatherBanner';
import VoiceAssistantWidget from '../../components/common/VoiceAssistantWidget';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Sprout,
  Store,
  Building2,
  FilePlus,
  LandPlot,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    const loadFarmerData = async () => {
      try {
        const res = await apiClient.get('/farmers/profile');
        if (res.data.success) {
          setProfileData(res.data);
        }
      } catch (err) {
        console.error('Error fetching farmer profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFarmerData();
  }, []);

  const profile = profileData?.profile || user?.profile || {};
  const stats = profileData?.stats || { totalCrops: 2, verifiedCrops: 1, pendingCrops: 1 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Namaste, {user?.name || 'Farmer'} 🌾
            </h1>
            <StatusBadge status={profile.registrationStatus || 'VERIFIED'} />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Farmer ID: <span className="font-mono font-bold text-forest-800">{profile.farmerId || 'FMR000123'}</span> •{' '}
            {profile.village ? `${profile.village}, ` : ''}{profile.district || 'Vijayawada'}
          </p>
        </div>

        {/* Quick Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/farmer/crops/register"
            className="px-4 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-forest-200 transition-all flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" />
            + Register New Crop
          </Link>
        </div>
      </div>

      {/* 1. Top Weather Banner (Matches Wireframe 3 Layout) */}
      <WeatherBanner location={`${profile.district || 'Vijayawada'}, Andhra Pradesh`} />

      {/* 2. Four Core Feature Cards (Matches Wireframe 3 Layout!) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Access Portals
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Digital Farm Records */}
          <Link
            to="/farmer/crops"
            className="glass-card rounded-3xl p-6 border border-emerald-200 hover:border-forest-600 group transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LandPlot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-slate-900 group-hover:text-forest-700 transition-colors">
                  Digital Farm Records
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  View past crop records, land survey parcels, and official verification status.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-forest-700">
              <span>{stats.totalCrops} Crop Entries</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Agricultural Shops & Stock Discovery */}
          <Link
            to="/farmer/shops"
            className="glass-card rounded-3xl p-6 border border-amber-200 hover:border-amber-600 group transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-slate-900 group-hover:text-amber-700 transition-colors">
                  Agricultural Shops
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Find local fertilizer & seed centers, check stock availability, and compare prices.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Find Fertilizers & Seeds</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Benefits & Policies (Government Updates) */}
          <Link
            to="/farmer/government-updates"
            className="glass-card rounded-3xl p-6 border border-blue-200 hover:border-blue-600 group transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  Benefits & Policies
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Official government welfare schemes, fertilizer subsidies, and crop insurance alerts.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Recommended Schemes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Register Ourselves / Crop */}
          <Link
            to="/farmer/crops/register"
            className="glass-card rounded-3xl p-6 border border-teal-200 hover:border-teal-600 group transition-all flex flex-col justify-between bg-gradient-to-br from-white to-teal-50/40"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">
                  Register Crop
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pre-register your crop season, survey numbers, and document copies for officer verification.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
              <span>Submit New Record</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Floating / Direct FarmSetu AI Assistant Action (Wireframe 3) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-forest-800 to-forest-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/20 flex-shrink-0">
            <Bot className="w-8 h-8 animate-pulse-subtle" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Have an Agriculture Question?</h3>
            <p className="text-xs sm:text-sm text-forest-200 mt-0.5">
              Ask our AI voice assistant about fertilizer ratios, yellow leaves, pests, or PM-KISAN schemes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAssistantOpen(true)}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 flex-shrink-0"
        >
          <span>🎙️ Open AI Assistant</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Voice Assistant Widget */}
      <VoiceAssistantWidget isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
