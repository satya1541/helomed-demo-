import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AnimationProvider } from './context/AnimationContext';
import FlyToCartLayer from './components/FlyToCartLayer';
import { ToastProvider } from './components/Toast';
import Home from './pages/Home';
import CategoriesPage from './pages/CategoriesPage';
import DummyLoginPage from './pages/DummyLoginPage';
import DummySignupPage from './pages/DummySignupPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import MedicinesPage from './pages/MedicinesPage';
import OrdersPage from './pages/OrdersPage';
import AboutPage from './pages/AboutPage';
import OffersPage from './pages/OffersPage';
import NeedHelpPage from './pages/NeedHelpPage';
import WishlistPage from './pages/WishlistPage';
import RefundPolicy from './pages/RefundPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ShippingPolicy from './pages/ShippingPolicy';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import OurStoryPage from './pages/OurStoryPage';
import CareersPage from './pages/CareersPage';
import AbhaLandingPage from './pages/AbhaLandingPage';
import AbhaSignupPage from './pages/AbhaSignupPage';
import AbhaLoginPage from './pages/AbhaLoginPage';
import './App.css'

import React from 'react';
import ScrollToTop from './components/ScrollToTop';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <img src="/images/logo.png" alt="Helo Med" style={{ height: '60px' }} />
        <div style={{ fontSize: '1.2rem', color: '#666', fontWeight: 500 }}>Authenticating...</div>
      </div>
    );
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SocketProvider>
          <AnimationProvider>
            <CartProvider>
            <FlyToCartLayer />
            <Router>
              <ScrollToTop />
              <Routes>
                <Route path="/login" element={<DummyLoginPage />} />
                <Route path="/signup" element={<DummySignupPage />} />


                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/medicines" element={<ProtectedRoute><MedicinesPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
                <Route path="/offers" element={<ProtectedRoute><OffersPage /></ProtectedRoute>} />
                <Route path="/need-help" element={<ProtectedRoute><NeedHelpPage /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                <Route path="/our-story" element={<ProtectedRoute><OurStoryPage /></ProtectedRoute>} />
                <Route path="/careers" element={<ProtectedRoute><CareersPage /></ProtectedRoute>} />
                <Route path="/product/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
                
                {/* ABHA Routes */}
                <Route path="/abha" element={<ProtectedRoute><AbhaLandingPage /></ProtectedRoute>} />
                <Route path="/abha/signup" element={<ProtectedRoute><AbhaSignupPage /></ProtectedRoute>} />
                <Route path="/abha/login" element={<ProtectedRoute><AbhaLoginPage /></ProtectedRoute>} />

                <Route path="/refund-policy" element={<ProtectedRoute><RefundPolicy /></ProtectedRoute>} />
                <Route path="/privacy-policy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
                <Route path="/terms-of-service" element={<ProtectedRoute><TermsOfService /></ProtectedRoute>} />
                <Route path="/shipping-policy" element={<ProtectedRoute><ShippingPolicy /></ProtectedRoute>} />
              </Routes>
            </Router>
          </CartProvider>
        </AnimationProvider>
        </SocketProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
