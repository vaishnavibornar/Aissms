import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { getRegionDisplayName, isCoordinateRegion } from '../../utils/regionDisplay';
import './CommunityFeed.css';

export default function CommunityFeed() {
  const { currentUser, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState('all');
  const [regions, setRegions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time listener for all complaints
    const q = query(
      collection(db, 'complaints'),
      orderBy('upvotes', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintsData = [];
      const rawRegions = new Set();
      
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        complaintsData.push(data);
        if (data.region) rawRegions.add(data.region);
      });
      const rawList = Array.from(rawRegions);
      const namedRegions = rawList.filter(r => !isCoordinateRegion(r));
      const hasCoordinateRegion = rawList.some(isCoordinateRegion);
      const regionOptions = ['all', ...namedRegions, ...(hasCoordinateRegion ? ['__other__'] : [])];
      
      setComplaints(complaintsData);
      setRegions(regionOptions);
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

  const handleUpvote = async (complaintId, upvotedBy) => {
    if (!currentUser) return;

    const complaintRef = doc(db, 'complaints', complaintId);
    const hasUpvoted = upvotedBy.includes(currentUser.uid);

    try {
      if (hasUpvoted) {
        // Remove upvote
        await updateDoc(complaintRef, {
          upvotes: increment(-1),
          upvotedBy: arrayRemove(currentUser.uid)
        });
      } else {
        // Add upvote
        await updateDoc(complaintRef, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(currentUser.uid)
        });
        
        // Award points to complaint creator if not anonymous
        const complaint = complaints.find(c => c.id === complaintId);
        if (complaint && complaint.userId !== 'anonymous') {
          const userRef = doc(db, 'users', complaint.userId);
          await updateDoc(userRef, {
            points: increment(1)
          });
        }
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
    }
  };

  const getPriorityLabel = (upvotes) => {
    if (upvotes >= 50) return { label: 'Critical', color: '#ef4444' };
    if (upvotes >= 20) return { label: 'High', color: '#f59e0b' };
    if (upvotes >= 10) return { label: 'Medium', color: '#3b82f6' };
    return { label: 'Low', color: '#6b7280' };
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

  const filteredComplaints = filterRegion === 'all'
    ? complaints
    : filterRegion === '__other__'
      ? complaints.filter(c => isCoordinateRegion(c.region))
      : complaints.filter(c => c.region === filterRegion);

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
          <button onClick={() => navigate('/citizen/feed')} className="nav-link active">
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
        <div className="feed-header">
          <div>
            <h1>Community Feed</h1>
            <p>View and support environmental issues in your community</p>
          </div>
          <div className="filter-section">
            <label>Filter by Region:</label>
            <select 
              value={filterRegion} 
              onChange={(e) => setFilterRegion(e.target.value)}
              className="region-filter"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region === '__other__' ? 'Other location' : region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading community complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints found in this region.</p>
          </div>
        ) : (
          <div className="feed-grid">
            {filteredComplaints.map((complaint) => {
              const priority = getPriorityLabel(complaint.upvotes || 0);
              const hasUpvoted = complaint.upvotedBy?.includes(currentUser.uid);
              
              return (
                <div key={complaint.id} className="feed-card">
                  {complaint.imageUrl && (
                    <img 
                      src={complaint.imageUrl} 
                      alt={complaint.title}
                      className="feed-image"
                    />
                  )}
                  
                  <div className="feed-content">
                    <div className="feed-header-row">
                      <h3>{complaint.title}</h3>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(complaint.status) }}
                      >
                        {complaint.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="feed-description">{complaint.description}</p>
                    
                    <div className="feed-meta">
                      <span>📍 {getRegionDisplayName(complaint.region)}</span>
                      <span 
                        className="priority-indicator"
                        style={{ color: priority.color }}
                      >
                        ⚠️ {priority.label} Priority
                      </span>
                    </div>

                    <div className="feed-footer">
                      <button 
                        onClick={() => handleUpvote(complaint.id, complaint.upvotedBy || [])}
                        className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`}
                      >
                        <span className="upvote-icon">👍</span>
                        <span className="upvote-count">{complaint.upvotes || 0}</span>
                      </button>
                      
                      <small className="feed-date">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
