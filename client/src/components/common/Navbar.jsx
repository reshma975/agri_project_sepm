import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  Store,
  Building2,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  FileCheck,
  CloudSun,
  Bot,
  Search,
  PlusCircle,
  LandPlot
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isFarmer, isShopkeeper, isOfficer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/select-role');
  };

  const getRoleBadge = () => {
    if (isFarmer) {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          👨‍🌾 Farmer
        </span>
      );
    }
    if (isShopkeeper) {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          🏪 Shopkeeper
        </span>
      );
    }
    if (isOfficer) {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          🏛️ Officer
        </span>
      );
    }
    return null;
  };

  const getProfileLink = () => {
    if (isFarmer) return '/farmer/profile';
    if (isShopkeeper) return '/shopkeeper/profile';
    if (isOfficer) return '/officer/profile';
    return '/';
  };

  const getDashboardLink = () => {
    if (isFarmer) return '/farmer/dashboard';
    if (isShopkeeper) return '/shopkeeper/dashboard';
    if (isOfficer) return '/officer/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link to={isAuthenticated ? getDashboardLink() : '/'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-forest-600 group-hover:bg-forest-700 flex items-center justify-center text-white shadow-md shadow-forest-200 transition-all">
              <Sprout className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-forest-900 tracking-tight">
                  FarmSetu <span className="text-forest-600">🌾</span>
                </span>
                {getRoleBadge()}
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Connecting Farmers, Markets & Government
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    location.pathname === '/' ? 'text-forest-700 bg-forest-50' : 'text-slate-600 hover:text-forest-700 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <a
                  href="/#features"
                  className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-forest-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Features
                </a>
                <a
                  href="/#how-it-works"
                  className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-forest-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  How It Works
                </a>
                <Link
                  to="/select-role"
                  className="ml-2 px-4 py-2 text-sm font-semibold text-forest-700 bg-forest-50 hover:bg-forest-100 rounded-xl border border-forest-200 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/select-role"
                  className="px-4 py-2 text-sm font-semibold text-white bg-forest-600 hover:bg-forest-700 rounded-xl shadow-md shadow-forest-200 transition-all"
                >
                  Get Started →
                </Link>
              </>
            )}

            {/* Farmer Nav */}
            {isFarmer && (
              <>
                <Link
                  to="/farmer/dashboard"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    location.pathname === '/farmer/dashboard' ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/farmer/crops"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/farmer/crops') ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LandPlot className="w-4 h-4" />
                  Farm Records
                </Link>
                <Link
                  to="/farmer/shops"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/farmer/shops') ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Shops & Stock
                </Link>
                <Link
                  to="/farmer/government-updates"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/farmer/government-updates' ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Govt Schemes
                </Link>
                <Link
                  to="/farmer/weather"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/farmer/weather' ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CloudSun className="w-4 h-4" />
                  Weather
                </Link>
                <Link
                  to="/farmer/assistant"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/farmer/assistant' ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  AI Assistant
                </Link>
              </>
            )}

            {/* Shopkeeper Nav */}
            {isShopkeeper && (
              <>
                <Link
                  to="/shopkeeper/dashboard"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/shopkeeper/dashboard' ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  My Shops
                </Link>
                <Link
                  to="/shopkeeper/profile"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    location.pathname === '/shopkeeper/profile' ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Shopkeeper Profile
                </Link>
              </>
            )}

            {/* Officer Nav */}
            {isOfficer && (
              <>
                <Link
                  to="/officer/dashboard"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/officer/dashboard' ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  Pending Verifications
                </Link>
                <Link
                  to="/officer/search"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/officer/search' ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Search Farmer
                </Link>
                <Link
                  to="/officer/archive"
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/officer/archive' ? 'text-forest-800 bg-forest-100 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Check Verified
                </Link>
              </>
            )}
          </nav>

          {/* User Profile Dropdown (Matches Wireframes 1, 3, 5) */}
          {isAuthenticated && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-forest-300"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-forest-100 border border-forest-300 flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-forest-700" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-700 hidden sm:inline-block max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Wireframe Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-slide-up">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to={getProfileLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profile
                    </Link>

                    {isOfficer && (
                      <Link
                        to="/officer/archive"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                      >
                        <FileCheck className="w-4 h-4 text-slate-400" />
                        Check Verified
                      </Link>
                    )}

                    <div className="px-4 py-1.5 text-[11px] text-slate-400 italic">
                      FarmSetu v1.0 • Verified Access
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 animate-fade-in shadow-lg">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                Home
              </Link>
              <Link to="/select-role" className="block px-3 py-2 text-base font-semibold text-forest-700 bg-forest-50 rounded-xl">
                Login / Register
              </Link>
            </>
          ) : (
            <>
              <Link to={getDashboardLink()} className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                Dashboard
              </Link>
              {isFarmer && (
                <>
                  <Link to="/farmer/crops" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                    🌾 Digital Farm Records
                  </Link>
                  <Link to="/farmer/crops/register" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                    ✍️ Register New Crop
                  </Link>
                  <Link to="/farmer/shops" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                    🏪 Agricultural Shops
                  </Link>
                  <Link to="/farmer/government-updates" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                    🏛️ Government Updates
                  </Link>
                  <Link to="/farmer/weather" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                    🌦️ Weather Forecast
                  </Link>
                  <Link to="/farmer/assistant" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                    🤖 Voice & AI Assistant
                  </Link>
                </>
              )}
              {isShopkeeper && (
                <>
                  <Link to="/shopkeeper/dashboard" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                    🏪 My Shops
                  </Link>
                </>
              )}
              {isOfficer && (
                <>
                  <Link to="/officer/dashboard" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                    📋 Pending Verifications
                  </Link>
                  <Link to="/officer/search" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                    🔍 Search Farmer
                  </Link>
                  <Link to="/officer/archive" className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                    ✅ Check Verified
                  </Link>
                </>
              )}
              <Link to={getProfileLink()} className="block px-3 py-2 text-base font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                👤 My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-base font-semibold text-rose-600 rounded-xl hover:bg-rose-50"
              >
                🚪 Log Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
