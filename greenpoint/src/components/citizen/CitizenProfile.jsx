import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import './CitizenProfile.css';

export default function CitizenProfile() {
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData({ id: userDoc.id, ...userDoc.data() });
        }

        // Fetch user's complaints
        const complaintsQuery = query(
          collection(db, 'complaints'),
          where('userId', '==', currentUser.uid)
        );
        const complaintsSnapshot = await getDocs(complaintsQuery);
        const complaintsData = [];
        complaintsSnapshot.forEach((doc) => {
          complaintsData.push({ id: doc.id, ...doc.data() });
        });
        setComplaints(complaintsData);

        // Fetch leaderboard (top 10 users)
        const leaderboardQuery = query(
          collection(db, 'users'),
          where('role', '==', 'citizen'),
          orderBy('points', 'desc'),
          limit(10)
        );
        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        const leaderboardData = [];
        leaderboardSnapshot.forEach((doc) => {
          leaderboardData.push({ id: doc.id, ...doc.data() });
        });
        setLeaderboard(leaderboardData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setLoading(false);
      }
    };

    fetchData();
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>🌱 GreenPoints</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/citizen/dashboard')} className="nav-link">
            Dashboard
          </button>
          <button onClick={() => navigate('/citizen/feed')} className="nav-link">
            Community Feed
          </button>
          <button onClick={() => navigate('/citizen/raise-complaint')} className="nav-link">
            Raise Complaint
          </button>
          <button onClick={() => navigate('/citizen/profile')} className="nav-link active">
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
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              {userData?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h1>{userData?.username || 'User'}</h1>
              <p>{userData?.email || ''}</p>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-value">{userData?.points || 0}</span>
                  <span className="stat-label">Points</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-value">{userData?.complaintsRaised || 0}</span>
                  <span className="stat-label">Complaints</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-value">
                    {complaints.filter(c => c.status === 'resolved').length}
                  </span>
                  <span className="stat-label">Resolved</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-sections">
            <div className="profile-section">
              <h2>My Complaints History</h2>
              {complaints.length === 0 ? (
                <p className="empty-message">No complaints raised yet.</p>
              ) : (
                <div className="complaints-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Upvotes</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td>{complaint.title}</td>
                          <td>
                            <span 
                              className="status-badge-small"
                              style={{ backgroundColor: getStatusColor(complaint.status) }}
                            >
                              {complaint.status}
                            </span>
                          </td>
                          <td>{complaint.upvotes || 0}</td>
                          <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="profile-section">
              <h2>Community Leaderboard</h2>
              <div className="leaderboard">
                {leaderboard.map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`leaderboard-item ${user.id === currentUser.uid ? 'current-user' : ''}`}
                  >
                    <div className="leaderboard-rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <div className="leaderboard-info">
                      <span className="leaderboard-name">{user.username}</span>
                      <span className="leaderboard-stats">
                        {user.points} points · {user.complaintsRaised} complaints
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
