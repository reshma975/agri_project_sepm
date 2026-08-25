import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import VoiceAssistantWidget from './components/common/VoiceAssistantWidget';
import LoadingSpinner from './components/common/LoadingSpinner';
import { Bot } from 'lucide-react';

// Public Pages
import LandingPage from './pages/LandingPage';
import RoleSelectPage from './pages/RoleSelectPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import DigitalFarmRecordsPage from './pages/farmer/DigitalFarmRecordsPage';
import RegisterCropPage from './pages/farmer/RegisterCropPage';
import ShopDiscoveryPage from './pages/farmer/ShopDiscoveryPage';
import ShopDetailsPage from './pages/farmer/ShopDetailsPage';
import WeatherPage from './pages/farmer/WeatherPage';
import GovtUpdatesPage from './pages/farmer/GovtUpdatesPage';
import AssistantPage from './pages/farmer/AssistantPage';
import FarmerProfilePage from './pages/farmer/FarmerProfilePage';

// Shopkeeper Pages
import ShopkeeperDashboard from './pages/shopkeeper/ShopkeeperDashboard';
import ShopkeeperShopDetailsPage from './pages/shopkeeper/ShopDetailsPage';
import ShopkeeperProfilePage from './pages/shopkeeper/ShopkeeperProfilePage';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import CropReviewPage from './pages/officer/CropReviewPage';
import OfficerSearchPage from './pages/officer/OfficerSearchPage';
import VerifiedArchivePage from './pages/officer/VerifiedArchivePage';
import OfficerProfilePage from './pages/officer/OfficerProfilePage';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." fullScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/select-role" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    if (user.role === 'FARMER') return <Navigate to="/farmer/dashboard" replace />;
    if (user.role === 'SHOPKEEPER') return <Navigate to="/shopkeeper/dashboard" replace />;
    if (user.role === 'OFFICER') return <Navigate to="/officer/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const [floatingAssistantOpen, setFloatingAssistantOpen] = useState(false);

  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-100 selection:bg-teal-500 selection:text-black">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/select-role" element={<RoleSelectPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Farmer Protected Routes */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/crops"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <DigitalFarmRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/farm-records"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <DigitalFarmRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/crops/register"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <RegisterCropPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/shops"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <ShopDiscoveryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/shops/:id"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <ShopDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/weather"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <WeatherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/government-updates"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <GovtUpdatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/assistant"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <AssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/profile"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <FarmerProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Shopkeeper Protected Routes */}
          <Route
            path="/shopkeeper/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                <ShopkeeperDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopkeeper/shops/:id"
            element={
              <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                <ShopkeeperShopDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopkeeper/profile"
            element={
              <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                <ShopkeeperProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Officer Protected Routes */}
          <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['OFFICER']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/crops/:id"
            element={
              <ProtectedRoute allowedRoles={['OFFICER']}>
                <CropReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/search"
            element={
              <ProtectedRoute allowedRoles={['OFFICER']}>
                <OfficerSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/archive"
            element={
              <ProtectedRoute allowedRoles={['OFFICER']}>
                <VerifiedArchivePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/profile"
            element={
              <ProtectedRoute allowedRoles={['OFFICER']}>
                <OfficerProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer & Floating AI Voice Assistant ONLY on Landing Page */}
      {isLandingPage && (
        <>
          <Footer />

          <button
            onClick={() => setFloatingAssistantOpen(true)}
            className="fixed bottom-6 right-6 z-40 p-3.5 sm:p-4 bg-forest-600 hover:bg-forest-700 text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 border-2 border-white ring-4 ring-forest-100"
            title="Ask FarmSetu AI Assistant"
          >
            <Bot className="w-6 h-6 animate-pulse-subtle" />
            <span className="text-xs font-extrabold hidden sm:inline-block pr-1">
              Ask AI Assistant
            </span>
          </button>

          <VoiceAssistantWidget
            isOpen={floatingAssistantOpen}
            onClose={() => setFloatingAssistantOpen(false)}
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
