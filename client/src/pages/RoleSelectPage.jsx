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
      tagline: 'Digitally submit crops, check weather & find agro shops',
      color: 'border-emerald-300 hover:border-emerald-600 bg-emerald-50/40',
      badge: 'bg-emerald-100 text-emerald-800',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      id: 'SHOPKEEPER',
      title: 'Shopkeeper',
      emoji: '🏪',
      tagline: 'Manage agro shops, products, inventory & live stock',
      color: 'border-amber-300 hover:border-amber-600 bg-amber-50/40',
      badge: 'bg-amber-100 text-amber-800',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    {
      id: 'OFFICER',
      title: 'Government Officer',
      emoji: '🏛️',
      tagline: 'Review pending verifications & audit crop registrations',
      color: 'border-blue-300 hover:border-blue-600 bg-blue-50/40',
      badge: 'bg-blue-100 text-blue-800',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-bold">
            <Sprout className="w-4 h-4 text-forest-600" />
            <span>FarmSetu 🌾 Role Access</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome to FarmSetu
          </h1>
          <p className="text-base text-slate-500 font-medium max-w-lg mx-auto">
            How would you like to continue? Select your role below.
          </p>
        </div>

        {/* 3 Role Options (Section 8 Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => navigate(`/login?role=${role.id}`)}
              className={`rounded-3xl p-6 border-2 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group ${role.color}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl p-2 rounded-2xl bg-white shadow-xs">
                    {role.emoji}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${role.badge}`}>
                    {role.title}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-forest-700 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {role.tagline}
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <div
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${role.btnColor}`}
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
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
