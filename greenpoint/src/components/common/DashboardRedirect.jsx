import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardRedirect() {
  const { currentUser, userRole, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    if (profileLoading) return;
    if (userRole === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/citizen/dashboard', { replace: true });
    }
  }, [currentUser, userRole, profileLoading, navigate]);

  if (!currentUser) return null;
  if (profileLoading) {
    return (
      <div className="dashboard-redirect-spinner">
        <div style={{ textAlign: 'center' }}>
          <div className="dashboard-redirect-spinner-icon" />
          <p style={{ color: '#666', margin: 0 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  return null;
}
