import React from 'react';
import { Sprout, Phone, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-slate-300 pt-12 pb-8 border-t border-forest-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                FarmSetu <span className="text-forest-400">🌾</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Connecting Farmers, Markets & Government"
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              A digital crop pre-registration, agricultural shops discovery, and officer verification platform empowering Indian agriculture.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest-300 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/farmer/crops" className="hover:text-white transition-colors">
                  Digital Farm Records
                </Link>
              </li>
              <li>
                <Link to="/farmer/shops" className="hover:text-white transition-colors">
                  Agricultural Shops & Inventory
                </Link>
              </li>
              <li>
                <Link to="/farmer/government-updates" className="hover:text-white transition-colors">
                  Government Schemes & Policies
                </Link>
              </li>
              <li>
                <Link to="/farmer/weather" className="hover:text-white transition-colors">
                  Weather Forecast & Alerts
                </Link>
              </li>
              <li>
                <Link to="/farmer/assistant" className="hover:text-white transition-colors">
                  FarmSetu AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Role Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest-300 mb-3">
              Role Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login?role=FARMER" className="hover:text-white transition-colors">
                  👨‍🌾 Farmer Portal
                </Link>
              </li>
              <li>
                <Link to="/login?role=SHOPKEEPER" className="hover:text-white transition-colors">
                  🏪 Shopkeeper Portal
                </Link>
              </li>
              <li>
                <Link to="/login?role=OFFICER" className="hover:text-white transition-colors">
                  🏛️ Government Agriculture Officer
                </Link>
              </li>
              <li>
                <Link to="/select-role" className="hover:text-white transition-colors">
                  Switch Role / Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Farmer Helpline Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest-300 mb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-400" />
              Agri Helplines
            </h4>
            <div className="p-3 rounded-xl bg-forest-900/60 border border-forest-800 space-y-1.5 text-xs">
              <p className="text-slate-200 font-semibold">Kisan Call Centre (Toll Free):</p>
              <p className="text-emerald-400 font-mono font-bold">1800-180-1551</p>
              <p className="text-[11px] text-slate-400 pt-1">
                Available 6:00 AM to 10:00 PM in all Indian regional languages.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-6 border-t border-forest-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} FarmSetu. Built with MERN Stack for Farmers, Markets & Government.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Pre-Registration & Verification Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
