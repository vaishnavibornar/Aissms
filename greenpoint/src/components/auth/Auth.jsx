import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // Toggle state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    role: "citizen"
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
        // --- LOGIN LOGIC ---
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        // --- SIGN UP LOGIC ---
        const { user } = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );

        // Update Display Name
        await updateProfile(user, { displayName: formData.username });

        // Create User Document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          points: 0,
          createdAt: serverTimestamp(),
        });
      }

      // Redirect based on role (or default to dashboard)
      // Note: The ProtectedRoute in App.jsx will handle the final security check
      if (!isLogin && formData.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      // specific error handling for better UX
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>{isLogin ? "Welcome Back" : "Join GreenPoints"}</h2>
        
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password (6+ chars)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="role-label">I am a:</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="role-select"
              >
                <option value="citizen">Citizen</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading 
              ? "Processing..." 
              : (isLogin ? "Log In" : "Create Account")
            }
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "New to GreenPoints?" : "Already have an account?"}
            <button 
              type="button" 
              className="text-link" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}