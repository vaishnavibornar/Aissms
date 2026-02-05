import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css"; // Assume basic flex styling provided in logic

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation happens in App.jsx based on role protection
      navigate("/dashboard"); 
    } catch (err) {
      setError("Failed to log in: " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>GreenPoints Login</h2>
        {error && <div className="error-alert">{error}</div>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary full-width">Log In</button>
        </form>
        <p>Need an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}