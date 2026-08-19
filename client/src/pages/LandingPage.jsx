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
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Sprout,
      title: '🌾 Digital Farm Records',
      description: 'Digitally maintain crop and land-related information with multi-year historical logs and verification status.',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      icon: Store,
      title: '🏪 Agricultural Shops',
      description: 'Find authorized local agricultural shops, check real-time product stock, compare prices, and read farmer ratings.',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      icon: CloudSun,
      title: '🌦️ Weather Alerts',
      description: 'Get location-specific agricultural weather forecasts, rain probability, and timely severe-weather farming advisories.',
      bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      icon: Building2,
      title: '🏛️ Government Updates',
      description: 'Stay updated with verified government welfare schemes, fertilizer subsidies, crop insurance, and official notifications.',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      icon: Bot,
      title: '🤖 AI Agricultural Assistant',
      description: 'Ask farming-related questions in text or voice regarding pest management, fertilizer ratios, and crop care.',
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:py-28 overflow-hidden bg-gradient-to-b from-forest-50/70 via-emerald-50/30 to-[#F7F9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-100/80 border border-forest-300 text-forest-800 text-xs sm:text-sm font-bold shadow-xs">
                <Sprout className="w-4 h-4 text-forest-600 animate-pulse" />
                <span>Next-Gen MERN Agriculture Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Connecting <span className="text-forest-600 underline decoration-forest-300 decoration-wavy decoration-2">Farmers</span>,{' '}
                <span className="text-amber-600">Markets</span> &{' '}
                <span className="text-blue-700">Government</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                <strong>FarmSetu</strong> is a digital crop pre-registration, agricultural shops discovery, and officer verification platform designed to streamline agricultural records and eliminate waiting lines.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/select-role"
                  className="w-full sm:w-auto px-8 py-4 bg-forest-600 hover:bg-forest-700 text-white font-bold rounded-2xl shadow-lg shadow-forest-300 transition-all flex items-center justify-center gap-2 group text-base"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#features"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all text-center text-base"
                >
                  Explore Features
                </a>
              </div>

              {/* Trust badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-forest-600" />
                  Officer Verification Audit
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-forest-600" />
                  Real-time Stock Discovery
                </span>
                <span className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-forest-600" />
                  AI Voice Assistant
                </span>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-forest-100">
                {/* Visual crop banner */}
                <div className="relative h-56 rounded-2xl overflow-hidden mb-5">
                  <img
                    src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
                    alt="Lush Agricultural Field"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                        Live Field Record
                      </span>
                      <h3 className="font-bold text-base mt-1">Paddy (Kharif Season 2026)</h3>
                      <p className="text-xs text-slate-200">Survey No. 125/2 • 2.5 Acres • Krishna Dist</p>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-forest-50 border border-forest-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">☀️</span>
                      <div>
                        <strong className="text-forest-900 block">31°C • Good Farming Weather</strong>
                        <span className="text-forest-600">Ideal for weeding and field inspection</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]">
                      Optimal
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-amber-600" />
                      <div>
                        <strong className="text-amber-900 block">Sri Lakshmi Agro Agencies</strong>
                        <span className="text-amber-700">Urea ₹267/bag • 🟢 In Stock</span>
                      </div>
                    </div>
                    <span className="text-amber-800 font-bold">⭐ 4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Roles Section (Section 8) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
            Three Dedicated Portals
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Choose Your Platform Experience
          </h2>
          <p className="text-sm text-slate-500">
            Select your role to access customized dashboards, workflows, and tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role 1: Farmer */}
          <Link
            to="/login?role=FARMER"
            className="glass-card rounded-3xl p-6 border-2 border-emerald-200 hover:border-forest-600 group transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              👨‍🌾
            </div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-forest-700 transition-colors">
              Farmer Portal
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Digitally submit crop information, maintain multi-year records, track verification, search nearby shops, and consult AI assistant.
            </p>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-forest-700">
              <span>Enter Farmer Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Role 2: Shopkeeper */}
          <Link
            to="/login?role=SHOPKEEPER"
            className="glass-card rounded-3xl p-6 border-2 border-amber-200 hover:border-amber-600 group transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🏪
            </div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
              Shopkeeper Portal
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Manage your agricultural stores, list seeds, fertilizers, and machinery, update live stock quantities, and serve farmers.
            </p>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Enter Shopkeeper Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Role 3: Officer */}
          <Link
            to="/login?role=OFFICER"
            className="glass-card rounded-3xl p-6 border-2 border-blue-200 hover:border-blue-600 group transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🏛️
            </div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
              Agriculture Officer Portal
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Review pre-registered crop records in your jurisdiction, verify land parcels, return corrections with audit notes, and export reports.
            </p>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Enter Officer Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Landing Page Features (Section 6) */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
            Comprehensive Capabilities
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Engineered for Modern Agriculture
          </h2>
          <p className="text-sm text-slate-500">
            Every feature is tailored to bring transparency, efficiency, and real-time connectivity to farming communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="glass-card rounded-3xl p-6 border border-slate-200 space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${f.bg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works (Section 7) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Simple Digital Flow
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              How FarmSetu Verification Works
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100">
              Transforming traditional Sachivalayam paper queues into a fast digital pre-registration workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-white">👨‍🌾 Farmer Submits Information</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Farmer enters land survey details, crop season, sowing date, and uploads required document copies in minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-extrabold flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-white">🏛️ Officer Reviews & Verifies</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Government Agriculture Officer reviews the pending application, checks survey records, and approves or requests correction.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white font-extrabold flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-white">🌾 Farmer Accesses Verified Records</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Farmer immediately views verified digital records with official audit timestamps for crop insurance and welfare schemes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
