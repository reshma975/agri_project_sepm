import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from './UserAvatar';
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
  LandPlot,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  Package,
  Newspaper
} from 'lucide-react';


export default function Navbar() {
  const { user, isAuthenticated, isFarmer, isShopkeeper, isOfficer, switchRole, logout } = useAuth();

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
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
          <span>👨‍🌾</span> Farmer
        </span>
      );
    }
    if (isShopkeeper) {
      return (
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
          <span>🏪</span> Shopkeeper
        </span>
      );
    }
    if (isOfficer) {
      return (
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs">
          <span>🏛️</span> Officer
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

  const isNavActive = (path) => {
    if (path === '/farmer/dashboard' || path === '/shopkeeper/dashboard' || path === '/officer/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#020506]/90 backdrop-blur-md border-b border-teal-500/15 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Branding */}
          <Link
            to={isAuthenticated ? getDashboardLink() : '/'}
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.45)] transition-all group-hover:scale-105">
              <Sprout className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl text-white tracking-tight leading-none">
                  Farm<span className="text-[#2dd4bf] text-glow-subtle">Setu</span>
                </span>
                {getRoleBadge()}
              </div>
              <span className="text-[10px] font-semibold text-slate-400 leading-tight hidden md:block">
                Digital Agriculture Ecosystem
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                    location.pathname === '/'
                      ? 'text-[#2dd4bf] bg-[#06181d] border border-teal-500/30 shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                      : 'text-slate-300 hover:text-white hover:bg-[#06181d]'
                  }`}
                >
                  Home
                </Link>
                <a
                  href="/#features"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-[#06181d] rounded-full transition-all"
                >
                  Features
                </a>
                <a
                  href="/#how-it-works"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-[#06181d] rounded-full transition-all"
                >
                  How It Works
                </a>
                <Link
                  to="/select-role"
                  className="ml-2 px-4 py-1.5 text-xs sm:text-sm font-semibold text-teal-300 bg-[#06181d] hover:bg-[#0c242c] rounded-full border border-teal-500/30 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/select-role"
                  className="px-5 py-1.5 text-xs sm:text-sm font-bold btn-glow-primary rounded-full"
                >
                  Get Started →
                </Link>
              </>
            )}

            {/* Farmer Navigation */}
            {isFarmer && (
              <>
                <Link
                  to="/farmer/dashboard"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/farmer/dashboard')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/farmer/farm-records"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/farmer/farm-records') || isNavActive('/farmer/crops')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <LandPlot className="w-3.5 h-3.5 text-teal-400" />
                  <span>Farm Records</span>
                </Link>

                <Link
                  to="/farmer/shops"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/farmer/shops')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-teal-400" />
                  <span>Shops & Stock</span>
                </Link>

                <Link
                  to="/farmer/government-updates"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/farmer/government-updates')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5 text-teal-400" />
                  <span>Agri Updates</span>
                </Link>

                <Link
                  to="/farmer/weather"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/farmer/weather')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <CloudSun className="w-3.5 h-3.5 text-teal-400" />
                  <span>Weather</span>
                </Link>

                <Link
                  to="/farmer/assistant"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/farmer/assistant')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-teal-400" />
                  <span>AI Assistant</span>
                </Link>
              </>
            )}

            {/* Shopkeeper Navigation */}
            {isShopkeeper && (
              <>
                <Link
                  to="/shopkeeper/dashboard"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/shopkeeper/dashboard')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-teal-400" />
                  <span>My Shops & Stock</span>
                </Link>
                <Link
                  to="/shopkeeper/products"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/shopkeeper/products') || isNavActive('/shopkeeper/inventory')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-teal-400" />
                  <span>Products Inventory</span>
                </Link>
                <Link
                  to="/shopkeeper/profile"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/shopkeeper/profile')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span>Shopkeeper Profile</span>
                </Link>
              </>
            )}


            {/* Officer Navigation */}
            {isOfficer && (
              <>
                <Link
                  to="/officer/dashboard"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/officer/dashboard')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Pending Verifications</span>
                </Link>
                <Link
                  to="/officer/search"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/officer/search')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-teal-400" />
                  <span>Search Farmer</span>
                </Link>
                <Link
                  to="/officer/archive"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isNavActive('/officer/archive')
                      ? 'text-teal-300 bg-[#0c2830] border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c2228]'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Verified History</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Profile Menu & Mobile Toggle */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-[#0b2127] hover:bg-[#0f2c34] border border-teal-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                    <UserAvatar user={user} showBadge={true} className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 hidden sm:inline-block max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-teal-400/80 mr-0.5" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#091b20] rounded-2xl shadow-2xl border border-teal-900/60 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-2.5 border-b border-teal-900/50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
                      <p className="text-[11px] text-slate-300 truncate"><span className="text-white font-bold">@{user?.username}</span> • <span className="font-semibold text-teal-400">{user?.role}</span></p>
                    </div>

                    <div className="py-1">
                      <Link
                        to={getProfileLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-[#0e272f] hover:text-teal-300 transition-colors"
                      >
                        <User className="w-4 h-4 text-teal-400" />
                        My Profile & Settings
                      </Link>

                      {/* Direct Seamless Portal Switch Option - ONLY if user already registered for both accounts */}
                      {isShopkeeper && user?.roles?.includes('FARMER') && (
                        <button
                          type="button"
                          onClick={async () => {
                            setDropdownOpen(false);
                            const res = await switchRole('FARMER');
                            if (res.success) {
                              navigate('/farmer/dashboard');
                            } else {
                              window.location.href = '/farmer/dashboard';
                            }
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-950/40 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">👨‍🌾</span>
                            <span>Switch to Farmer Portal</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      )}

                      {isFarmer && user?.roles?.includes('SHOPKEEPER') && (
                        <button
                          type="button"
                          onClick={async () => {
                            setDropdownOpen(false);
                            const res = await switchRole('SHOPKEEPER');
                            if (res.success) {
                              navigate('/shopkeeper/dashboard');
                            } else {
                              window.location.href = '/shopkeeper/dashboard';
                            }
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-950/40 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🏪</span>
                            <span>Switch to Shopkeeper Portal</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      )}

                      {isOfficer && (
                        <Link
                          to="/officer/archive"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-[#0e272f] hover:text-teal-300 transition-colors"
                        >
                          <FileCheck className="w-4 h-4 text-teal-400" />
                          Check Verified Records
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-teal-900/50 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
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
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-[#0c2228] lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-teal-300" /> : <Menu className="w-5 h-5 text-teal-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-teal-900/50 bg-[#08171c] px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-xl">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="block px-3 py-2 text-sm font-semibold text-slate-200 rounded-xl hover:bg-[#0c2228]">
                Home
              </Link>
              <Link to="/select-role" className="block px-3 py-2 text-sm font-semibold text-teal-300 bg-[#0c2830] rounded-xl border border-teal-500/30">
                Login / Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-400" />
                Dashboard
              </Link>

              {isFarmer && (
                <>
                  <Link
                    to="/farmer/crops"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <LandPlot className="w-4 h-4 text-teal-400" />
                    Digital Farm Records
                  </Link>
                  <Link
                    to="/farmer/crops/register"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <PlusCircle className="w-4 h-4 text-teal-400" />
                    Register New Land & Crop
                  </Link>
                  <Link
                    to="/farmer/shops"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <Store className="w-4 h-4 text-teal-400" />
                    Agricultural Shops & Stock
                  </Link>
                  <Link
                    to="/farmer/government-updates"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <Newspaper className="w-4 h-4 text-teal-400" />
                    Agricultural Updates
                  </Link>
                  <Link
                    to="/farmer/weather"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <CloudSun className="w-4 h-4 text-teal-400" />
                    Weather Forecast
                  </Link>
                  <Link
                    to="/farmer/assistant"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <Bot className="w-4 h-4 text-teal-400" />
                    Voice & AI Assistant
                  </Link>
                </>
              )}

              {isShopkeeper && (
                <>
                  <Link
                    to="/shopkeeper/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <Store className="w-4 h-4 text-teal-400" />
                    My Shops & Stock
                  </Link>
                  <Link
                    to="/shopkeeper/products"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <Package className="w-4 h-4 text-teal-400" />
                    Products Inventory
                  </Link>
                  <Link
                    to="/shopkeeper/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <User className="w-4 h-4 text-teal-400" />
                    Shopkeeper Profile
                  </Link>
                </>
              )}


              {isOfficer && (
                <>
                  <Link
                    to="/officer/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <FileCheck className="w-4 h-4 text-teal-400" />
                    Pending Verifications
                  </Link>
                  <Link
                    to="/officer/search"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <Search className="w-4 h-4 text-teal-400" />
                    Search Farmer Records
                  </Link>
                  <Link
                    to="/officer/archive"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                  >
                    <FileCheck className="w-4 h-4 text-teal-400" />
                    Verified History
                  </Link>
                </>
              )}

              <div className="pt-2 border-t border-teal-900/50 space-y-1">
                <Link
                  to={getProfileLink()}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 rounded-xl hover:bg-[#0c2228]"
                >
                  <User className="w-4 h-4 text-teal-400" />
                  My Profile
                </Link>

                {isShopkeeper && user?.roles?.includes('FARMER') && (
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      const res = await switchRole('FARMER');
                      if (res.success) navigate('/farmer/dashboard');
                      else window.location.href = '/farmer/dashboard';
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-emerald-300 rounded-xl hover:bg-emerald-950/40 text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>👨‍🌾</span> Switch to Farmer Portal
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                )}

                {isFarmer && user?.roles?.includes('SHOPKEEPER') && (
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      const res = await switchRole('SHOPKEEPER');
                      if (res.success) navigate('/shopkeeper/dashboard');
                      else window.location.href = '/shopkeeper/dashboard';
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-amber-300 rounded-xl hover:bg-amber-950/40 text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>🏪</span> Switch to Shopkeeper Portal
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-400 rounded-xl hover:bg-rose-950/40 text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
