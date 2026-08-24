import React from 'react';
import { Sprout, Phone, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#020506] text-slate-400 pt-12 pb-8 border-t border-teal-500/15 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-teal-400 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.4)]">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Farm<span className="text-[#2dd4bf] text-glow-subtle">Setu</span> 🌾
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              "Connecting Farmers, Markets & Government"
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              A digital crop pre-registration, agricultural shops discovery, and officer verification platform empowering Indian agriculture.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2dd4bf] mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/farmer/crops" className="hover:text-[#2dd4bf] transition-colors">
                  Digital Farm Records
                </Link>
              </li>
              <li>
                <Link to="/farmer/shops" className="hover:text-[#2dd4bf] transition-colors">
                  Agricultural Shops & Inventory
                </Link>
              </li>
              <li>
                <Link to="/farmer/government-updates" className="hover:text-[#2dd4bf] transition-colors">
                  Government Schemes & Policies
                </Link>
              </li>
              <li>
                <Link to="/farmer/weather" className="hover:text-[#2dd4bf] transition-colors">
                  Weather Forecast & Alerts
                </Link>
              </li>
              <li>
                <Link to="/farmer/assistant" className="hover:text-[#2dd4bf] transition-colors">
                  FarmSetu AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Role Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2dd4bf] mb-3">
              Role Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login?role=FARMER" className="hover:text-[#2dd4bf] transition-colors">
                  👨‍🌾 Farmer Portal
                </Link>
              </li>
              <li>
                <Link to="/login?role=SHOPKEEPER" className="hover:text-[#2dd4bf] transition-colors">
                  🏪 Shopkeeper Portal
                </Link>
              </li>
              <li>
                <Link to="/login?role=OFFICER" className="hover:text-[#2dd4bf] transition-colors">
                  🏛️ Government Agriculture Officer
                </Link>
              </li>
              <li>
                <Link to="/select-role" className="hover:text-[#2dd4bf] transition-colors">
                  Switch Role / Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Farmer Helpline Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2dd4bf] mb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-teal-400" />
              Agri Helplines
            </h4>
            <div className="p-3.5 rounded-2xl bg-[#041217] border border-teal-900/50 space-y-1.5 text-xs">
              <p className="text-slate-300 font-semibold">Kisan Call Centre (Toll Free):</p>
              <p className="text-teal-400 font-mono font-bold">1800-180-1551</p>
              <p className="text-[11px] text-slate-400 pt-1">
                Available 6:00 AM to 10:00 PM in all Indian regional languages.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-6 border-t border-teal-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} FarmSetu. Built with MERN Stack for Farmers, Markets & Government.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-teal-400/90">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Digital Pre-Registration & Verification Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
