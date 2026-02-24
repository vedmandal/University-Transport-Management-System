import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./AdminBusList.css"; 

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
    <div className="adm-page-content">
      {/* HEADER SECTION */}
      <div className="adm-header-flex mb-4">
        <div>
          <h4 className="adm-section-title">Fleet Management</h4>
          <p className="adm-section-subtitle">Monitor and manage all university transport vehicles</p>
        </div>
        <div className="adm-count-pill">
            Active Buses: {buses.length}
        </div>
      </div>

      <div className="row g-4">
        {buses.length === 0 ? (
          <div className="col-12 text-center py-5">
             <div className="adm-empty-state">
                <span className="adm-empty-icon">🚌</span>
                <p className="text-muted">No buses found in the system.</p>
             </div>
          </div>
        ) : (
          buses.map((bus) => (
            <div key={bus._id} className="col-md-6 col-lg-4">
              <div className="adm-bus-card animate-fadeIn">
                <div className="adm-bus-header">
                  <div className="adm-bus-icon-wrapper">
                    🚌
                  </div>
                  <div className="adm-bus-meta">
                    <h5 className="adm-bus-number">{bus.busNo}</h5>
                    <span className="adm-status-tag">Operational</span>
                  </div>
                </div>

                <div className="adm-route-info-container">
                  <label className="adm-info-label">ASSIGNED ROUTE</label>
                  <div className="adm-route-display">
                      <span className="adm-route-dot"></span>
                      <span className="adm-route-name">
                        {bus.routeId?.routeName || "No Route Assigned"}
                      </span>
                  </div>
                </div>

                <div className="adm-card-footer-actions">
                  <button
                    className="adm-btn-track"
                    onClick={() => navigate(`/admin/track/${bus._id}`)}
                  >
                    Track
                  </button>
                  <button
                    className="adm-btn-logs"
                    onClick={() => navigate(`/admin/attendance/${bus._id}`)}
                  >
                    Logs
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}