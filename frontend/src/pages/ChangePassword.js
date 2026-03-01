import React, { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./ParentDashboard.css"; // Reuse the same CSS

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    try {
      setLoading(true);
      await api.post("/auth/change-password", {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password updated successfully!");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-root">
      <div className="mesh-gradient-1"></div>
      <div className="container py-5 parent-content-layer">
        
        {/* Simple Header with Back Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="main-title-sm">Security</h2>
          <Link to="/parent-dashboard" className="btn-logout-glass text-dark border-dark">
            <i className="bi bi-arrow-left me-2"></i> Back to Map
          </Link>
        </div>

        <div className="unified-glass-card p-4 p-md-5 mx-auto" style={{maxWidth: '550px'}}>
          <div className="text-center mb-4">
            <div className="icon-badge mx-auto mb-3" style={{width: '60px', height: '60px', background: '#eff6ff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '1.5rem'}}>
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <h4 className="fw-800">Update Password</h4>
            <p className="text-muted small">Enter your temporary password and choose a new one.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label-custom">Current Password</label>
              <input
                type="password"
                className="unified-input"
                required
                value={formData.oldPassword}
                onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
              />
            </div>

            <div className="mb-3">
              <label className="form-label-custom">New Password</label>
              <input
                type="password"
                className="unified-input"
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              />
            </div>

            <div className="mb-4">
              <label className="form-label-custom">Confirm New Password</label>
              <input
                type="password"
                className="unified-input"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>

            <button type="submit" className="unified-btn-primary w-100 py-3" disabled={loading}>
              {loading ? "Processing..." : "Secure Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}