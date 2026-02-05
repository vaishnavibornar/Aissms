import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import RaiseComplaint from './components/citizen/RaiseComplaint';
import CommunityFeed from './components/citizen/CommunityFeed';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

// Component to protect routes based on auth and role
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} />;
  }

  return children;
};

// Simple Layout wrapper for Navigation
const Layout = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  return (
    <>
      <nav className="navbar">
        <div className="logo">GreenPoints</div>
        <div className="nav-links">
          {userRole === 'citizen' && (
            <>
              <a href="/dashboard">Feed</a>
              <a href="/raise">Report</a>
            </>
          )}
          {currentUser && <button onClick={() => auth.signOut()}>Logout</button>}
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
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
          
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;