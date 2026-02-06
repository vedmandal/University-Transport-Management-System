import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; // Reuse the same CSS for consistency

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
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      <div className="login-container container shadow-lg overflow-hidden">
        <div className="row h-100">
          
          {/* LEFT SIDE: DESIGN & BRANDING (Matching Login) */}
          <div className="col-md-6 d-none d-md-block p-0 position-relative">
            <div className="image-overlay">
              <div className="brand-content p-5 text-white">
                <span className="badge rounded-pill bg-glass mb-3">Join the Network</span>
                <h1 className="display-5 fw-bold mb-3">Create <br/>Account.</h1>
                <p className="lead opacity-75">Get real-time updates and manage your campus commute effortlessly.</p>
                
                <div className="mt-auto pt-5">
                   <div className="d-flex gap-2">
                      <div className="dot"></div>
                      <div className="dot active"></div>
                      <div className="dot"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: REGISTRATION FORM */}
          <div className="col-md-6 p-5 d-flex flex-column justify-content-center bg-card-dark overflow-auto" style={{maxHeight: '650px'}}>
            <div className="form-header mb-4">
              <h2 className="fw-bold text-white mb-1">Get Started</h2>
              <p className="text-muted">Fill in your details to join KRMU Transit</p>
            </div>

            <form onSubmit={submit}>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label text-secondary-alt small fw-bold text-uppercase">Full Name</label>
                  <input
                    className="form-control custom-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary-alt small fw-bold text-uppercase">College Email</label>
                <input
                  type="email"
                  className="form-control custom-input"
                  placeholder="name@krmangalam.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label text-secondary-alt small fw-bold text-uppercase">Password</label>
                  <input
                    type="password"
                    className="form-control custom-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary-alt small fw-bold text-uppercase">Role</label>
                  <select
                    className="form-select custom-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ appearance: 'auto' }}
                  >
                    <option value="student">Student</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-login w-100 py-3 fw-bold mb-3 mt-2"
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm"></span> : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-2">
              <p className="small text-muted">
                Already have an account? <Link to="/" className="color-primary text-decoration-none fw-bold">Sign In</Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}