import api from "../api/axios";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
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
      
      // 1. Log user in via Context (Updates localStorage & Global State)
      login(res.data.token, res.data.role);
      
      toast.success("Login successful");

      // 2. Role-Based Redirection
      // We normalize the role to lowercase to avoid string mismatch issues
      const userRole = res.data.role.toLowerCase();

      if (userRole === "student") {
        navigate("/student");
      } else if (userRole === "driver") {
        navigate("/driver");
      } else if (userRole === "admin") {
        // Redirecting to the primary admin view
        navigate("/admin/track"); 
      }
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      <div className="login-container container shadow-lg overflow-hidden">
        <div className="row h-100">
          
          {/* LEFT SIDE: DESIGN & BRANDING */}
          <div className="col-md-6 d-none d-md-block p-0 position-relative">
            <div className="image-overlay">
              <div className="brand-content p-5 text-white h-100 d-flex flex-column">
                <span className="badge rounded-pill bg-glass mb-3 align-self-start">Bus Tracking System v2.0</span>
                <h1 className="display-5 fw-bold mb-3">KRMU <br/>Transit.</h1>
                <p className="lead opacity-75">Join our university network for safer, smarter, and faster commutes.</p>
                
                <div className="mt-auto">
                   <div className="d-flex gap-2">
                      <div className="dot active"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: AUTH FORM */}
          <div className="col-md-6 p-5 d-flex flex-column justify-content-center bg-card-dark">
            <div className="form-header mb-4">
              <h2 className="fw-bold text-white mb-1">Welcome Back</h2>
              <p className="text-muted">Enter your credentials to access the portal</p>
            </div>

            <form onSubmit={submit}>
              <div className="mb-4">
                <label className="form-label text-secondary-alt small fw-bold text-uppercase">Email Address</label>
                <input
                  type="email"
                  className="form-control custom-input"
                  placeholder="name@krmangalam.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between">
                    <label className="form-label text-secondary-alt small fw-bold text-uppercase">Password</label>
                    <a href="#" className="small text-decoration-none color-primary">Forgot?</a>
                </div>
                <input
                  type="password"
                  className="form-control custom-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-login w-100 py-3 fw-bold mb-3 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="text-center mt-3">
              <p className="small text-muted">
                New to the system? <Link to="/register" className="color-primary text-decoration-none fw-bold">Create Account</Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}