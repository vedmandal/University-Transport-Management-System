import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./AdminBusList.css"; // Reuse the same admin styles

export default function AdminBusList() {
  const [buses, setBuses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await api.get("/bus/get-bus");
        setBuses(res.data.allBus);
      } catch (err) {
        console.error("Error fetching buses");
      }
    };
    fetchBuses();
  }, []);

  return (
    <div className="container-fluid py-2">
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Fleet Management</h4>
          <p className="text-muted small">Monitor and manage all university transport vehicles</p>
        </div>
        <div className="bg-soft-primary px-3 py-2 rounded-3">
            <span className="text-primary fw-bold">Active Buses: {buses.length}</span>
        </div>
      </div>

      <div className="row">
        {buses.length === 0 ? (
          <div className="col-12 text-center py-5">
             <p className="text-muted">No buses found in the system.</p>
          </div>
        ) : (
          buses.map((bus) => (
            <div key={bus._id} className="col-md-6 col-lg-4 mb-4">
              <div className="bus-card shadow-sm border-0 h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bus-icon-circle me-3">
                      <i className="bi bi-bus-front-fill"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{bus.busNo}</h5>
                      <span className="badge bg-success-soft text-success small">Operational</span>
                    </div>
                  </div>

                  <div className="route-detail-box mb-4">
                    <label className="text-uppercase text-muted small fw-bold d-block mb-1">Assigned Route</label>
                    <div className="d-flex align-items-center">
                        <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                        <span className="text-dark fw-semibold">
                          {bus.routeId?.routeName || "No Route Assigned"}
                        </span>
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        className="btn btn-track-primary w-100 py-2 fw-bold"
                        onClick={() => navigate(`/admin/track/${bus._id}`)}
                      >
                        <i className="bi bi-radar me-2"></i>Track
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        className="btn btn-attendance-secondary w-100 py-2 fw-bold"
                        onClick={() => navigate(`/admin/attendance/${bus._id}`)}
                      >
                        <i className="bi bi-clipboard-check me-2"></i>Logs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}