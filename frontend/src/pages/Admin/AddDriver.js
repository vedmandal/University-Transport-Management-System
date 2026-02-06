import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import "./AddDriver.css"; // Reuse your admin styles

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
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Registered Drivers</h4>
          <p className="text-muted small">Overview of all active drivers in the system</p>
        </div>
        <span className="badge bg-soft-primary text-primary px-3 py-2">
          Total: {drivers.length}
        </span>
      </div>

      <div className="row">
        {drivers.length === 0 && (
          <div className="col-12 text-center py-5">
            <p className="text-muted">No drivers found in the database.</p>
          </div>
        )}

        {drivers.map((driver) => (
          <div key={driver._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card driver-card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar-circle me-3">
                    {driver.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="card-title fw-bold text-dark mb-0">
                      {driver.name}
                    </h5>
                    <span className="text-primary small fw-semibold text-uppercase tracking-wider" style={{fontSize: '10px'}}>
                      Verified Driver
                    </span>
                  </div>
                </div>

                <div className="driver-info-box p-3 rounded-3 mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-envelope text-muted me-2"></i>
                    <span className="text-dark small text-truncate">{driver.email}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-check text-muted me-2"></i>
                    <span className="text-muted small">Status: Active</span>
                  </div>
                </div>

                <button className="btn btn-outline-primary btn-sm w-100 rounded-2 py-2">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}