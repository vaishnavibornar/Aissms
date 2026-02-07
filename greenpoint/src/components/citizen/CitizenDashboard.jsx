import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { getRegionDisplayName } from '../../utils/regionDisplay';
import './CitizenDashboard.css';

export default function CitizenDashboard() {
  const { currentUser, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [userStats, setUserStats] = useState({ points: 0, complaintsRaised: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    // Fetch user stats
    const fetchUserStats = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserStats({
          points: userDoc.data().points || 0,
          complaintsRaised: userDoc.data().complaintsRaised || 0
        });
      }
    };

    fetchUserStats();

    // Real-time listener for user's complaints
    const q = query(
      collection(db, 'complaints'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintsData = [];
      snapshot.forEach((doc) => {
        complaintsData.push({ id: doc.id, ...doc.data() });
      });
      setComplaints(complaintsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#3b82f6',
      assigned: '#8b5cf6',
      resolved: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityLabel = (upvotes) => {
    if (upvotes >= 50) return 'Critical';
    if (upvotes >= 20) return 'High';
    if (upvotes >= 10) return 'Medium';
    return 'Low';
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>🌱 GreenPoints</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/citizen/dashboard')} className="nav-link active">
            Dashboard
          </button>
          <button onClick={() => navigate('/citizen/feed')} className="nav-link">
            Community Feed
          </button>
          <button onClick={() => navigate('/citizen/raise-complaint')} className="nav-link">
            Raise Complaint
          </button>
          <button onClick={() => navigate('/citizen/profile')} className="nav-link">
            Profile
          </button>
          <button onClick={() => navigate('/citizen/emergency')} className="nav-link">
            Emergency
          </button>
          <button onClick={handleLogout} className="nav-link logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Citizen Dashboard</h1>
          <p>Welcome back! Track your contributions and community impact.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>{userStats.points}</h3>
              <p>Total Points</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{userStats.complaintsRaised}</h3>
              <p>Complaints Raised</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{complaints.filter(c => c.status === 'resolved').length}</h3>
              <p>Resolved</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{complaints.filter(c => c.status === 'pending').length}</h3>
              <p>Pending</p>
            </div>
          </div>
        </div>

        <div className="complaints-section">
          <h2>My Complaints</h2>
          
          {loading ? (
            <div className="loading">Loading your complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="empty-state">
              <p>You haven't raised any complaints yet.</p>
              <button 
                onClick={() => navigate('/citizen/raise-complaint')}
                className="primary-button"
              >
                Raise Your First Complaint
              </button>
            </div>
          ) : (
            <div className="complaints-list">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="complaint-card">
                  <div className="complaint-header">
                    <h3>{complaint.title}</h3>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(complaint.status) }}
                    >
                      {complaint.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="complaint-description">{complaint.description}</p>
                  <div className="complaint-meta">
                    <span>📍 {getRegionDisplayName(complaint.region)}</span>
                    <span>👍 {complaint.upvotes || 0} upvotes</span>
                    <span className="priority-badge">
                      Priority: {getPriorityLabel(complaint.upvotes || 0)}
                    </span>
                  </div>
                  {complaint.imageUrl && (
                    <img 
                      src={complaint.imageUrl} 
                      alt="Complaint" 
                      className="complaint-image"
                    />
                  )}
                  <div className="complaint-footer">
                    <small>Created: {new Date(complaint.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}