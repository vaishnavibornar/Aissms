import React, { useEffect, useState } from "react";
import { db, auth } from "../../services/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./CitizenDashboard.css";

export default function CitizenDashboard() {
  const [myComplaints, setMyComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });

  useEffect(() => {
    if (!auth.currentUser) return;

    // Query only complaints created by this user
    const q = query(
      collection(db, "complaints"), 
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyComplaints(data);
      
      // Calculate stats locally
      setStats({
        total: data.length,
        resolved: data.filter(c => c.status === 'resolved').length,
        pending: data.filter(c => c.status === 'pending').length
      });
    });

    return unsubscribe;
  }, []);

  return (
    <div className="container dashboard-container">
      <div className="welcome-banner">
        <h1>Hello, {auth.currentUser?.displayName || "Citizen"} 👋</h1>
        <p>Here is the impact you've made in your community.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <span>Total Issues</span>
        </div>
        <div className="stat-card success">
          <h3>{stats.resolved}</h3>
          <span>Resolved</span>
        </div>
        <div className="stat-card warning">
          <h3>{stats.pending}</h3>
          <span>Pending</span>
        </div>
      </div>

      <h2>My History</h2>
      {myComplaints.length === 0 ? (
        <div className="empty-state">
          <p>You haven't reported any issues yet.</p>
          <a href="/raise" className="btn-primary">Raise your first complaint</a>
        </div>
      ) : (
        <div className="history-list">
          {myComplaints.map(item => (
            <div key={item.id} className="history-item">
              <img src={item.imageUrl} alt="Thumbnail" />
              <div className="history-details">
                <h4>{item.title}</h4>
                <span className={`badge ${item.status}`}>{item.status}</span>
              </div>
              <div className="history-meta">
                <span>{item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                <span>👍 {item.upvotes}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}