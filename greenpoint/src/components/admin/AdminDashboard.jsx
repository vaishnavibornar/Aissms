import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "complaints"), (snapshot) => {
      setComplaints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const updateStatus = async (id, newStatus, dept = null) => {
    const ref = doc(db, "complaints", id);
    const data = { status: newStatus };
    if (dept) data.department = dept;
    await updateDoc(ref, data);
  };

  const filteredComplaints = complaints.filter(c => 
    filter === "all" ? true : c.status === filter
  );

  return (
    <div className="container admin-container">
      <header className="admin-header">
        <h1>Admin Command Center</h1>
        <div className="stats-bar">
          <div className="stat">Total: {complaints.length}</div>
          <div className="stat">Pending: {complaints.filter(c => c.status === 'pending').length}</div>
          <div className="stat critical">Critical: {complaints.filter(c => c.upvotes >= 50).length}</div>
        </div>
      </header>

      <div className="controls">
        <select onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="all">All Complaints</option>
          <option value="pending">Pending Review</option>
          <option value="assigned">Assigned</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Location</th>
            <th>Votes</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredComplaints.map(complaint => (
            <tr key={complaint.id}>
              <td>
                <div className="issue-info">
                  <img src={complaint.imageUrl} alt="" className="thumb"/>
                  <div>
                    <strong>{complaint.title}</strong>
                    <p className="sm-text">{complaint.description.substring(0, 30)}...</p>
                  </div>
                </div>
              </td>
              <td>{complaint.location ? `${complaint.location.lat.toFixed(4)}...` : "N/A"}</td>
              <td>{complaint.upvotes}</td>
              <td><span className={`badge ${complaint.status}`}>{complaint.status}</span></td>
              <td>
                {complaint.status === 'pending' && (
                  <>
                    <button className="btn-icon approve" onClick={() => updateStatus(complaint.id, 'approved')}>✓</button>
                    <button className="btn-icon reject" onClick={() => updateStatus(complaint.id, 'rejected')}>✗</button>
                  </>
                )}
                {complaint.status === 'approved' && (
                  <select onChange={(e) => updateStatus(complaint.id, 'assigned', e.target.value)} defaultValue="">
                    <option value="" disabled>Assign Dept</option>
                    <option value="Waste">Waste Mgmt</option>
                    <option value="Water">Water Dept</option>
                    <option value="Roads">Roads</option>
                  </select>
                )}
                {complaint.status === 'assigned' && (
                  <button className="btn-sm" onClick={() => updateStatus(complaint.id, 'resolved')}>Mark Resolved</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}