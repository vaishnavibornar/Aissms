import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* --- Navbar --- */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="logo-icon">🍃</span> 
          <span className="logo-text">GreenPoints</span>
        </div>
        <div className="landing-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </div>
        <div className="landing-auth-btns">
          <button className="btn-text" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-primary-solid" onClick={() => navigate("/signup")}>Get Started</button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="landing-hero">
        <div className="pill-badge">⚡ Community-Powered Environmental Action</div>
        <h1 className="hero-title">
          Build a Cleaner Future,<br />
          <span className="text-highlight">Together</span>
        </h1>
        <p className="hero-sub">
          Report environmental issues, rally community support, and watch as your
          neighborhood transforms. Every voice matters in the journey to a greener tomorrow.
        </p>
        
        <div className="hero-actions">
          <button className="btn-lg-primary" onClick={() => navigate("/signup")}>Start Making Change →</button>
          <button className="btn-lg-outline" onClick={() => navigate("/login")}>Login to Your Account</button>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <strong>10K+</strong>
            <span>Issues Reported</span>
          </div>
          <div className="stat-item">
            <strong>95%</strong>
            <span>Resolution Rate</span>
          </div>
          <div className="stat-item">
            <strong>500+</strong>
            <span>Active Cities</span>
          </div>
          <div className="stat-item">
            <strong>25</strong>
            <span>Districts Covered</span>
          </div>
        </div>
      </header>

      {/* --- Features Section --- */}
      <section id="features" className="section-features">
        <div className="section-header">
          <h2>Everything You Need to Make a <span className="text-highlight">Difference</span></h2>
          <p>Our platform provides all the tools for citizens and administrators to collaborate on environmental improvements.</p>
        </div>

        <div className="features-grid">
          <FeatureCard 
            icon="📷" 
            title="Easy Reporting" 
            desc="Capture issues instantly with your camera and submit complaints in seconds." 
          />
          <FeatureCard 
            icon="📍" 
            title="Location-Based" 
            desc="Auto-detect your location for accurate reporting and regional organization." 
          />
          <FeatureCard 
            icon="👍" 
            title="Community Voting" 
            desc="Upvote issues that matter most to prioritize urgent environmental problems." 
          />
          <FeatureCard 
            icon="📶" 
            title="Priority System" 
            desc="Higher voted complaints get faster attention from authorities automatically." 
          />
          <FeatureCard 
            icon="🛡️" 
            title="Anonymous Option" 
            desc="Report sensitive issues anonymously while still contributing to change." 
          />
          <FeatureCard 
            icon="🏆" 
            title="Community Points" 
            desc="Earn points for active participation and climb the leaderboards." 
          />
        </div>
      </section>

      {/* --- How It Works --- */}
      <section id="how-it-works" className="section-how">
        <div className="section-header">
          <h2>How <span className="text-green">GreenPoints</span> Works</h2>
          <p>From spotting an issue to seeing it resolved — your path to community impact.</p>
        </div>

        <div className="steps-container">
          <StepCard number="01" title="Spot an Issue" desc="See environmental or civic problems in your area? Time to take action." />
          <StepCard number="02" title="Capture & Report" desc="Take a photo, add details, and submit your complaint with location data." />
          <StepCard number="03" title="Community Support" desc="Your neighbors upvote important issues, boosting their priority level." />
          <StepCard number="04" title="Resolution" desc="Administrators assign and track complaints until full resolution." />
        </div>
      </section>

      {/* --- CTA Footer --- */}
      <footer className="cta-footer">
        <div className="footer-content">
          <span className="footer-leaf-icon">🍃</span>
          <h2>Ready to Transform Your Community?</h2>
          <p>Join thousands of citizens who are actively shaping cleaner, safer, and more beautiful neighborhoods.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="feature-icon-wrapper">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <div className="step-text">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  );
}