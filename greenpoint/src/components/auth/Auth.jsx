import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState('citizen');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = (role) => {
    setUserRole(role);
    setError('');
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      return setError('Please fill in all required fields');
    }

    if (!isLogin) {
      if (!formData.username) {
        return setError('Username is required');
      }
      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match');
      }
      if (formData.password.length < 6) {
        return setError('Password must be at least 6 characters');
      }
    }

    try {
      setLoading(true);
      
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, userRole, formData.username);
      }

      // Navigate based on role
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      if (isLogin) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Failed to create account. Email may already be in use.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page ${userRole}`}>
      {/* Animated Background */}
      <div className="auth-background">
        <div className="background-overlay"></div>
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="auth-container">
        {/* Logo & Branding */}
        <div className="auth-branding">
          <div className="logo-container">
            <div className="logo-icon">🌱</div>
            <h1 className="brand-name">GreenPoints</h1>
          </div>
          <p className="brand-tagline">
            {userRole === 'citizen' 
              ? 'Join the movement for a cleaner, greener community' 
              : 'Manage and resolve environmental issues efficiently'}
          </p>
        </div>

        {/* Glass Card */}
        <div className={`auth-glass-card ${isLogin ? 'login-mode' : 'signup-mode'}`}>
          {/* Role Switcher */}
          <div className="role-switcher">
            <button
              type="button"
              className={`role-option ${userRole === 'citizen' ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('citizen')}
            >
              <div className="role-icon">👥</div>
              <div className="role-info">
                <span className="role-title">Citizen</span>
                <span className="role-subtitle">Report & Support</span>
              </div>
            </button>
            
            <div className="role-divider"></div>
            
            <button
              type="button"
              className={`role-option ${userRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('admin')}
            >
              <div className="role-icon">⚙️</div>
              <div className="role-info">
                <span className="role-title">Administrator</span>
                <span className="role-subtitle">Manage & Resolve</span>
              </div>
            </button>
            
            <div className={`role-slider ${userRole}`}></div>
          </div>

          {/* Form Header */}
          <div className="form-header">
            <h2 className="form-title">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="form-subtitle">
              {isLogin 
                ? `Sign in to continue as ${userRole === 'citizen' ? 'Citizen' : 'Administrator'}` 
                : `Join GreenPoints as ${userRole === 'citizen' ? 'a Citizen' : 'an Administrator'}`}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username (Sign Up Only) */}
            {!isLogin && (
              <div className="form-field fade-in">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a unique username"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                  required
                />
              </div>
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {!isLogin && (
              <div className="form-field fade-in">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔑</span>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`submit-button ${userRole}`}
            >
              {loading ? (
                <span className="button-spinner"></span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="mode-toggle">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              type="button"
              onClick={handleModeSwitch}
              className="toggle-link"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>© 2026 GreenPoints. Building a sustainable future together.</p>
        </div>
      </div>
    </div>
  );
}
