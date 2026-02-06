import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Components
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Auth from './components/auth/Auth';

// Citizen Components
import CitizenDashboard from './components/citizen/CitizenDashboard';
import RaiseComplaint from './components/citizen/RaiseComplaint';
import CommunityFeed from './components/citizen/CommunityFeed';
import CitizenProfile from './components/citizen/CitizenProfile';
import Emergency from './components/citizen/Emergency';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ManageComplaints from './components/admin/ManageComplaints';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          
          {/* Citizen Routes */}
          <Route 
            path="/citizen/dashboard" 
            element={
              <ProtectedRoute allowedRole="citizen">
                <CitizenDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/raise-complaint" 
            element={
              <ProtectedRoute allowedRole="citizen">
                <RaiseComplaint />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/feed" 
            element={
              <ProtectedRoute allowedRole="citizen">
                <CommunityFeed />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/profile" 
            element={
              <ProtectedRoute allowedRole="citizen">
                <CitizenProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/emergency" 
            element={
              <ProtectedRoute allowedRole="citizen">
                <Emergency />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/complaints" 
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageComplaints />
              </ProtectedRoute>
            } 
          />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
