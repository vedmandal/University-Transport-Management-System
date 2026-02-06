import api from "../api/axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { socket } from "../socket";
import "./DriverDashboard.css"; 

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [busId, setBusId] = useState(null);
  const [busNo, setBusNo] = useState("");
  const [sharing, setSharing] = useState(false);
  const watchIdRef = useRef(null);

  // 🚪 LOGOUT HANDLER
  const handleLogout = () => {
    // 1. Stop GPS if it's running
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    // 2. Clear Session
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // 3. Disconnect Socket
    socket.disconnect();
    // 4. Redirect
    navigate("/");
  };

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await api.get("/bus/my-bus");
        setBusId(res.data.busId);
        setBusNo(res.data.busNo || "Active Bus");
      } catch {
        console.error("Failed to fetch bus");
      }
    };
    fetchBus();
  }, []);

  useEffect(() => {
    if (!busId) return;
    const joinRoom = () => socket.emit("joinBus", busId);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    return () => socket.off("connect", joinRoom);
  }, [busId]);

  useEffect(() => {
    if (!busId || !sharing) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("sendLocation", {
          busId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error("Location error:", err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [busId, sharing]);

  if (!busId) {
    return (
      <div className="container vh-100 d-flex justify-content-center align-items-center bg-dark">
        <div className="card border-0 shadow-lg p-4 text-center bg-secondary text-white position-relative">
          {/* Logout even if no bus is assigned */}
          <button 
            className="btn btn-sm btn-outline-light position-absolute top-0 end-0 m-2"
            onClick={handleLogout}
          >
            Logout
          </button>
          <i className="bi bi-exclamation-triangle fs-1 mb-3 text-warning"></i>
          <h4 className="fw-bold">No Bus Assigned</h4>
          <p className="opacity-75">Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#0f0f1a" }}>
      {/* 🔴 TOP NAV */}
      <nav className="navbar navbar-dark bg-dark-header border-bottom border-secondary border-opacity-10 px-4 py-3">
        <span className="navbar-brand fw-bold d-flex align-items-center">
          <div className={`status-dot ${sharing ? 'pulse-green' : 'bg-secondary'} me-2`}></div> 
          Driver Terminal
        </span>
        
        <div className="d-flex align-items-center gap-3">
          <span className="text-white-50 small d-none d-md-block">V 2.0.4</span>
          {/* LOGOUT BUTTON */}
          <button 
            className="btn btn-logout-driver d-flex align-items-center gap-2"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="driver-card shadow-lg border-0 overflow-hidden">
              {/* BUS HEADER */}
              <div className="p-4 bg-white text-center border-bottom">
                <div className="bus-avatar mx-auto mb-3">
                  <i className="bi bi-bus-front text-primary fs-2"></i>
                </div>
                <h3 className="fw-bold text-dark mb-1">{busNo}</h3>
                <code className="text-muted small fw-bold">ID: {busId.substring(0, 12)}</code>
              </div>

              {/* ACTION AREA */}
              <div className="p-4 bg-light">
                {!sharing ? (
                  <div className="text-center">
                    <div className="alert bg-white border mb-4 py-3">
                       <i className="bi bi-geo-alt text-muted me-2"></i>
                       <span className="text-muted small fw-semibold">Ready to begin tracking?</span>
                    </div>
                    <button
                      className="btn btn-emerald btn-lg w-100 py-3 fw-bold shadow"
                      onClick={() => setSharing(true)}
                    >
                      🚀 START TRIP
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="live-status-card mb-4">
                       <div className="pulse-container mb-2">
                          <span className="dot pulse"></span>
                       </div>
                       <h6 className="text-success fw-bold mb-0">LIVE TRACKING ACTIVE</h6>
                       <small className="text-muted">Students can see your location</small>
                    </div>

                    <button
                      className="btn btn-stop-trip btn-lg w-100 py-3 fw-bold"
                      onClick={() => setSharing(false)}
                    >
                      🛑 END TRIP
                    </button>
                  </div>
                )}
              </div>

              {/* FOOTER INFO */}
              <div className="p-3 bg-white text-center border-top">
                <div className="row g-0">
                  <div className="col-6 border-end">
                    <small className="d-block text-muted">GPS Quality</small>
                    <span className="text-success fw-bold">Excellent</span>
                  </div>
                  <div className="col-6">
                    <small className="d-block text-muted">Network</small>
                    <span className="text-primary fw-bold">Stable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}