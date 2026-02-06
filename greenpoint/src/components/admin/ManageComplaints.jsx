import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import './ManageComplaints.css';

export default function ManageComplaints() {
  const { logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    region: 'all',
    priority: 'all'
  });
  const [regions, setRegions] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignDepartment, setAssignDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const departments = [
    'Waste Management',
    'Water Supply',
    'Sanitation',
    'Roads & Infrastructure',
    'Parks & Gardens',
    'Environmental Health',
    'Public Works'
  ];

  useEffect(() => {
    // Real-time listener for all complaints
    const q = query(
      collection(db, 'complaints'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintsData = [];
      const regionsSet = new Set();

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        complaintsData.push(data);
        regionsSet.add(data.region);
      });

      setComplaints(complaintsData);
      setRegions(['all', ...Array.from(regionsSet)]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = complaints;

    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.region !== 'all') {
      filtered = filtered.filter(c => c.region === filters.region);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(c => {
        const upvotes = c.upvotes || 0;
        if (filters.priority === 'critical') return upvotes >= 50;
        if (filters.priority === 'high') return upvotes >= 20 && upvotes < 50;
        if (filters.priority === 'medium') return upvotes >= 10 && upvotes < 20;
        if (filters.priority === 'low') return upvotes < 10;
        return true;
      });
    }

    setFilteredComplaints(filtered);
  }, [complaints, filters]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleApprove = async (complaintId) => {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error approving complaint:', error);
    }
  };

  const handleReject = async (complaintId) => {
    if (!window.confirm('Are you sure you want to reject this complaint?')) return;
    
    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error rejecting complaint:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedComplaint || !assignDepartment) return;

    try {
      await updateDoc(doc(db, 'complaints', selectedComplaint.id), {
        status: 'assigned',
        assignedDepartment: assignDepartment,
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setSelectedComplaint(null);
      setAssignDepartment('');
    } catch (error) {
      console.error('Error assigning complaint:', error);
    }
  };

  const handleResolve = async (complaintId) => {
    if (!window.confirm('Mark this complaint as resolved?')) return;

    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error resolving complaint:', error);
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
    if (upvotes >= 50) return { label: 'Critical', color: '#ef4444' };
    if (upvotes >= 20) return { label: 'High', color: '#f59e0b' };
    if (upvotes >= 10) return { label: 'Medium', color: '#3b82f6' };
    return { label: 'Low', color: '#6b7280' };
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav admin-nav">
        <div className="nav-brand">
          <h2>🌱 GreenPoints Admin</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/admin/dashboard')} className="nav-link">
            Dashboard
          </button>
          <button onClick={() => navigate('/admin/complaints')} className="nav-link active">
            Manage Complaints
          </button>
          <button onClick={handleLogout} className="nav-link logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="manage-header">
          <h1>Manage Complaints</h1>
          <p>Review, approve, and assign complaints to departments</p>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Status</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Region</label>
            <select 
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select 
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical (50+ votes)</option>
              <option value="high">High (20-49 votes)</option>
              <option value="medium">Medium (10-19 votes)</option>
              <option value="low">Low (&lt;10 votes)</option>
            </select>
          </div>

          <div className="filter-results">
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints match the current filters.</p>
          </div>
        ) : (
          <div className="complaints-table-container">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Region</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Upvotes</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => {
                  const priority = getPriorityLabel(complaint.upvotes || 0);
                  
                  return (
                    <tr key={complaint.id}>
                      <td>
                        <div className="complaint-title-cell">
                          <strong>{complaint.title}</strong>
                          <small>{new Date(complaint.createdAt).toLocaleDateString()}</small>
                        </div>
                      </td>
                      <td>{complaint.region}</td>
                      <td>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: priority.color }}
                        >
                          {priority.label}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(complaint.status) }}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td>{complaint.upvotes || 0}</td>
                      <td>{complaint.assignedDepartment || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          {complaint.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(complaint.id)}
                                className="action-btn approve-btn"
                              >
                                ✓ Approve
                              </button>
                              <button 
                                onClick={() => handleReject(complaint.id)}
                                className="action-btn reject-btn"
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                          {complaint.status === 'approved' && (
                            <button 
                              onClick={() => setSelectedComplaint(complaint)}
                              className="action-btn assign-btn"
                            >
                              📋 Assign
                            </button>
                          )}
                          {complaint.status === 'assigned' && (
                            <button 
                              onClick={() => handleResolve(complaint.id)}
                              className="action-btn resolve-btn"
                            >
                              ✓ Resolve
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedComplaint(complaint)}
                            className="action-btn view-btn"
                          >
                            👁️ View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for viewing/assigning complaint */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedComplaint(null)}
            >
              ✕
            </button>
            
            <h2>{selectedComplaint.title}</h2>
            
            {selectedComplaint.imageUrl && (
              <img 
                src={selectedComplaint.imageUrl}
                alt="Complaint"
                className="modal-image"
              />
            )}
            
            <div className="modal-details">
              <div className="detail-row">
                <strong>Description:</strong>
                <p>{selectedComplaint.description}</p>
              </div>
              <div className="detail-row">
                <strong>Region:</strong>
                <span>{selectedComplaint.region}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(selectedComplaint.status) }}
                >
                  {selectedComplaint.status}
                </span>
              </div>
              <div className="detail-row">
                <strong>Upvotes:</strong>
                <span>{selectedComplaint.upvotes || 0}</span>
              </div>
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
              </div>
              {selectedComplaint.assignedDepartment && (
                <div className="detail-row">
                  <strong>Assigned to:</strong>
                  <span>{selectedComplaint.assignedDepartment}</span>
                </div>
              )}
            </div>

            {selectedComplaint.status === 'approved' && (
              <div className="assign-section">
                <label>Assign to Department:</label>
                <select 
                  value={assignDepartment}
                  onChange={(e) => setAssignDepartment(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <button 
                  onClick={handleAssign}
                  disabled={!assignDepartment}
                  className="assign-button"
                >
                  Assign Complaint
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
