import React, { useEffect, useState } from "react";
import { db, auth } from "../../services/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from "firebase/firestore";
import "./CitizenProfile.css";

export default function CitizenProfile() {
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Current User Data
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            setProfile(userSnap.data());
          }
        }

        // 2. Get Global Leaderboard (Top 10 Users)
        const leaderboardQuery = query(
          collection(db, "users"), 
          orderBy("points", "desc"), 
          limit(10)
        );
        
        const querySnapshot = await getDocs(leaderboardQuery);
        const topUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setLeaderboard(topUsers);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{textAlign: 'center', marginTop: '50px'}}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="container profile-container">
      
      {/* --- Personal Profile Section --- */}
      {profile && (
        <div className="card profile-card">
          <div className="profile-header">
            <div className="avatar-circle">
              {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
            </div>
            <h2>{profile.username || "Citizen"}</h2>
            <p className="email-text">{profile.email}</p>
          </div>
          
          <div className="stats-row">
            <div className="stat-pill">
              <span className="icon">⭐</span>
              <span className="value">{profile.points || 0}</span>
              <span className="label">Points</span>
            </div>
            <div className="stat-pill">
              <span className="icon">🗓️</span>
              <span className="value">
                {profile.createdAt ? new Date(profile.createdAt.seconds * 1000).getFullYear() : "2024"}
              </span>
              <span className="label">Joined</span>
            </div>
          </div>
        </div>
      )}

      {/* --- Leaderboard Section --- */}
      <div className="leaderboard-section">
        <h3>🏆 Community Champions</h3>
        <p className="subtitle">Top contributors making a difference</p>
        
        <div className="leaderboard-list card">
          {leaderboard.length > 0 ? (
            leaderboard.map((user, index) => {
              const isCurrentUser = auth.currentUser && user.id === auth.currentUser.uid;
              
              return (
                <div 
                  key={user.id} 
                  className={`leaderboard-item rank-${index + 1} ${isCurrentUser ? 'highlight' : ''}`}
                >
                  <div className="rank">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </div>
                  
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    {index < 3 && <span className="top-badge">Top Contributor</span>}
                  </div>
                  
                  <div className="user-points">
                    {user.points} pts
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">No points recorded yet. Be the first!</div>
          )}
        </div>
      </div>
    </div>
  );
}