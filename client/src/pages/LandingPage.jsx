import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Store,
  Building2,
  CloudSun,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Users,
  Sparkles,
  Search,
  Check
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Sprout,
      title: '🌾 Digital Farm Records',
      description: 'Digitally maintain crop and land records with multi-year historical logs and official verification status.',
      bg: 'bg-emerald-950/60 text-teal-300 border-teal-500/30',
    },
    {
      icon: Store,
      title: '🏪 Agricultural Shops & Stock',
      description: 'Find authorized local agricultural shops, check real-time product stock, compare prices, and read farmer ratings.',
      bg: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
    },
    {
      icon: CloudSun,
      title: '🌦️ Agricultural Weather Advisories',
      description: 'Get location-specific agricultural weather forecasts, rain probability, and timely farming advisories.',
      bg: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30',
    },
    {
      icon: Building2,
      title: '🏛️ Government Schemes & Subsidies',
      description: 'Stay updated with verified government welfare schemes, fertilizer subsidies, crop insurance, and official notifications.',
      bg: 'bg-blue-950/60 text-blue-300 border-blue-500/30',
    },
    {
      icon: Bot,
      title: '🤖 AI Agricultural Assistant',
      description: 'Ask farming-related questions in text or voice regarding pest management, fertilizer ratios, and crop care.',
      bg: 'bg-teal-950/60 text-teal-300 border-teal-500/30',
    },
  ];

  return (
    <div className="min-h-screen text-slate-100 selection:bg-teal-400 selection:text-black">
      {/* Hero Section with Concentric Radar Ripple Glow */}
      <section className="relative min-h-[75vh] flex flex-col items-center justify-center pt-16 pb-24 px-4 overflow-hidden">
        {/* Ambient Dark Radar / Ripple Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Central Radial Teal Glow */}
          <div className="absolute w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute w-[350px] h-[350px] bg-teal-400/12 rounded-full blur-2xl" />

          {/* Concentric Ripple Rings */}
          <div className="radar-circle w-[280px] h-[280px] border-teal-500/20" />
          <div className="radar-circle w-[460px] h-[460px] border-teal-500/15" />
          <div className="radar-circle w-[680px] h-[680px] border-teal-500/10" />
          <div className="radar-circle w-[920px] h-[920px] border-teal-500/5" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7 px-4">
          {/* Mini Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#06181d]/80 border border-teal-500/30 text-teal-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(45,212,191,0.15)]">
            <Sprout className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>Next-Gen MERN Agriculture Platform</span>
          </div>

          {/* Main Title matching Reference Style */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#2dd4bf] text-glow-teal tracking-tight leading-tight">
            Welcome to FarmSetu
          </h1>

          {/* Subtitle matching Reference Style */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Your smart companion for managing farm records, health of crops, agricultural shops, and government verifications.
          </p>

          {/* Center Pill Buttons matching Reference */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              to="/login"
              className="w-full sm:w-auto px-9 py-3 btn-glow-primary text-sm sm:text-base font-bold flex items-center justify-center gap-2"
            >
              <span>Login</span>
            </Link>

            <Link
              to="/select-role"
              className="w-full sm:w-auto px-9 py-3 btn-glow-secondary text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
            >
              <span>Signup / Select Role</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Officer Verification Audit
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Real-time Stock Discovery
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Bot className="w-4 h-4 text-teal-400" />
              AI Agronomy Assistant
            </span>
          </div>
        </div>
      </section>

      {/* "Why Choose FarmSetu?" Section matching Reference Style */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-teal-950/40">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2dd4bf] text-glow-teal tracking-tight">
            Why Choose FarmSetu?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            Just as modern technology guides every sector toward prosperity, FarmSetu becomes the digital bridge for farmers in the field—streamlining crop registration, providing instant access to nearby authorized shops, and steering agriculture toward transparency and growth.
          </p>
        </div>
      </section>

      {/* 3 Core Roles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider bg-[#06181d] px-3 py-1 rounded-full border border-teal-500/30">
            Dedicated Portals
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Choose Your Platform Experience
          </h2>
          <p className="text-sm text-slate-400">
            Select your role to access customized dashboards, workflows, and tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role 1: Farmer */}
          <Link
            to="/login?role=FARMER"
            className="glass-card rounded-3xl p-6 border border-teal-500/20 hover:border-teal-400/60 group transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-teal-500/30 text-teal-300 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-teal-950">
              👨‍🌾
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
              Farmer Portal
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Digitally submit crop information, maintain multi-year records, track officer verification, search nearby shops, and consult AI assistant.
            </p>
            <div className="mt-6 pt-4 border-t border-teal-900/40 flex items-center justify-between text-xs font-bold text-teal-400">
              <span>Enter Farmer Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Role 2: Shopkeeper */}
          <Link
            to="/login?role=SHOPKEEPER"
            className="glass-card rounded-3xl p-6 border border-teal-500/20 hover:border-amber-400/60 group transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/30 text-amber-300 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-amber-950">
              🏪
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
              Shopkeeper Portal
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Manage your agricultural stores, list seeds, fertilizers, and machinery, update live stock quantities, and serve farmers transparently.
            </p>
            <div className="mt-6 pt-4 border-t border-teal-900/40 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Enter Shopkeeper Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Role 3: Officer */}
          <Link
            to="/login?role=OFFICER"
            className="glass-card rounded-3xl p-6 border border-teal-500/20 hover:border-cyan-400/60 group transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-950">
              🏛️
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              Agriculture Officer Portal
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Review pre-registered crop records in your jurisdiction, verify land parcels, return corrections with audit notes, and export reports.
            </p>
            <div className="mt-6 pt-4 border-t border-teal-900/40 flex items-center justify-between text-xs font-bold text-cyan-400">
              <span>Enter Officer Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider bg-[#06181d] px-3 py-1 rounded-full border border-teal-500/30">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Engineered for Modern Agriculture
          </h2>
          <p className="text-sm text-slate-400">
            Every feature is tailored to bring transparency, efficiency, and real-time connectivity to farming communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="glass-card rounded-3xl p-6 border border-teal-500/20 hover:border-teal-400/50 space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${f.bg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Flow */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="bg-[#051116] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-teal-900/50">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider bg-teal-950/80 px-3 py-1 rounded-full border border-teal-500/30">
              Simple Digital Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              How FarmSetu Verification Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Transforming traditional paper queues into a fast, transparent digital pre-registration workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="bg-[#071920] p-6 rounded-2xl border border-teal-900/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-400 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-md shadow-teal-500/20">
                1
              </div>
              <h3 className="text-base font-bold text-white">👨‍🌾 Farmer Submits Details</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Farmer enters land survey details, crop season, sowing date, and uploads required document copies in minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#071920] p-6 rounded-2xl border border-teal-900/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-400 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-md shadow-teal-500/20">
                2
              </div>
              <h3 className="text-base font-bold text-white">🏛️ Officer Reviews & Verifies</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Government Agriculture Officer reviews the pending application, checks survey records, and approves or requests correction.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#071920] p-6 rounded-2xl border border-teal-900/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-400 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-md shadow-teal-500/20">
                3
              </div>
              <h3 className="text-base font-bold text-white">🌾 Verified Digital Pass</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Farmer immediately views verified digital records with official audit timestamps for crop insurance and welfare schemes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
