import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { OtpVerificationPage } from './components/auth/OtpVerificationPage';
import { LoginPage } from './components/auth/LoginPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { EmailVerificationNotice } from './components/auth/EmailVerificationNotice';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProfilePage } from './components/profile/ProfilePage';
import { BuyerDashboard } from './components/dashboard/BuyerDashboard';
import { SellerDashboard } from './components/dashboard/SellerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { MapDemoPage } from './components/map/MapDemoPage';
import { ListingWizard } from './components/seller/wizard/ListingWizard';
import { PropertySearchPage } from './components/buyer/PropertySearchPage';
import { PropertyDetailPage } from './components/buyer/PropertyDetailPage';
import { SavedPropertiesPage } from './components/buyer/SavedPropertiesPage';
import { PropertyComparePage } from './components/buyer/PropertyComparePage';
import { BuyerRequirementsPage } from './components/buyer/BuyerRequirementsPage';
import { BuyerOffersPage } from './components/buyer/BuyerOffersPage';
import { SellerInboxPage } from './components/seller/SellerInboxPage';
import { AnalysisReportPage } from './components/analysis/AnalysisReportPage';
import { NotFoundPage } from './components/common/NotFoundPage';
import { OfflineNotice } from './components/common/OfflineNotice';
import { initMobileFeatures } from './mobile/mobilePlatform';
import { useToast } from './context/ToastContext';

// Native Mobile Lifecycle & Offline Handler
const MobileAppSetup = () => {
  const navigate = useNavigate();
  const toast = useToast();

  React.useEffect(() => {
    initMobileFeatures(
      (path) => {
        if (typeof path === 'number') {
          navigate(path);
        } else if (typeof path === 'string') {
          navigate(path);
        }
      },
      (msg, type) => {
        if (type === 'info') toast.info(msg);
        else if (type === 'error') toast.error(msg);
        else toast.success(msg);
      }
    );
  }, [navigate, toast]);

  return <OfflineNotice />;
};

// Animated Route Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-w-0 w-full max-w-full"
      >
        <Routes location={location}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/email-verify-notice" element={<EmailVerificationNotice />} />

          {/* OTP Screen */}
          <Route path="/verify-otp" element={<OtpVerificationPage />} />

          {/* Map Demo Showcase */}
          <Route path="/map-demo" element={<MapDemoPage />} />

          {/* Buyer Discovery & Marketplace Routes */}
          <Route path="/buy" element={<PropertySearchPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
          <Route path="/analysis/:id" element={<AnalysisReportPage />} />
          <Route path="/analysis" element={<AnalysisReportPage />} />
          <Route path="/compare" element={<PropertyComparePage />} />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedPropertiesPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes with Role Guards */}
          <Route
            path="/buyer"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/requirements"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerRequirementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/offers"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerOffersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/inbox"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerInboxPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <ListingWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <MobileAppSetup />
              <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden w-full max-w-full">
                <Navbar />
                <main className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
                  <AnimatedRoutes />
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
