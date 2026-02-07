import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, userRole, profileLoading } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (profileLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={userRole === 'citizen' ? '/citizen/dashboard' : '/admin/dashboard'} replace />;
  }

  return children;
}
