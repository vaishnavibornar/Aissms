import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/layout/LandingPage';
import Auth from './components/auth/Auth';
import RaiseComplaint from './components/citizen/RaiseComplaint';
import CommunityFeed from './components/citizen/CommunityFeed';
import CitizenDashboard from './components/citizen/CitizenDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

// Simple Layout wrapper to hide Navbar on Landing/Auth pages
const Layout = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  
  // Don't show navbar if not logged in
  if (!currentUser) return children;

  return (
    <>
      <nav className="navbar">
        <div className="logo">GreenPoints</div>
        <div className="nav-links">
          {userRole === 'citizen' && (
            <>
              <a href="/dashboard">Feed</a>
              <a href="/raise">Report</a>
              <a href="/profile">Profile</a>
            </>
          )}
          <button onClick={() => window.location.reload()}>Logout</button>
        </div>
      </nav>
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />
          
          {/* 👇 THIS IS THE MISSING LINE CAUSING THE BLANK PAGE 👇 */}
          <Route path="/signup" element={<Auth />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="citizen">
              <Layout><CommunityFeed /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/raise" element={
            <ProtectedRoute requiredRole="citizen">
              <Layout><RaiseComplaint /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute requiredRole="citizen">
              <Layout><CitizenDashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;