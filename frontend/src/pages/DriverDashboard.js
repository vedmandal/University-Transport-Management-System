import api from "../api/axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import AsyncSelect from "react-select/async";
import "./DriverDashboard.css";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const watchIdRef = useRef(null);
  
  const [busId, setBusId] = useState(null);
  const [busNo, setBusNo] = useState("");
  const [driverName, setDriverName] = useState(""); 
  const [routeStops, setRouteStops] = useState([]);
  const [sharing, setSharing] = useState(() => localStorage.getItem("sharing") === "true");
  const [bookings, setBookings] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [manualSeat, setManualSeat] = useState("");
  const [manualPickup, setManualPickup] = useState("");
  const [manualDrop, setManualDrop] = useState("");

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
      } catch (err) { console.error("Data Fetch Error:", err); }
    };
    fetchBusData();
  }, []);

  const fetchBookings = async () => {
    if (!busId) return;
    try {
      const res = await api.get(`/bookings/driver/${busId}`);
      setBookings(res.data.bookings || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (busId) fetchBookings(); }, [busId]);

  const handleLogout = () => {
    if (sharing) stopTracking();
    localStorage.clear();
    navigate("/login");
  };

  const startTracking = () => {
    if (!busId) return;
    if (!socket.connected) socket.connect();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("sendLocation", { busId, lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    setSharing(true);
    localStorage.setItem("sharing", "true");
  };

  const stopTracking = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    setSharing(false);
    localStorage.setItem("sharing", "false");
  };

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

  const loadStudentOptions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await api.get(`/auth/students/search?query=${inputValue}`);
      return res.data.students.map((s) => ({ value: s._id, label: `${s.name} (${s.email})` }));
    } catch (err) { return []; }
  };

  const addStudentManually = async () => {
    if (!selectedStudent || !manualSeat || !manualPickup || !manualDrop) return alert("Fill all fields");
    try {
      await api.post(`/bookings/driver/add/${busId}`, {
        studentId: selectedStudent.value, seatNumber: manualSeat, pickupStop: manualPickup, dropStop: manualDrop
      });
      setSelectedStudent(null); setManualSeat(""); fetchBookings();
    } catch (err) { alert("Error adding student"); }
  };

  if (!busId) return <div className="drv-loading-screen">Terminal Booting...</div>;

  return (
    <div className="drv-page-container">
      {/* 1. HEADER */}
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
            <button className="drv-logout-btn" onClick={handleLogout}>LOGOUT</button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* 2. DYNAMIC STATUS BANNER */}
        <div className="drv-status-banner mb-3">
          {sharing ? (
            <div className="drv-msg drv-msg-active">Started sending location</div>
          ) : (
            <div className="drv-msg drv-msg-done">Shift completed. Great work today!</div>
          )}
        </div>
        
        {/* 3. VEHICLE CONTROL BAR */}
        <div className="drv-control-bar shadow-sm mb-4">
          <div className="drv-bus-id-box">
            <div className="drv-bus-sq-dark">{busNo.replace(/\D/g,'') || 'B'}</div>
            <div className="drv-bus-meta">
              <span className="drv-meta-label">VEHICLE ID</span>
              <span className="drv-meta-val">{busNo}</span>
            </div>
          </div>
          <div className="drv-trip-toggle">
            {!sharing ? (
              <button className="drv-btn-start" onClick={startTracking}>START SHIFT</button>
            ) : (
              <button className="drv-btn-stop" onClick={stopTracking}>END SHIFT</button>
            )}
          </div>
        </div>

        {/* 4. LISTS */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="drv-list-card">
              <div className="drv-card-title yellow-head">PENDING REQUESTS</div>
              <div className="drv-card-scroll">
                {bookings.filter(b => b.status === "pending").map(b => (
                  <div key={b._id} className="drv-list-item">
                    <div className="drv-item-text">
                       <span className="drv-student-name">{b.studentId?.name}</span>
                       <span className="drv-seat-no">Seat: {b.seatNumber}</span>
                    </div>
                    <button className="drv-btn-accept" onClick={() => updateStatus(b._id, "approved")}>Accept</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="drv-list-card">
              <div className="drv-card-title blue-head">ON-BOARD MANIFEST</div>
              <div className="drv-card-scroll">
                {bookings.filter(b => b.status === "approved").map(b => (
                  <div key={b._id} className={`drv-list-item ${b.attendance === 'present' ? 'row-active' : ''}`}>
                    <div className="drv-item-text">
                       <span className="drv-student-name">{b.studentId?.name}</span>
                       <span className="drv-route-info">{b.pickupStop} → {b.dropStop}</span>
                    </div>
                    <button className={`drv-btn-mark ${b.attendance === 'present' ? 'mark-on' : ''}`} onClick={() => markAttendance(b._id, "present")}>
                      {b.attendance === 'present' ? 'ONBOARD' : 'MARK'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button className="drv-btn-sync mb-5" onClick={submitFinal}>SYNC DATA TO CLOUD</button>

        {/* 5. MANUAL FORM */}
        <div className="drv-form-card shadow-sm mb-5">
            <div className="drv-form-header">Manual Boarding Entry</div>
            <div className="drv-form-content">
                <div className="drv-form-group">
                    <label className="drv-label">Search Student</label>
                    <AsyncSelect cacheOptions loadOptions={loadStudentOptions} value={selectedStudent} onChange={setSelectedStudent} className="drv-select-wrap" />
                </div>
                <div className="drv-form-group">
                    <label className="drv-label">Seat Number</label>
                    <input type="number" className="drv-form-input" value={manualSeat} onChange={(e) => setManualSeat(e.target.value)} />
                </div>
                <div className="drv-form-group">
                    <label className="drv-label">Pickup Stop</label>
                    <select className="drv-form-input" value={manualPickup} onChange={(e) => setManualPickup(e.target.value)}>
                        <option value="">Select Stop</option>
                        {routeStops.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                <div className="drv-form-group">
                    <label className="drv-label">Drop-off Point</label>
                    <select className="drv-form-input" value={manualDrop} onChange={(e) => setManualDrop(e.target.value)}>
                        <option value="">Select Point</option>
                        {routeStops.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                <button className="drv-btn-submit" onClick={addStudentManually}>CONFIRM ENTRY</button>
            </div>
        </div>
      </div>
    </div>
  );
}