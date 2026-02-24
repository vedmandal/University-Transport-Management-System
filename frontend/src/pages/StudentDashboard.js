import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [myBooking, setMyBooking] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    socket.disconnect();
    navigate("/");
  };

  const fetchMyBooking = async (busId) => {
    try {
      const res = await api.get(`/bookings/my/${busId}`);
      setMyBooking(res.data.booking);
    } catch {
      setMyBooking(null);
    }
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
    fetchMyBooking(bus._id);
  };

  return (
    <div className="dashboard-root">
      {/* FIXED HEADER SECTION */}
      <header className="dashboard-header-premium">
        <div className="brand-group">
          <span className="brand-logo">🎓</span>
          <span className="brand-name">CampusCommute</span>
        </div>

        <button className="logout-btn-premium" onClick={handleLogout}>
          LOGOUT
        </button>
      </header>

      <div className="container-fluid p-4">
        <div className="row">
          {/* SIDEBAR */}
          <div className="col-lg-3 mb-4">
            <div className="sidebar-card-premium">
              <div className="p-3 border-bottom">
                <h6 className="fw-bold mb-0" style={{ color: "#1e293b" }}>Select Transit</h6>
              </div>
              <div className="bus-list-container">
                <BusList onSelectBus={handleSelectBus} />
              </div>
            </div>
          </div>

          {/* MAIN WORKSPACE */}
          <div className="col-lg-9">
            <div className="workspace-card-premium animate-fadeIn">
              
              {/* TABS */}
              <div className="tab-container-premium">
                <button
                  className={`tab-item ${activeTab === "track" ? "active" : ""}`}
                  onClick={() => setActiveTab("track")}
                >
                  Live Tracking
                </button>

                <button
                  className={`tab-item ${activeTab === "seat" ? "active" : ""}`}
                  onClick={() => setActiveTab("seat")}
                  disabled={!selectedBus}
                >
                  Reserve Seat
                </button>
              </div>

              <div className="card-body p-4">
                {/* TRACK TAB */}
                {activeTab === "track" && (
                  <div className="animate-fadeIn">
                    <h5 className="mb-3" style={{ color: "#1e293b", fontWeight: "700" }}>
                      {selectedBus
                        ? `Tracking Bus: ${selectedBus.busNo}`
                        : "Please select a bus from the list"}
                    </h5>
                    <div className="map-wrapper shadow-sm rounded-4 overflow-hidden" style={{ height: "500px" }}>
                      <BusMap busLocation={busLocation} />
                    </div>
                  </div>
                )}

                {/* SEAT TAB */}
                {activeTab === "seat" && selectedBus && (
                  <div className="animate-fadeIn">
                    {myBooking && (
                      <div className={`status-banner mb-4 ${myBooking.status}`}>
                        {myBooking.status === "pending" && "⏳ Your booking is pending driver approval."}
                        {myBooking.status === "approved" && "✅ Booking Approved! Show this to the driver."}
                        {myBooking.status === "rejected" && "❌ Booking Rejected. Please select another seat."}
                      </div>
                    )}

                    <SeatLayout
                      busId={selectedBus._id}
                      route={selectedBus.routeId}
                      totalSeats={selectedBus.totalSeats}
                      disabled={!!myBooking && myBooking.status !== "rejected"}
                    />
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