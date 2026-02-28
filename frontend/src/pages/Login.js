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

  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:8080";

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      login(res.data.token, res.data.role);
      toast.success("Welcome Back!");

      const userRole = res.data.role.toLowerCase();

      if (userRole === "student") navigate("/student");
      else if (userRole === "driver") navigate("/driver");
      else if (userRole === "admin") navigate("/admin/track");
      else if (userRole === "parent") navigate("/parent-dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const handleMicrosoftLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/microsoft`;
  };

  return (
    <div className="unified-auth-root">
      <div className="mesh-gradient-1"></div>
      <div className="mesh-gradient-2"></div>

      <div className="unified-glass-card">
        <div className="auth-header-content text-center">
          <div className="auth-icon-box">
            <h2 style={{ margin: 0 }}>🚍</h2>
          </div>
          <h2 className="welcome-title">Welcome Back</h2>
          <p className="welcome-subtitle">KRMU Transit Dashboard</p>
        </div>

        <form onSubmit={submit} className="unified-auth-form mt-4">
          <div className="unified-input-group">
            <input
              type="email"
              placeholder="name@krmu.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="unified-input-group mt-3">
            <input
              type="password"
              placeholder="Account Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="unified-btn-primary"
            disabled={loading}
          >
            {loading ? "Verifying Credentials..." : "Log in to Portal"}
          </button>
        </form>

        {/* OAuth Divider */}
        <div className="oauth-divider">
          <span>OR</span>
        </div>

        {/* Google Login */}
        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </button>

        {/* Microsoft Login */}
        <button
          type="button"
          className="microsoft-btn"
          onClick={handleMicrosoftLogin}
        >
          Continue with Microsoft Outlook
        </button>

        <div className="unified-auth-footer">
          <Link to="/forgot" className="unified-link-primary">
            Forgot Password?
          </Link>
          <div className="mt-4 unified-signup-text">
            Don't have an account? <Link to="/register">Sign Up here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}