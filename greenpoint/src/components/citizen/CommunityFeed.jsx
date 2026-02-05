import React, { useEffect, useState } from "react";
import { db, auth } from "../../services/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import "./CommunityFeed.css";

export default function CommunityFeed() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComplaints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleUpvote = async (complaintId, upvotedBy) => {
    const userId = auth.currentUser.uid;
    const isUpvoted = upvotedBy.includes(userId);
    const complaintRef = doc(db, "complaints", complaintId);

    if (isUpvoted) {
      await updateDoc(complaintRef, {
        upvotes: increment(-1),
        upvotedBy: arrayRemove(userId)
      });
    } else {
      await updateDoc(complaintRef, {
        upvotes: increment(1),
        upvotedBy: arrayUnion(userId)
      });
      // Gamification: Add point to author could go here via Cloud Functions
    }
  };

  const getPriorityColor = (votes) => {
    if (votes >= 50) return "critical";
    if (votes >= 20) return "high";
    return "normal";
  };

  return (
    <div className="container feed-container">
      <h2>Community Feed</h2>
      <div className="feed-grid">
        {complaints.map((item) => (
          <div key={item.id} className={`card feed-card ${getPriorityColor(item.upvotes)}`}>
            <div className="img-wrapper">
              <img src={item.imageUrl} alt={item.title} loading="lazy" />
              <span className={`status-badge ${item.status}`}>{item.status}</span>
            </div>
            <div className="content">
              <h3>{item.title}</h3>
              <p className="desc">{item.description}</p>
              <div className="meta">
                <span>📍 {item.location ? "GPS Locked" : "No Loc"}</span>
                <span>👤 {item.userName}</span>
              </div>
              <button 
                className={`upvote-btn ${item.upvotedBy?.includes(auth.currentUser?.uid) ? 'active' : ''}`}
                onClick={() => handleUpvote(item.id, item.upvotedBy || [])}
              >
                👍 {item.upvotes} Support
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}