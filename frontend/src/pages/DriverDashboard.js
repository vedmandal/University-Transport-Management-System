import api from "../api/axios";
import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../socket";
import { AuthContext } from "../context/AuthContext";
import AsyncSelect from "react-select/async";
import "./DriverDashboard.css";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const watchIdRef = useRef(null);

  const { token } = useContext(AuthContext);
  const socket = useSocket(token);

  const [busId, setBusId] = useState(null);
  const [busNo, setBusNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [routeStops, setRouteStops] = useState([]);
  const [sharing, setSharing] = useState(
    () => localStorage.getItem("sharing") === "true"
  );
  const [bookings, setBookings] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [manualSeat, setManualSeat] = useState("");
  const [manualPickup, setManualPickup] = useState("");
  const [manualDrop, setManualDrop] = useState("");

  /* ================= FETCH BUS ================= */
  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const res = await api.get("/bus/my-bus");
        if (res.data.success) {
          setBusId(res.data.busId);
          setBusNo(res.data.busNo);
          setDriverName(res.data.driverName || "Driver");
          setRouteStops(res.data.route?.stops || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBusData();
  }, []);

  /* ================= FETCH BOOKINGS ================= */
  const fetchBookings = async () => {
    if (!busId) return;
    try {
      const res = await api.get(`/bookings/driver/${busId}`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (busId) fetchBookings();
  }, [busId]);

  /* ================= START TRACKING ================= */
  const startTracking = () => {
    if (!socket || !busId) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("sendLocation", {
          busId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    setSharing(true);
    localStorage.setItem("sharing", "true");
  };

  /* ================= STOP TRACKING ================= */
  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    if (socket && busId) {
      socket.emit("endTrip", busId);
    }

    setSharing(false);
    localStorage.setItem("sharing", "false");
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    if (sharing) stopTracking();
    if (socket) socket.disconnect();
    localStorage.clear();
    navigate("/login");
  };

  /* ================= BOOKING ACTIONS ================= */
  const updateStatus = async (id, status) => {
    await api.put(`/bookings/status/${id}`, { status });
    fetchBookings();
  };

  const markAttendance = async (id, attendance) => {
    await api.put(`/bookings/attendance/${id}`, { attendance });
    fetchBookings();
  };

  const submitFinal = async () => {
    await api.post(`/bookings/finalize/${busId}`);
    alert("Manifest Finalized.");
    fetchBookings();
  };

  /* ================= SEARCH STUDENT ================= */
  const loadStudentOptions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await api.get(
        `/auth/students/search?query=${inputValue}`
      );
      return res.data.students.map((s) => ({
        value: s._id,
        label: `${s.name} (${s.email})`,
      }));
    } catch {
      return [];
    }
  };

  const addStudentManually = async () => {
    if (!selectedStudent || !manualSeat || !manualPickup || !manualDrop)
      return alert("Fill all fields");

    try {
      await api.post(`/bookings/driver/add/${busId}`, {
        studentId: selectedStudent.value,
        seatNumber: manualSeat,
        pickupStop: manualPickup,
        dropStop: manualDrop,
      });

      setSelectedStudent(null);
      setManualSeat("");
      setManualPickup("");
      setManualDrop("");
      fetchBookings();
    } catch {
      alert("Error adding student");
    }
  };

  if (!busId)
    return <div className="drv-loading-screen">Terminal Booting...</div>;

  return (
    <div className="drv-page-container">
      {/* HEADER */}
      <nav className="drv-header shadow-sm">
        <div className="drv-header-inner">
          <div className="drv-brand">
            <div className="drv-logo-sq">🚌</div>
            <div className="drv-brand-info">
              <span className="drv-brand-name">CampusCommute</span>
              <span className="drv-brand-tag">DRIVER CONSOLE</span>
            </div>
          </div>
          <div className="drv-header-actions">
            <div className="drv-user-info">
              <span className="drv-user-label">LOGGED IN</span>
              <span className="drv-user-val">{driverName}</span>
            </div>
            <button className="drv-logout-btn" onClick={handleLogout}>
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">

        {/* STATUS */}
        <div className="drv-status-banner mb-3">
          {sharing ? (
            <div className="drv-msg drv-msg-active">
              Started sending location
            </div>
          ) : (
            <div className="drv-msg drv-msg-done">
              Shift completed.
            </div>
          )}
        </div>

        {/* CONTROL BAR */}
        <div className="drv-control-bar shadow-sm mb-4">
          <div className="drv-bus-id-box">
            <div className="drv-bus-sq-dark">
              {busNo.replace(/\D/g, "") || "B"}
            </div>
            <div className="drv-bus-meta">
              <span className="drv-meta-label">VEHICLE ID</span>
              <span className="drv-meta-val">{busNo}</span>
            </div>
          </div>

          <div className="drv-trip-toggle">
            {!sharing ? (
              <button className="drv-btn-start" onClick={startTracking}>
                START SHIFT
              </button>
            ) : (
              <button className="drv-btn-stop" onClick={stopTracking}>
                END SHIFT
              </button>
            )}
          </div>
        </div>

        {/* BOOKING LISTS */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="drv-list-card">
              <div className="drv-card-title yellow-head">
                PENDING REQUESTS
              </div>
              <div className="drv-card-scroll">
                {bookings.filter(b => b.status === "pending").map(b => (
                  <div key={b._id} className="drv-list-item">
                    <div className="drv-item-text">
                      <span className="drv-student-name">
                        {b.studentId?.name}
                      </span>
                      <span className="drv-seat-no">
                        Seat: {b.seatNumber}
                      </span>
                    </div>
                    <button
                      className="drv-btn-accept"
                      onClick={() => updateStatus(b._id, "approved")}
                    >
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="drv-list-card">
              <div className="drv-card-title blue-head">
                ON-BOARD MANIFEST
              </div>
              <div className="drv-card-scroll">
                {bookings.filter(b => b.status === "approved").map(b => (
                  <div key={b._id} className="drv-list-item">
                    <div className="drv-item-text">
                      <span className="drv-student-name">
                        {b.studentId?.name}
                      </span>
                      <span className="drv-route-info">
                        {b.pickupStop} → {b.dropStop}
                      </span>
                    </div>
                    <button
                      className="drv-btn-mark"
                      onClick={() => markAttendance(b._id, "present")}
                    >
                      MARK
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button className="drv-btn-sync mb-5" onClick={submitFinal}>
          SYNC DATA TO CLOUD
        </button>

        {/* MANUAL ENTRY */}
        <div className="drv-form-card shadow-sm mb-5">
          <div className="drv-form-header">
            Manual Boarding Entry
          </div>
          <div className="drv-form-content">
            <AsyncSelect
              cacheOptions
              loadOptions={loadStudentOptions}
              value={selectedStudent}
              onChange={setSelectedStudent}
              placeholder="Search student..."
            />

            <input
              type="number"
              placeholder="Seat Number"
              value={manualSeat}
              onChange={(e) => setManualSeat(e.target.value)}
            />

            <select
              value={manualPickup}
              onChange={(e) => setManualPickup(e.target.value)}
            >
              <option value="">Pickup Stop</option>
              {routeStops.map((s) => (
                <option key={s._id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={manualDrop}
              onChange={(e) => setManualDrop(e.target.value)}
            >
              <option value="">Drop Stop</option>
              {routeStops.map((s) => (
                <option key={s._id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <button onClick={addStudentManually}>
              CONFIRM ENTRY
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}