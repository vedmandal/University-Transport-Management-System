import React, { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; // Shared CSS for identical styling

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, password, role });
      toast.success("Registration successful. Please login.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unified-auth-root">
      {/* Mesh Background Blurs (Same as Login) */}
      <div className="mesh-gradient-1"></div>
      <div className="mesh-gradient-2"></div>

      <div className="unified-glass-card">
        <div className="auth-header-content text-center">
          <div className="auth-icon-box">
            {/* User Plus Icon for Registration */}
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
               <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
               <circle cx="8.5" cy="7" r="4" />
               <line x1="20" y1="8" x2="20" y2="14" />
               <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h2 className="welcome-title">Create Account</h2>
          <p className="welcome-subtitle">Join the KRMU Transit Network</p>
        </div>

        <form onSubmit={submit} className="unified-auth-form mt-4">
          <div className="unified-input-group">
            <i className="bi bi-person"></i>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="unified-input-group mt-3">
            <i className="bi bi-envelope-at"></i>
            <input
              type="email"
              placeholder="name@krmu.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="unified-input-group mt-3">
            <i className="bi bi-shield-lock"></i>
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="unified-input-group mt-3">
            <i className="bi bi-people"></i>
            <select
              className="form-select border-0 bg-transparent shadow-none fw-semibold text-dark"
              style={{ fontSize: "0.9rem", color: "#1e293b" }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="unified-btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <div className="unified-auth-footer">
          <div className="mt-4 unified-signup-text">
            Already have an account? <Link to="/">Sign In here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}