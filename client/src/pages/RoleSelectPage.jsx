import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight, ShieldCheck, UserCheck, Store, Building2 } from 'lucide-react';

export default function RoleSelectPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'FARMER',
      title: 'Farmer',
      emoji: '👨‍🌾',
      tagline: 'Digitally submit crops, check weather advisories & discover local agro shops',
      color: 'border-teal-500/20 hover:border-teal-400/60 bg-[#06171c]/80',
      badge: 'bg-emerald-950/80 text-teal-300 border border-teal-500/30',
      btnColor: 'bg-[#2dd4bf] hover:bg-[#5eead4] text-[#030712] font-bold shadow-[0_0_20px_rgba(45,212,191,0.4)]',
    },
    {
      id: 'SHOPKEEPER',
      title: 'Shopkeeper',
      emoji: '🏪',
      tagline: 'Manage agricultural stores, product catalog, inventory & live stock updates',
      color: 'border-teal-500/20 hover:border-amber-400/60 bg-[#06171c]/80',
      badge: 'bg-amber-950/80 text-amber-300 border border-amber-500/30',
      btnColor: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    },
    {
      id: 'OFFICER',
      title: 'Government Officer',
      emoji: '🏛️',
      tagline: 'Review pending crop verifications, audit survey numbers & approve land passes',
      color: 'border-teal-500/20 hover:border-cyan-400/60 bg-[#06171c]/80',
      badge: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30',
      btnColor: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)]',
    },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient spotlight */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="radar-circle w-[350px] h-[350px] border-teal-500/15" />
        <div className="radar-circle w-[600px] h-[600px] border-teal-500/10" />
      </div>

      <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#06181d] border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-[0_0_15px_rgba(45,212,191,0.15)]">
            <Sprout className="w-4 h-4 text-teal-400" />
            <span>FarmSetu 🌾 Role Access</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2dd4bf] text-glow-teal tracking-tight">
            Welcome to FarmSetu
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal max-w-lg mx-auto leading-relaxed">
            How would you like to continue? Select your role portal below.
          </p>
        </div>

        {/* 3 Role Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => navigate(`/login?role=${role.id}`)}
              className={`glass-card rounded-3xl p-6 border shadow-2xl transition-all cursor-pointer flex flex-col justify-between group ${role.color}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl p-3 rounded-2xl bg-[#030d10] border border-teal-900/60 shadow-inner">
                    {role.emoji}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${role.badge}`}>
                    {role.title}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {role.tagline}
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <div
                  className={`w-full py-3 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all ${role.btnColor}`}
                >
                  <span>Continue as {role.title}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Link */}
        <div className="pt-4">
          <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-teal-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
