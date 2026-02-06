import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  // Smart Navigation: Sends user to Signup with Role pre-selected
  const handleRoleSelect = (role) => {
    // Ideally, pass this state to your Auth component via location state
    // For now, we direct them to signup
    navigate('/signup'); 
  };

  return (
    <div className="landing-container">
      {/* Floating Glass Navbar */}
      <nav className="landing-nav">
        <div className="logo">⚡ GreenPoints</div>
        <div className="nav-links">
          <a href="#" className="nav-link">Features</a>
          <a href="#" className="nav-link">How it Works</a>
          <a href="#" className="nav-link">Community</a>
        </div>
        <button onClick={() => navigate('/login')} className="nav-cta">
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <span className="hero-pill">🚀 #1 Environmental App in India</span>
        <h1>
          Report Issues. <br />
          <span className="highlight">Get Rewards.</span>
        </h1>
        <p>
          The next-gen platform where technology meets civic duty. 
          Snap a photo, earn GreenPoints, and watch your city transform.
        </p>

        {/* The Role Selection Cards (User Request) */}
        <div className="role-cards-container">
          
          <div className="role-card" onClick={() => handleRoleSelect('citizen')}>
            <span className="role-icon">🌿</span>
            <h3>Join as Citizen</h3>
            <p>Report issues, earn points, and climb the leaderboard.</p>
            <span className="role-arrow">Get Started →</span>
          </div>

          <div className="role-card" onClick={() => handleRoleSelect('admin')}>
            <span className="role-icon">🛡️</span>
            <h3>Join as Admin</h3>
            <p>Manage complaints, assign tasks, and resolve issues.</p>
            <span className="role-arrow">Access Dashboard →</span>
          </div>

        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="bento-section">
        <div className="bento-grid">
          <div className="bento-item bento-large">
            <h3>📸 Smart AI Camera</h3>
            <p>Instantly detects location and categorizes waste using advanced AI vision.</p>
          </div>
          <div className="bento-item">
            <h3>📍 Geo-Tagging</h3>
            <p>Precise coordinates for every complaint.</p>
          </div>
          <div className="bento-item bento-tall">
            <h3>🏆 Leaderboard</h3>
            <p>Compete with neighbors. Top contributors win monthly rewards.</p>
          </div>
          <div className="bento-item">
            <h3>🔒 Secure & Anon</h3>
            <p>Your data is encrypted. Report anonymously.</p>
          </div>
          <div className="bento-item">
            <h3>⚡ Fast Resolution</h3>
            <p>Direct line to municipal authorities.</p>
          </div>
        </div>
      </section>

    </div>
  );
}