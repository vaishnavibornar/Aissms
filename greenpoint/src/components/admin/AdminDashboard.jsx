import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    assigned: 0,
    resolved: 0,
    highPriority: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time listener for all complaints
    const q = query(collection(db, 'complaints'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintsData = [];
      let pendingCount = 0;
      let approvedCount = 0;
      let assignedCount = 0;
      let resolvedCount = 0;
      let highPriorityCount = 0;

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        complaintsData.push(data);

        // Count by status
        if (data.status === 'pending') pendingCount++;
        else if (data.status === 'approved') approvedCount++;
        else if (data.status === 'assigned') assignedCount++;
        else if (data.status === 'resolved') resolvedCount++;

        // Count high priority (upvotes >= 20)
        if (data.upvotes >= 20) highPriorityCount++;
      });

      setComplaints(complaintsData);
      setStats({
        total: complaintsData.length,
        pending: pendingCount,
        approved: approvedCount,
        assigned: assignedCount,
        resolved: resolvedCount,
        highPriority: highPriorityCount
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Group complaints by department/region for quick overview
  const getDepartmentStats = () => {
    const departments = {};
    complaints.forEach(complaint => {
      const region = complaint.region || 'Unknown';
      if (!departments[region]) {
        departments[region] = { total: 0, pending: 0, resolved: 0 };
      }
      departments[region].total++;
      if (complaint.status === 'pending') departments[region].pending++;
      if (complaint.status === 'resolved') departments[region].resolved++;
    });
    return Object.entries(departments).slice(0, 5); // Top 5 regions
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav admin-nav">
        <div className="nav-brand">
          <h2>🌱 GreenPoints Admin</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/admin/dashboard')} className="nav-link active">
            Dashboard
          </button>
          <button onClick={() => navigate('/admin/complaints')} className="nav-link">
            Manage Complaints
          </button>
          <button onClick={handleLogout} className="nav-link logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Administrator Dashboard</h1>
          <p>Monitor and manage environmental complaints across all regions</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card admin-stat">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Complaints</p>
            </div>
          </div>
          <div className="stat-card admin-stat">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          <div className="stat-card admin-stat">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.approved}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card admin-stat">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{stats.assigned}</h3>
              <p>Assigned</p>
            </div>
          </div>
          <div className="stat-card admin-stat">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>{stats.resolved}</h3>
              <p>Resolved</p>
            </div>
          </div>
          <div className="stat-card admin-stat priority-stat">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <h3>{stats.highPriority}</h3>
              <p>High Priority</p>
            </div>
          </div>
        </div>

        <div className="admin-sections">
          <div className="admin-section">
            <h2>Region-wise Overview</h2>
            {getDepartmentStats().length === 0 ? (
              <p className="empty-message">No complaints yet.</p>
            ) : (
              <div className="department-stats">
                {getDepartmentStats().map(([region, data]) => (
                  <div key={region} className="department-card">
                    <h3>{region}</h3>
                    <div className="department-info">
                      <span>Total: {data.total}</span>
                      <span>Pending: {data.pending}</span>
                      <span>Resolved: {data.resolved}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-section">
            <h2>Recent High Priority Complaints</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="recent-complaints">
                {complaints
                  .filter(c => c.upvotes >= 20)
                  .sort((a, b) => b.upvotes - a.upvotes)
                  .slice(0, 5)
                  .map(complaint => (
                    <div key={complaint.id} className="recent-complaint-item">
                      <div className="complaint-priority">
                        🚨 {complaint.upvotes} upvotes
                      </div>
                      <div className="complaint-details">
                        <h4>{complaint.title}</h4>
                        <p>{complaint.region}</p>
                      </div>
                      <button 
                        onClick={() => navigate('/admin/complaints')}
                        className="view-button"
                      >
                        View
                      </button>
                    </div>
                  ))}
                {complaints.filter(c => c.upvotes >= 20).length === 0 && (
                  <p className="empty-message">No high priority complaints at the moment.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button 
              onClick={() => navigate('/admin/complaints')}
              className="action-button"
            >
              <span className="action-icon">📝</span>
              <span>Manage All Complaints</span>
            </button>
            <button 
              onClick={() => navigate('/admin/complaints')}
              className="action-button"
            >
              <span className="action-icon">⏳</span>
              <span>Review Pending ({stats.pending})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
