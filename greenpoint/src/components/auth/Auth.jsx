import React, { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine mode based on URL path or default to login
  const [isLogin, setIsLogin] = useState(true);
  
  useEffect(() => {
    if (location.pathname === '/signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location]);

  const toggleMode = () => {
    if (isLogin) navigate('/signup');
    else navigate('/login');
  };

  // Form State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("citizen"); // Default role
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    region: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        // Navigation is handled by ProtectedRoute or here manually
        // For simplicity, we can let AuthContext detect change, 
        // but explicit nav is safer for UX feedback
        navigate("/dashboard"); 
      } else {
        // --- SIGN UP ---
        const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(user, { displayName: formData.fullName });
        
        await setDoc(doc(db, "users", user.uid), {
          username: formData.fullName,
          email: formData.email,
          region: formData.region, // Added region field
          role: role,
          points: 0,
          createdAt: serverTimestamp(),
        });
        
        navigate(role === 'admin' ? "/admin" : "/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Authentication failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  // --- Render Components ---

  const GreenSidePanel = ({ title, subtitle }) => (
    <div className="auth-panel-green">
      <div className="green-content">
        <div className="leaf-logo-large">🍃</div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className={`auth-split-wrapper ${isLogin ? 'mode-signin' : 'mode-signup'}`}>
      
      {/* --- SIGN UP LAYOUT: Green Left, Form Right --- */}
      {!isLogin && (
        <>
          <GreenSidePanel 
            title="Join the Movement" 
            subtitle="Become part of a community dedicated to environmental change. Your actions today shape a better tomorrow." 
          />
          <div className="auth-panel-form">
            <div className="form-container">
              <div className="auth-header">
                <div className="mobile-logo">🍃 GreenPoints</div>
                <h2>Create your account</h2>
                <p>Start your journey towards a cleaner community</p>
              </div>

              {/* Role Selection Cards */}
              <div className="role-selector">
                <p className="field-label">I am a</p>
                <div className="role-cards">
                  <div 
                    className={`role-card ${role === 'citizen' ? 'selected' : ''}`}
                    onClick={() => setRole('citizen')}
                  >
                    <span className="role-icon">👥</span>
                    <div className="role-text">
                      <strong>Citizen</strong>
                      <span>Report & vote on issues</span>
                    </div>
                  </div>
                  <div 
                    className={`role-card ${role === 'admin' ? 'selected' : ''}`}
                    onClick={() => setRole('admin')}
                  >
                    <span className="role-icon">🛡️</span>
                    <div className="role-text">
                      <strong>Administrator</strong>
                      <span>Manage & assign complaints</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Region / District</label>
                  <input type="text" name="region" placeholder="Downtown District" value={formData.region} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                  <span className="hint">Must be at least 8 characters</span>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Account →"}
                </button>
              </form>

              <div className="auth-footer-link">
                Already have an account? <span onClick={toggleMode}>Sign in</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- SIGN IN LAYOUT: Form Left, Green Right --- */}
      {isLogin && (
        <>
          <div className="auth-panel-form">
            <div className="form-container">
              <div className="auth-header">
                <div className="brand-header">🍃 GreenPoints</div>
                <h2>Welcome back</h2>
                <p>Sign in to continue your environmental mission</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <div className="label-row">
                    <label>Password</label>
                    <span className="forgot-link">Forgot password?</span>
                  </div>
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                </div>

                {error && <div className="error-msg">{error}</div>}

                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In →"}
                </button>
              </form>

              <div className="auth-footer-link">
                Don't have an account? <span onClick={toggleMode}>Create account</span>
              </div>
            </div>
          </div>
          <GreenSidePanel 
            title="Your Voice Matters" 
            subtitle="Every complaint raised brings us one step closer to a cleaner, greener community." 
          />
        </>
      )}

    </div>
  );
}