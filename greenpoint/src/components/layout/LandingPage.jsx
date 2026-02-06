import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="logo">
          🌱 GreenPoints
        </div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/login')} className="btn-login">Login</button>
          <button onClick={() => navigate('/signup')} className="btn-signup">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Build a Cleaner Future, <br /><span className="highlight">Together</span></h1>
        <p>
          Report environmental issues, rally community support, and watch as your 
          neighborhood transforms. Every voice matters in the journey to a greener tomorrow.
        </p>
        
        <div className="hero-actions">
          <button onClick={() => navigate('/signup')} className="btn-primary">Start Making Change</button>
          <button onClick={() => navigate('/login')} className="btn-secondary">Login to Your Account</button>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <h3>10K+</h3>
            <p>Issues Reported</p>
          </div>
          <div className="stat-item">
            <h3>95%</h3>
            <p>Resolution Rate</p>
          </div>
          <div className="stat-item">
            <h3>500+</h3>
            <p>Green Cities</p>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="features">
        <h2 className="section-title">Everything You Need to Make a Difference</h2>
        <p className="section-subtitle">Our platform provides all the tools for citizens and administrators to collaborate on environmental improvements.</p>
        
        <div className="features-grid">
          <FeatureCard 
            icon="📱" 
            title="Easy Reporting" 
            desc="Capture issues instantly with your camera and auto-location detection." 
          />
          <FeatureCard 
            icon="📍" 
            title="Location-Based" 
            desc="Auto-detect exact locations for accurate reporting and rapid organization." 
          />
          <FeatureCard 
            icon="👍" 
            title="Community Voting" 
            desc="Upvote issues that matter most to prioritize urgent environmental problems." 
          />
          <FeatureCard 
            icon="📊" 
            title="Priority System" 
            desc="Higher voted complaints get faster attention from authorities." 
          />
          <FeatureCard 
            icon="🔒" 
            title="Anonymous Option" 
            desc="Report sensitive issues anonymously while still contributing to change." 
          />
          <FeatureCard 
            icon="🏆" 
            title="Community Points" 
            desc="Earn points for active participation and climb the leaderboard." 
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How GreenPoints Works</h2>
        <p className="section-subtitle">From spotting an issue to seeing it resolved — your path to community impact.</p>

        <div className="steps-grid">
          <StepCard number="01" title="Spot an Issue" desc="See an environmental or civic problem in your area? Take a photo." />
          <StepCard number="02" title="Capture & Report" desc="Add details and submit your complaint with location data." />
          <StepCard number="03" title="Community Support" desc="Your neighbors upvote important issues, boosting priority." />
          <StepCard number="04" title="Resolution" desc="Administrators assign and resolve complaints. You earn points!" />
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="cta-footer">
        <h2>Ready to Transform Your Community?</h2>
        <p>Join thousands of citizens who are actively shaping cleaner, safer, and more beautiful neighborhoods.</p>
        <button onClick={() => navigate('/signup')} className="btn-white">Get Started Now →</button>
      </footer>
    </div>
  );
}

// Helper Components for Cleaner Code
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="icon-box">{icon}</div>
      <h3>{title}</h3>
      <p style={{ color: '#666', lineHeight: '1.6', marginTop: '0.5rem' }}>{desc}</p>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <h3>{title}</h3>
      <p style={{ color: '#666', lineHeight: '1.6', marginTop: '0.5rem' }}>{desc}</p>
    </div>
  );
}