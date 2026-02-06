import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for redirection
import { socket } from "../socket";
import BusList from "../components/BusList";
import BusMap from "../components/BusMap";
import SeatLayout from "../components/SeatLayout";
import api from "../api/axios";
import "./StudentDashboard.css"; 

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [selectedBus, setSelectedBus] = useState(null);
  const [busId, setBusId] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [activeTab, setActiveTab] = useState("track");

  // 🚪 Logout Handler
  const handleLogout = () => {
    // Clear local storage or session cookies
    localStorage.removeItem("token");
    localStorage.removeItem("role"); 
    
    // Disconnect socket if necessary
    socket.disconnect();
    
    // Redirect to login page
    navigate("/");
  };

  useEffect(() => {
    const handleReceiveLocation = (data) => setBusLocation(data);
    socket.on("receiveLocation", handleReceiveLocation);
    return () => socket.off("receiveLocation", handleReceiveLocation);
  }, []);

  useEffect(() => {
    if (!busId) return;
    const joinRoom = () => socket.emit("joinBus", busId);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    return () => socket.off("connect", joinRoom);
  }, [busId]);

  const handleSelectBus = async (bus) => {
    if (bus._id === selectedBus?._id) return;
    setSelectedBus(bus);
    setBusId(bus._id);
    setActiveTab("track");

    try {
      const res = await api.get(`/bus/${bus._id}/last-location`);
      setBusLocation(res.data?.lat ? res.data : null);
    } catch {
      setBusLocation(null);
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f4f7fe" }}>
      {/* 🌑 NAVIGATION BAR */}
      <nav className="navbar navbar-dark bg-dark-header px-4 py-3 shadow-sm border-bottom border-secondary border-opacity-10">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold fs-4 d-flex align-items-center">
            <i className="bi bi-geo-fill text-primary me-2"></i>
            CampusCommute
          </span>
          
          <div className="d-flex align-items-center gap-3">
            <div className="user-badge d-none d-md-flex align-items-center bg-white bg-opacity-10 px-3 py-1 rounded-pill">
              <small className="text-white-50 me-2">Student Portal</small>
              <div className="dot pulse-green"></div>
            </div>

            {/* 🚪 LOGOUT BUTTON */}
            <button 
              className="btn btn-logout d-flex align-items-center gap-2"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid p-4">
        {/* ... Rest of the component remains the same ... */}
        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
              <div className="card-header bg-white border-0 py-3">
                <h6 className="fw-bold text-dark mb-0">Select Transit</h6>
              </div>
              <div className="card-body p-0 bus-selection-container">
                <BusList onSelectBus={handleSelectBus} />
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
              <div className="bg-white border-bottom p-2">
                <ul className="nav nav-pills custom-student-tabs">
                  <li className="nav-item col-6 text-center">
                    <button
                      className={`nav-link w-100 fw-bold py-3 ${activeTab === "track" ? "active" : ""}`}
                      onClick={() => setActiveTab("track")}
                    >
                      <i className="bi bi-radar me-2"></i> Live Tracking
                    </button>
                  </li>
                  <li className="nav-item col-6 text-center">
                    <button
                      className={`nav-link w-100 fw-bold py-3 ${activeTab === "seat" ? "active" : ""}`}
                      onClick={() => setActiveTab("seat")}
                      disabled={!selectedBus}
                    >
                      <i className="bi bi-chair me-2"></i> Reserve Seat
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-0">
                <div style={{ display: activeTab === "track" ? "block" : "none" }}>
                  <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                    <span className="text-muted small">
                      {selectedBus ? `Currently Viewing: Bus ${selectedBus.busNo}` : "Please select a bus to track location"}
                    </span>
                    {busLocation && <span className="badge bg-soft-success text-success px-2 py-1 rounded">Live GPS Signal</span>}
                  </div>
                  <BusMap busLocation={busLocation} />
                </div>

                {activeTab === "seat" && (
                  <div className="p-4 animate-fadeIn">
                    {selectedBus ? (
                      <SeatLayout
                        busId={selectedBus._id}
                        route={selectedBus.routeId}
                        totalSeats={selectedBus.totalSeats}
                      />
                    ) : (
                      <div className="empty-state text-center py-5">
                        <i className="bi bi-bus-front fs-1 text-muted opacity-25"></i>
                        <h5 className="mt-3 text-muted">Select a bus from the left panel to book.</h5>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}