import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Compass,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Heart,
  FileSpreadsheet,
  Inbox,
  ShieldCheck,
  PlusCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const { user, logout, canAccessBuyer, canAccessSeller, canAccessAdmin } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="glass-header sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Slogan */}
            <div className="flex items-center space-x-3">
              <Link to="/" onClick={closeMobile} className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 text-white rounded-xl flex items-center justify-center font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform">
                  P
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-slate-900 dark:text-white tracking-tight text-lg leading-tight flex items-center gap-1">
                    PRABRIX <span className="text-teal-600 dark:text-teal-400">AI</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Tamil Nadu Land Intelligence
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/buy"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/buy')
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100/60 dark:hover:bg-navy-800'
                }`}
              >
                Buy Land
              </Link>

              <Link
                to="/analysis"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
                  isActive('/analysis')
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100/60 dark:hover:bg-navy-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                <span>Intelligence</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/saved"
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/saved')
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-slate-100/60 dark:hover:bg-navy-800'
                    }`}
                  >
                    Saved
                  </Link>

                  {/* Role-based portal links */}
                  {canAccessBuyer() && (
                    <>
                      <Link
                        to="/buyer"
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          isActive('/buyer')
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                            : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:bg-slate-100/60 dark:hover:bg-navy-800'
                        }`}
                      >
                        Buyer
                      </Link>
                      <Link
                        to="/buyer/requirements"
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          isActive('/buyer/requirements')
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                            : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:bg-slate-100/60 dark:hover:bg-navy-800'
                        }`}
                      >
                        Requirements
                      </Link>
                      <Link
                        to="/buyer/offers"
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          isActive('/buyer/offers')
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                            : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:bg-slate-100/60 dark:hover:bg-navy-800'
                        }`}
                      >
                        Offers
                      </Link>
                    </>
                  )}

                  {canAccessSeller() && (
                    <>
                      <Link
                        to="/seller"
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          isActive('/seller')
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                            : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:bg-slate-100/60 dark:hover:bg-navy-800'
                        }`}
                      >
                        Seller
                      </Link>
                      <Link
                        to="/seller/inbox"
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          isActive('/seller/inbox')
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                            : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:bg-slate-100/60 dark:hover:bg-navy-800'
                        }`}
                      >
                        Inbox
                      </Link>
                      <Link
                        to="/sell"
                        className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 rounded-lg transition-all shadow-sm hover:shadow"
                      >
                        Sell Land
                      </Link>
                    </>
                  )}

                  {canAccessAdmin() && (
                    <Link
                      to="/admin"
                      className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Admin
                    </Link>
                  )}

                  <Link
                    to="/map-demo"
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1.5"
                  >
                    Map Demo
                  </Link>
                </>
              ) : null}
            </div>

            {/* Right Action Icons (Theme toggle, Notifications, Auth) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Light / Dark Mode Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {user ? (
                <>
                  {/* Notification Bell */}
                  <NotificationBell />

                  {/* Profile Link */}
                  <Link
                    to="/profile"
                    className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600 transition-all bg-white/50 dark:bg-navy-900/50"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[120px]">{user.full_name || 'Profile'}</span>
                  </Link>

                  {/* Sign Out */}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 p-2 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-bold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-slate-200/80 dark:border-navy-800 bg-white/95 dark:bg-navy-950/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2 overflow-hidden shadow-xl"
            >
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100 dark:border-navy-800">
                <Link
                  to="/buy"
                  onClick={closeMobile}
                  className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  <Search className="w-4 h-4 text-teal-500" />
                  <span>Buy Land</span>
                </Link>
                <Link
                  to="/analysis"
                  onClick={closeMobile}
                  className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span>Intelligence</span>
                </Link>
              </div>

              {user ? (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
                    My Account ({user.role})
                  </div>

                  <Link
                    to="/saved"
                    onClick={closeMobile}
                    className="flex items-center space-x-2.5 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Saved Properties</span>
                  </Link>

                  {canAccessBuyer() && (
                    <>
                      <Link
                        to="/buyer"
                        onClick={closeMobile}
                        className="flex items-center space-x-2.5 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900"
                      >
                        <Compass className="w-4 h-4 text-teal-500" />
                        <span>Buyer Dashboard</span>
                      </Link>
                      <Link
                        to="/buyer/requirements"
                        onClick={closeMobile}
                        className="flex items-center space-x-2.5 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-teal-500" />
                        <span>My Requirements</span>
                      </Link>
                      <Link
                        to="/buyer/offers"
                        onClick={closeMobile}
                        className="flex items-center space-x-2.5 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900"
                      >
                        <ShieldCheck className="w-4 h-4 text-teal-500" />
                        <span>Formal Offers</span>
                      </Link>
                    </>
                  )}

                  {canAccessSeller() && (
                    <>
                      <Link
                        to="/seller"
                        onClick={closeMobile}
                        className="flex items-center space-x-2.5 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900"
                      >
                        <Compass className="w-4 h-4 text-emerald-500" />
                        <span>Seller Dashboard</span>
                      </Link>
                      <Link
                        to="/seller/inbox"
                        onClick={closeMobile}
                        className="flex items-center space-x-2.5 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900"
                      >
                        <Inbox className="w-4 h-4 text-emerald-500" />
                        <span>Inquiry Inbox</span>
                      </Link>
                      <Link
                        to="/sell"
                        onClick={closeMobile}
                        className="flex items-center space-x-2.5 p-2 rounded-lg text-xs font-bold text-white bg-teal-600 rounded-xl"
                      >
                        <PlusCircle className="w-4 h-4 text-white" />
                        <span>Sell Land (6-Step Wizard)</span>
                      </Link>
                    </>
                  )}

                  {canAccessAdmin() && (
                    <Link
                      to="/admin"
                      onClick={closeMobile}
                      className="flex items-center space-x-2.5 p-2 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin Governance Console</span>
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={closeMobile}
                    className="flex items-center space-x-2.5 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>User Profile Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 p-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 flex flex-col space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 text-xs font-semibold text-slate-800 dark:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="w-full text-center py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Bottom Quick Navigation Bar (Viewport < 768px, with safe-area padding for Android gesture bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-navy-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-navy-800 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="flex items-center justify-around text-[10px] font-semibold text-slate-600 dark:text-slate-400">
          <Link
            to="/buy"
            className={`flex flex-col items-center p-1 rounded-lg transition-colors ${
              isActive('/buy') ? 'text-teal-600 dark:text-teal-400' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span>Market</span>
          </Link>

          <Link
            to="/analysis"
            className={`flex flex-col items-center p-1 rounded-lg transition-colors ${
              isActive('/analysis') ? 'text-teal-600 dark:text-teal-400' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span>AI Score</span>
          </Link>

          <Link
            to="/sell"
            className="flex flex-col items-center p-1 -mt-3 text-white"
          >
            <div className="w-10 h-10 rounded-full bg-teal-600 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] text-slate-700 dark:text-slate-300 mt-0.5 font-bold">Sell</span>
          </Link>

          <Link
            to="/saved"
            className={`flex flex-col items-center p-1 rounded-lg transition-colors ${
              isActive('/saved') ? 'text-rose-600 dark:text-rose-400' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-5 h-5 mb-0.5" />
            <span>Saved</span>
          </Link>

          <Link
            to={user ? (user.role === 'seller' ? '/seller' : user.role === 'admin' ? '/admin' : '/buyer') : '/login'}
            className={`flex flex-col items-center p-1 rounded-lg transition-colors ${
              isActive('/buyer') || isActive('/seller') || isActive('/admin')
                ? 'text-teal-600 dark:text-teal-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span>{user ? 'Desk' : 'Login'}</span>
          </Link>
        </div>
      </div>
    </>
  );
};
