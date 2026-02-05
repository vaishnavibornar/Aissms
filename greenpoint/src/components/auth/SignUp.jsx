import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function SignUp() {
  const [formData, setFormData] = useState({ email: "", password: "", username: "", role: "citizen" });
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Create User Document
      await setDoc(doc(db, "users", user.uid), {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        points: 0,
        createdAt: serverTimestamp(),
      });

      navigate(formData.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>Join the Community</h2>
        <form onSubmit={handleSignUp}>
          <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} required />
          <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
            <option value="citizen">Citizen</option>
            <option value="admin">Administrator</option>
          </select>
          <button type="submit" className="btn-primary full-width">Sign Up</button>
        </form>
        <p>Already a member? <Link to="/login">Log In</Link></p>
      </div>
    </div>
  );
}