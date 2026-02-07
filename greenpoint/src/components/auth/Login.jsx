import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const SLOW_NETWORK_TIMEOUT_MS = 5000;

export default function Login() {
  const location = useLocation();
  const roleFromState = location.state?.role;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(roleFromState || 'citizen');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [slowNetworkWarning, setSlowNetworkWarning] = useState(false);
  const timeoutRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isLockedRole = roleFromState != null;
  const showRoleToggle = !isLockedRole;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      setError('');
      setSlowNetworkWarning(false);
      setIsLoading(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setSlowNetworkWarning(true);
      }, SLOW_NETWORK_TIMEOUT_MS);

      const userCredential = await login(email, password);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setSlowNetworkWarning(false);

      if (userCredential?.user) {
        navigate('/dashboard', { replace: true });
        return;
      }
    } catch (err) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setSlowNetworkWarning(false);
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const roleLabel = (r) => (r === 'admin' ? 'Administrator' : 'Citizen');

  return (
    <div className="auth-container">
      <Link to="/" className="auth-back-home">
        ← Back to Home
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to GreenPoints</p>
          {isLockedRole && (
            <span className="auth-role-static">Sign in as {roleLabel(roleFromState)}</span>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {slowNetworkWarning && (
          <div className="auth-slow-network" role="status">
            Network is slow, hang tight...
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              id="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
              disabled={isLoading}
            />
            <label htmlFor="email" className="auth-label">Email Address</label>
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              disabled={isLoading}
            />
            <label htmlFor="password" className="auth-label">Password</label>
          </div>

          {showRoleToggle && (
            <div className="auth-role-switcher">
              <label>Sign in as</label>
              <div className="role-toggle-wrap">
                <button
                  type="button"
                  className={`role-toggle-option ${role === 'citizen' ? 'active' : ''}`}
                  onClick={() => setRole('citizen')}
                  disabled={isLoading}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  className={`role-toggle-option ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => setRole('admin')}
                  disabled={isLoading}
                >
                  Administrator
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="auth-button auth-button-with-spinner">
            {isLoading ? (
              <>
                <span className="auth-button-spinner" aria-hidden />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don&apos;t have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
}
