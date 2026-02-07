import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function SignUp() {
  const location = useLocation();
  const roleFromState = location.state?.role;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: roleFromState || 'citizen'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const isLockedRole = roleFromState != null;
  const showRoleSwitcher = !isLockedRole;

  useEffect(() => {
    if (roleFromState && roleFromState !== formData.role) {
      setFormData(prev => ({ ...prev, role: roleFromState }));
    }
  }, [roleFromState]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(formData.email, formData.password, formData.role, formData.username);

      if (formData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      setError('Failed to create account. Email may already be in use.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const roleLabel = formData.role === 'admin' ? 'Administrator' : 'Citizen';

  return (
    <div className="auth-container">
      <Link to="/" className="auth-back-home">
        ← Back to Home
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Join GreenPoints</h1>
          <p className="auth-subtitle">Create your account to get started</p>
          {isLockedRole && (
            <span className="auth-role-static">Sign up as {roleLabel}</span>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              id="username"
              name="username"
              className="auth-input"
              value={formData.username}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="username" className="auth-label">Username</label>
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              className="auth-input"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="email" className="auth-label">Email Address</label>
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="password" className="auth-label">Password (min 6 characters)</label>
          </div>

          <div className="form-group">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="auth-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
          </div>

          {showRoleSwitcher && (
            <div className="auth-role-switcher">
              <label>Select role</label>
              <div className="role-toggle-wrap">
                <button
                  type="button"
                  className={`role-toggle-option ${formData.role === 'citizen' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'citizen' }))}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  className={`role-toggle-option ${formData.role === 'admin' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                >
                  Administrator
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
