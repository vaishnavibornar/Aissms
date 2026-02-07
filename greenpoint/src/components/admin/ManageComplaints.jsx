import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { getRegionDisplayName, isCoordinateRegion } from '../../utils/regionDisplay';
import './ManageComplaints.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' }
];

function getStatusBadgeClass(status) {
  const map = {
    pending: 'mc-badge-pending',
    approved: 'mc-badge-approved',
    assigned: 'mc-badge-assigned',
    resolved: 'mc-badge-resolved',
    rejected: 'mc-badge-rejected'
  };
  return `mc-badge ${map[status] || ''}`.trim();
}

function getPriorityStyle(upvotes) {
  if (upvotes >= 50) return { label: 'Critical', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' };
  if (upvotes >= 20) return { label: 'High', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' };
  if (upvotes >= 10) return { label: 'Medium', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)' };
  return { label: 'Low', color: '#71717a', bg: 'rgba(255, 255, 255, 0.08)' };
}

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
    const q = query(
      collection(db, 'complaints'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintsData = [];
      const rawRegions = new Set();

      snapshot.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() };
        complaintsData.push(data);
        if (data.region) rawRegions.add(data.region);
      });
      const rawList = Array.from(rawRegions);
      const namedRegions = rawList.filter((r) => !isCoordinateRegion(r));
      const hasCoordinateRegion = rawList.some(isCoordinateRegion);
      const regionOptions = ['all', ...namedRegions, ...(hasCoordinateRegion ? ['__other__'] : [])];

      setComplaints(complaintsData);
      setRegions(regionOptions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = complaints;

    if (filters.status !== 'all') {
      filtered = filtered.filter((c) => c.status === filters.status);
    }
    if (filters.region !== 'all') {
      filtered =
        filters.region === '__other__'
          ? filtered.filter((c) => isCoordinateRegion(c.region))
          : filtered.filter((c) => c.region === filters.region);
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter((c) => {
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
    setFilters((prev) => ({ ...prev, [filterType]: value }));
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

  return (
    <div className="dashboard-container manage-complaints-page">
      <nav className="dashboard-nav admin-nav">
        <div className="nav-brand">
          <h2>🌱 GreenPoints Admin</h2>
        </div>
        <div className="nav-links">
          <button type="button" onClick={() => navigate('/admin/dashboard')} className="nav-link">
            Dashboard
          </button>
          <button type="button" onClick={() => navigate('/admin/complaints')} className="nav-link active">
            Manage Complaints
          </button>
          <button type="button" onClick={() => navigate('/admin/analytics')} className="nav-link">
            Analytics
          </button>
          <button type="button" onClick={handleLogout} className="nav-link logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="manage-header">
          <h1>Manage Complaints</h1>
          <p>Review, approve, and assign complaints to departments</p>
        </div>

        <div className="mc-filters-bar">
          <div className="mc-filter-wrap">
            <label htmlFor="mc-filter-status">Status</label>
            <select
              id="mc-filter-status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mc-filter-wrap">
            <label htmlFor="mc-filter-region">Region</label>
            <select
              id="mc-filter-region"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
            >
              <option value="all">All regions</option>
              {regions.filter((r) => r !== 'all').map((region) => (
                <option key={region} value={region}>
                  {region === '__other__' ? 'Other location' : region}
                </option>
              ))}
            </select>
          </div>
          <div className="mc-filter-wrap">
            <label htmlFor="mc-filter-priority">Priority</label>
            <select
              id="mc-filter-priority"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="all">All priorities</option>
              <option value="critical">Critical (50+ votes)</option>
              <option value="high">High (20–49)</option>
              <option value="medium">Medium (10–19)</option>
              <option value="low">Low (&lt;10)</option>
            </select>
          </div>
          <div className="mc-filter-results">
            {filteredComplaints.length} of {complaints.length} complaints
          </div>
        </div>

        {loading ? (
          <div className="mc-loading">Loading complaints…</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="mc-empty">
            <p>No complaints match the current filters.</p>
          </div>
        ) : (
          <div className="mc-table-glass">
            <div className="mc-table-wrap">
              <table className="mc-table">
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
                    const priority = getPriorityStyle(complaint.upvotes || 0);
                    return (
                      <tr key={complaint.id}>
                        <td>
                          <div className="mc-title-cell">
                            <strong>{complaint.title}</strong>
                            <small>{new Date(complaint.createdAt).toLocaleDateString()}</small>
                          </div>
                        </td>
                        <td>{getRegionDisplayName(complaint.region)}</td>
                        <td>
                          <span
                            className="mc-priority-badge"
                            style={{ backgroundColor: priority.bg, color: priority.color }}
                          >
                            {priority.label}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(complaint.status)}>
                            {complaint.status}
                          </span>
                        </td>
                        <td>{complaint.upvotes || 0}</td>
                        <td>{complaint.assignedDepartment || '—'}</td>
                        <td className="mc-action-cell">
                          {complaint.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(complaint.id)}
                                className="mc-action-btn mc-action-btn-approve"
                                title="Approve"
                              >
                                <span className="mc-action-icon">✓</span>
                                <span className="mc-action-label">Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(complaint.id)}
                                className="mc-action-btn mc-action-btn-reject"
                                title="Reject"
                              >
                                <span className="mc-action-icon">✗</span>
                                <span className="mc-action-label">Reject</span>
                              </button>
                            </>
                          )}
                          {complaint.status === 'approved' && (
                            <button
                              type="button"
                              onClick={() => setSelectedComplaint(complaint)}
                              className="mc-action-btn mc-action-btn-assign"
                              title="Assign"
                            >
                              <span className="mc-action-icon">📋</span>
                              <span className="mc-action-label">Assign</span>
                            </button>
                          )}
                          {complaint.status === 'assigned' && (
                            <button
                              type="button"
                              onClick={() => handleResolve(complaint.id)}
                              className="mc-action-btn mc-action-btn-resolve"
                              title="Resolve"
                            >
                              <span className="mc-action-icon">✓</span>
                              <span className="mc-action-label">Resolve</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedComplaint(complaint)}
                            className="mc-action-btn mc-action-btn-view"
                            title="View details"
                          >
                            <span className="mc-action-icon">👁</span>
                            <span className="mc-action-label">View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedComplaint && (
        <div
          className="mc-modal-overlay"
          onClick={() => setSelectedComplaint(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mc-modal-title"
        >
          <div className="mc-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="mc-modal-close"
              onClick={() => setSelectedComplaint(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 id="mc-modal-title">{selectedComplaint.title}</h2>

            {selectedComplaint.imageUrl && (
              <img
                src={selectedComplaint.imageUrl}
                alt="Complaint"
                className="mc-modal-image"
              />
            )}

            <div className="mc-modal-details">
              <div className="mc-detail-row">
                <strong>Description</strong>
                <p>{selectedComplaint.description}</p>
              </div>
              <div className="mc-detail-row">
                <strong>Region</strong>
                <span>{getRegionDisplayName(selectedComplaint.region)}</span>
              </div>
              <div className="mc-detail-row">
                <strong>Status</strong>
                <span className={getStatusBadgeClass(selectedComplaint.status)}>
                  {selectedComplaint.status}
                </span>
              </div>
              <div className="mc-detail-row">
                <strong>Upvotes</strong>
                <span>{selectedComplaint.upvotes || 0}</span>
              </div>
              <div className="mc-detail-row">
                <strong>Created</strong>
                <span>{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
              </div>
              {selectedComplaint.assignedDepartment && (
                <div className="mc-detail-row">
                  <strong>Assigned to</strong>
                  <span>{selectedComplaint.assignedDepartment}</span>
                </div>
              )}
            </div>

            {selectedComplaint.status === 'approved' && (
              <div className="mc-assign-section">
                <label htmlFor="mc-assign-dept">Assign to department</label>
                <select
                  id="mc-assign-dept"
                  value={assignDepartment}
                  onChange={(e) => setAssignDepartment(e.target.value)}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={!assignDepartment}
                  className="mc-assign-btn"
                >
                  Assign complaint
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
