import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../socket";
import BusMap from "../components/BusMap";
import api from "../api/axios";
import "./ParentDashboard.css";

const ParentDashboard = () => {
  const { token, role, logout } = useContext(AuthContext);
  const socket = useSocket(token);

  const [bus, setBus] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [busLocation, setBusLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await api.get("/auth/parent/bus");
        setBus(res.data.bus);
        setStudentName(res.data.studentName);
        setBusLocation(res.data.bus?.lastLocation || null);
      } catch (err) {
        console.error("Failed to fetch parent bus:", err);
        setBus(null);
      } finally {
        setLoading(false);
      }
    };
  
    if (token && role === "parent") fetchBus();
  }, [token, role]);

  useEffect(() => {
    if (!socket || role !== "parent") return;
    socket.emit("joinParentBus");
  }, [socket, role]);

  useEffect(() => {
    if (!socket) return;
    const handleLocation = ({ lat, lng }) => {
      setBusLocation({ lat, lng });
    };
    socket.on("receiveLocation", handleLocation);
    return () => socket.off("receiveLocation", handleLocation);
  }, [socket]);

  if (loading) {
    return (
      <div className="unified-loader">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 fw-bold">Connecting to Transit Engine...</p>
      </div>
    );
  }

  return (
    <div className="parent-root">
      {/* Visual Background Elements */}
      <div className="mesh-gradient-1"></div>
      <div className="mesh-gradient-2"></div>

      <div className="container py-4 py-md-5 parent-content-layer">
        
        {/* HEADER BENTO SECTION */}
        <div className="bento-header mb-4 shadow-sm">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-6 text-center text-lg-start">
              <span className="role-label-blue">Live Tracking Active</span>
              <h2 className="main-title-sm">Parent Dashboard</h2>
              <p className="text-muted m-0 small">
                Monitoring transport for <span className="text-blue fw-bold">{studentName || "Student"}</span>
              </p>
            </div>
            <div className="col-12 col-lg-6">
              <div className="d-flex gap-2 gap-md-3 justify-content-center justify-content-lg-end align-items-center flex-wrap">
                {bus && (
                  <>
                    <div className="stat-pill-white">
                      <span className="label">BUS NO</span>
                      <span className="value">{bus.busNo}</span>
                    </div>
                    <div className="stat-pill-white border-blue">
                      <span className="label">ROUTE</span>
                      <span className="value text-truncate" style={{maxWidth: '120px'}}>{bus.routeId?.name || "N/A"}</span>
                    </div>
                  </>
                )}
                <button className="btn-logout-glass" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-md-2"></i>
                  <span className="d-none d-md-inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {!bus ? (
          <div className="unified-glass-card text-center p-5 mt-4">
            <i className="bi bi-bus-front text-muted display-1 mb-4"></i>
            <h2 className="fw-800">No Bus Assigned</h2>
            <p className="text-muted">Your child is not currently assigned to an active route.</p>
            <button className="unified-btn-primary mt-4 px-5" onClick={() => window.location.reload()}>
              Refresh Portal
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {/* LEFT COLUMN: MAP */}
            <div className="col-12 col-lg-8">
              <div className="map-container-glass">
                <div className="map-header">
                  <span className="live-indicator">
                    <span className="dot"></span> LIVE TELEMETRY
                  </span>
                </div>
                {/* Ensure your BusMap component doesn't have a height of 100vh internally */}
                <BusMap busLocation={busLocation} />
              </div>
            </div>

            {/* RIGHT COLUMN: INFO CARDS */}
            <div className="col-12 col-lg-4">
              <div className="row g-4">
                <div className="col-12 col-md-6 col-lg-12">
                  <div className="unified-glass-card-mini h-100">
                    <h6 className="fw-800 mb-3">
                      <i className="bi bi-info-circle me-2 text-primary"></i>Status Summary
                    </h6>
                    <div className="status-item">
                      <p className="mb-1 text-muted small">Current State</p>
                      <p className="fw-bold m-0">
                        {busLocation ? "Bus is in Motion" : "Bus is Stationary"}
                      </p>
                    </div>
                    <hr className="my-3 opacity-10" />
                    <div className="status-item">
                      <p className="mb-1 text-muted small">Last Signal</p>
                      <p className="fw-bold m-0">{new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-12">
                  <div className="unified-glass-card-mini student-bg h-100">
                    <h6 className="fw-800 mb-3">
                      <i className="bi bi-shield-lock me-2 text-primary"></i>Safety Protocol
                    </h6>
                    <p className="small text-muted mb-3">
                      Encrypted data channel v4.2 active. High-frequency beacons monitoring.
                    </p>
                    <div className="badge bg-white text-primary border-0 rounded-pill p-2 px-3 small fw-bold shadow-sm d-inline-block">
                      Secure Connection
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;