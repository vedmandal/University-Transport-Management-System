import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import "./AddDriver.css"; 

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDrivers = async () => {
    try {
      const res = await api.get("/auth/get-drivers");
      setDrivers(res.data.drivers);
    } catch {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  if (loading) {
    return (
      <div className="adm-loader-container">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="adm-page-content">
      {/* HEADER SECTION */}
      <div className="adm-header-flex mb-4">
        <div>
          <h4 className="adm-section-title">Registered Drivers</h4>
          <p className="adm-section-subtitle">Overview of all active drivers in the system</p>
        </div>
        <div className="adm-count-pill">
          Total: {drivers.length}
        </div>
      </div>

      <div className="row g-4">
        {drivers.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div className="adm-empty-state">
              <span className="adm-empty-icon">📭</span>
              <p className="text-muted">No drivers found in the database.</p>
            </div>
          </div>
        ) : (
          drivers.map((driver) => (
            <div key={driver._id} className="col-md-6 col-lg-4">
              <div className="adm-driver-card shadow-sm animate-fadeIn">
                <div className="adm-card-top">
                  <div className="adm-avatar-circle">
                    {driver.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="adm-name-meta">
                    <h5 className="adm-driver-name">{driver.name}</h5>
                    <span className="adm-verified-badge">VERIFIED DRIVER</span>
                  </div>
                </div>

                <div className="adm-driver-details-box">
                  <div className="adm-detail-row">
                    <span className="adm-detail-icon">📧</span>
                    <span className="adm-detail-text">{driver.email}</span>
                  </div>
                  <div className="adm-detail-row">
                    <span className="adm-detail-icon">🛡️</span>
                    <span className="adm-detail-text">Status: <strong className="text-success">Active</strong></span>
                  </div>
                </div>

                <button className="adm-btn-profile">
                  VIEW PROFILE
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}