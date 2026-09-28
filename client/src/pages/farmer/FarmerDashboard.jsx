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
  AlertCircle,
  Newspaper
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

  // Extract farmer location from profile database
  const farmerLocation = [
    profile.village,
    profile.mandal,
    profile.district,
    profile.state
  ].filter(Boolean).join(', ') || `${profile.district || 'Vijayawada'}, Andhra Pradesh`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Namaste, {user?.name || 'Farmer'} 🌾
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Farmer ID: <span className="font-mono font-bold text-teal-400">{profile.farmerId || 'FMR000123'}</span> •{' '}
            {profile.village ? `${profile.village}, ` : ''}{profile.district || 'Vijayawada'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/farmer/farm-records"
            className="px-4 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
          >
            <LandPlot className="w-4 h-4" />
            + Add Crop / Land Parcel
          </Link>
        </div>
      </div>

      {/* 1. Top Weather Banner (Uses Registered Profile Location) */}
      <WeatherBanner location={farmerLocation} />

      {/* 2. Four Core Feature Cards (Matches Picture 2 Style!) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400/80 mb-3">
          Quick Access Portals
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Digital Farm Records */}
          <Link
            to="/farmer/farm-records"
            className="glass-card rounded-3xl p-6 border border-teal-500/20 hover:border-teal-400/50 group transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LandPlot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-white group-hover:text-teal-300 transition-colors">
                  Digital Farm Records
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  View past crop records, land survey parcels, and official verification status.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-teal-900/40 flex items-center justify-between text-xs font-bold text-teal-400">
              <span>{stats.totalCrops} Crop Entries</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Agricultural Shops & Stock Discovery */}
          <Link
            to="/farmer/shops"
            className="glass-card rounded-3xl p-6 border border-amber-500/20 hover:border-amber-400/50 group transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/70 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors">
                  Agricultural Shops
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Find local fertilizer & seed centers, check stock availability, and compare prices.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-teal-900/40 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Find Fertilizers & Seeds</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Agricultural Updates */}
          <Link
            to="/farmer/government-updates"
            className="glass-card rounded-3xl p-6 border border-cyan-500/20 hover:border-cyan-400/50 group transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors">
                  Agricultural Updates
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real-time agricultural news, trending farming updates, market insights, and policy alerts fetched live.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-teal-900/40 flex items-center justify-between text-xs font-bold text-cyan-400">
              <span>Explore Agricultural Updates</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Register Ourselves / Crop */}
          <Link
            to="/farmer/crops/register"
            className="glass-card rounded-3xl p-6 border border-teal-500/30 hover:border-teal-400/60 group transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-950/80 border border-teal-500/40 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-white group-hover:text-teal-300 transition-colors">
                  Register Crop
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pre-register your crop season, survey numbers, and document copies for officer verification.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-teal-900/40 flex items-center justify-between text-xs font-bold text-teal-400">
              <span>Submit New Record</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Direct FarmSetu AI Assistant Action */}
      <div className="p-6 rounded-3xl bg-[#092027] border border-teal-900/60 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0e2c34] flex items-center justify-center text-teal-400 border border-teal-500/30 flex-shrink-0">
            <Bot className="w-8 h-8 animate-pulse-subtle" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Have an Agriculture Question?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Ask our AI voice assistant about fertilizer ratios, yellow leaves, pests, or PM-KISAN schemes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAssistantOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 flex-shrink-0"
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
