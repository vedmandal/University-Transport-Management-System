import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (login) {
        login(res.data.token, res.data.role);
        toast.success("Welcome Back!");
        const userRole = res.data.role.toLowerCase();
        if (userRole === "student") navigate("/student");
        else if (userRole === "driver") navigate("/driver");
        else if (userRole === "admin") navigate("/admin/track");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unified-auth-root">
      {/* Mesh Background Blurs */}
      <div className="mesh-gradient-1"></div>
      <div className="mesh-gradient-2"></div>

      <div className="unified-glass-card">
        <div className="auth-header-content text-center">
          <div className="auth-icon-box">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
               <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeOpacity="0"/>
               <circle cx="12" cy="12" r="10" />
               <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <h2 className="welcome-title">Welcome Back</h2>
          <p className="welcome-subtitle">KRMU Transit Dashboard</p>
        </div>

        <form onSubmit={submit} className="unified-auth-form mt-4">
          <div className="unified-input-group">
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
              placeholder="Account Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="unified-btn-primary" disabled={loading}>
            {loading ? "Verifying Credentials..." : "Log in to Portal"}
          </button>
        </form>

        <div className="unified-auth-footer">
          <Link to="/forgot" className="unified-link-primary">Forgot Password?</Link>
          <div className="mt-4 unified-signup-text">
            Don't have an account? <Link to="/register">Sign Up here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}