import api from "../api/axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import "./DriverDashboard.css";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const watchIdRef = useRef(null);

  const [busId, setBusId] = useState(null);
  const [busNo, setBusNo] = useState("");

  // ✅ Persist sharing state
  const [sharing, setSharing] = useState(() => {
    return localStorage.getItem("sharing") === "true";
  });

  /* ===============================
     SAVE SHARING STATE
  =============================== */
  useEffect(() => {
    localStorage.setItem("sharing", sharing);
  }, [sharing]);

  /* ===============================
     LOGOUT
  =============================== */
  const handleLogout = () => {
    stopTracking();

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("sharing");

    socket.disconnect();
    navigate("/");
  };

  /* ===============================
     FETCH ASSIGNED BUS
  =============================== */
  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await api.get("/bus/my-bus");
        setBusId(res.data.busId);
        setBusNo(res.data.busNo || "Active Bus");
      } catch (err) {
        console.error("Failed to fetch bus", err);
      }
    };
    fetchBus();
  }, []);

  /* ===============================
     JOIN BUS ROOM
  =============================== */
  useEffect(() => {
    if (!busId) return;

    const joinRoom = () => {
      socket.emit("joinBus", busId);
    };

    if (!socket.connected) {
      socket.connect();
    }

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    return () => socket.off("connect", joinRoom);
  }, [busId]);

  /* ===============================
     START TRACKING
  =============================== */
  const startTracking = () => {
    if (!busId) return;

    if (!("geolocation" in navigator)) {
      alert("Geolocation not supported");
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        console.log("GPS UPDATE:", latitude, longitude);

        socket.emit("sendLocation", {
          busId,
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => console.error("Location error:", err.message),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      }
    );

    setSharing(true);
  };

  /* ===============================
     STOP TRACKING
  =============================== */
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setSharing(false);
    localStorage.removeItem("sharing");
  };

  /* ===============================
     AUTO RESUME AFTER REFRESH
  =============================== */
  useEffect(() => {
    if (busId && sharing) {
      startTracking();
    }
    // eslint-disable-next-line
  }, [busId]);

  /* ===============================
     CLEANUP ON UNMOUNT
  =============================== */
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  /* ===============================
     UI (UNCHANGED STRUCTURE)
  =============================== */

  if (!busId) {
    return (
      <div className="container vh-100 d-flex justify-content-center align-items-center bg-dark">
        <div className="card border-0 shadow-lg p-4 text-center bg-secondary text-white position-relative">
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
      <nav className="navbar navbar-dark bg-dark-header border-bottom border-secondary border-opacity-10 px-4 py-3">
        <span className="navbar-brand fw-bold d-flex align-items-center">
          <div className={`status-dot ${sharing ? 'pulse-green' : 'bg-secondary'} me-2`}></div> 
          Driver Terminal
        </span>

        <div className="d-flex align-items-center gap-3">
          <span className="text-white-50 small d-none d-md-block">V 2.0.4</span>
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
              <div className="p-4 bg-white text-center border-bottom">
                <div className="bus-avatar mx-auto mb-3">
                  <i className="bi bi-bus-front text-primary fs-2"></i>
                </div>
                <h3 className="fw-bold text-dark mb-1">{busNo}</h3>
                <code className="text-muted small fw-bold">
                  ID: {busId.substring(0, 12)}
                </code>
              </div>

              <div className="p-4 bg-light">
                {!sharing ? (
                  <div className="text-center">
                    <div className="alert bg-white border mb-4 py-3">
                      <i className="bi bi-geo-alt text-muted me-2"></i>
                      <span className="text-muted small fw-semibold">
                        Ready to begin tracking?
                      </span>
                    </div>
                    <button
                      className="btn btn-emerald btn-lg w-100 py-3 fw-bold shadow"
                      onClick={startTracking}
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
                      <h6 className="text-success fw-bold mb-0">
                        LIVE TRACKING ACTIVE
                      </h6>
                      <small className="text-muted">
                        Students can see your location
                      </small>
                    </div>

                    <button
                      className="btn btn-stop-trip btn-lg w-100 py-3 fw-bold"
                      onClick={stopTracking}
                    >
                      🛑 END TRIP
                    </button>
                  </div>
                )}
              </div>

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