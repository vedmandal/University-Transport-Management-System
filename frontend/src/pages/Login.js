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
  const[count,setcount]=useState(0);

  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://university-transport-management-system-1.onrender.com";

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

      <div className="unified-glass-card shadow-lg">
        <div className="auth-header-content text-center">
          <div className="auth-icon-box">
            <h2 style={{ margin: 0 }}>🚍</h2>
          </div>
          <h2 className="welcome-title">Welcome Back</h2>
          <p className="welcome-subtitle">KRMU Transit Dashboard</p>
        </div>
        <div className="button"> {count}</div>

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

          <button
            type="submit"
            className="unified-btn-primary"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Log in to Portal"}
          </button>
        </form>

        {/* Improved OAuth Divider */}
        <div className="oauth-divider">
          <div className="divider-line"></div>
          <span>OR CONTINUE WITH</span>
          <div className="divider-line"></div>
        </div>

        {/* Refined OAuth Buttons Container */}
        <div className="oauth-button-container">
          <button
            type="button"
            className="oauth-btn-glass"
            onClick={handleGoogleLogin}
          >
            <i className="bi bi-google text-danger"></i> 
            <span>Google</span>
          </button>

          <button
            type="button"
            className="oauth-btn-glass"
          onClick={handleMicrosoftLogin}
          >
            <i className="bi bi-microsoft text-primary"></i> 
            <span>Outlook</span>
          </button>
        </div>
        <button  onClick={setcount(...count,count+1)}type="button"> click</button>

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