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
  const { token, logout } = useContext(AuthContext);
  const socket = useSocket(token);

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
          setDriverName(res.data.driverName || "Fleet Operator");
          setRouteStops(res.data.route?.stops || []);
        }
      } catch (err) { console.error(err); }
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

  const startTracking = () => {
    if (!socket || !busId) return;
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
    if (socket && busId) socket.emit("endTrip", busId);
    setSharing(false);
    localStorage.setItem("sharing", "false");
  };

  const handleLogoutAction = () => {
    if (sharing) stopTracking();
    logout();
    navigate("/login");
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
    if(!window.confirm("Submit final manifest to Admin?")) return;
    await api.post(`/bookings/finalize/${busId}`);
    alert("Data transmitted successfully.");
    fetchBookings();
  };

  const loadStudentOptions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await api.get(`/auth/students/search?query=${inputValue}`);
      return res.data.students.map((s) => ({
        value: s._id,
        label: `${s.name} (${s.email})`,
      }));
    } catch { return []; }
  };

  const addStudentManually = async () => {
    if (!selectedStudent || !manualSeat || !manualPickup || !manualDrop)
      return alert("Please fill all fields");
    try {
      await api.post(`/bookings/driver/add/${busId}`, {
        studentId: selectedStudent.value,
        seatNumber: manualSeat,
        pickupStop: manualPickup,
        dropStop: manualDrop,
      });
      setSelectedStudent(null);
      setManualSeat("");
      fetchBookings();
    } catch { alert("Error adding student"); }
  };

  if (!busId) return <div className="drv-loading-screen">Booting Console...</div>;

  return (
    <div className="drv-root">
      <div className="mesh-gradient-1"></div>
      
      <nav className="navbar-custom sticky-top">
        <div className="container d-flex justify-content-between align-items-center py-2 py-md-3">
          <div className="nav-logo">
            <div className="logo-dot"></div>
            KRMU <span className="text-blue">TRANSIT</span>
          </div>
          <div className="d-flex align-items-center gap-2 gap-md-3">
            <div className="text-end d-none d-sm-block">
              <span className="drv-user-label">OPERATOR</span>
              <div className="fw-bold small">{driverName}</div>
            </div>
            <button className="btn-logout-glass" onClick={handleLogoutAction}>
               <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-3 py-md-5 drv-content-layer">
        
        {/* 📊 TOP CONTROL STRIP */}
        <div className="bento-header-drv mb-4 mb-md-5">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-6 d-flex align-items-center gap-3 gap-md-4">
              <div className="drv-bus-sq">{busNo.replace(/\D/g, "") || "B"}</div>
              <div>
                <span className="role-label-blue">System Active</span>
                <h3 className="m-0 fw-800 bus-title-responsive">{busNo}</h3>
              </div>
            </div>
            <div className="col-12 col-md-6 d-grid d-md-flex justify-content-md-end gap-3">
              {sharing ? (
                <button className="drv-btn-stop w-100" onClick={stopTracking}>
                   <span className="pulse-dot"></span> STOP BROADCAST
                </button>
              ) : (
                <button className="drv-btn-start w-100" onClick={startTracking}>
                  START TRIP
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 📋 PARALLEL CONTAINERS */}
        <div className="row g-4 mb-4 mb-md-5">
          <div className="col-12 col-lg-6">
            <div className="unified-glass-card h-100 border-top-warning">
              <div className="p-3 p-md-4 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="fw-800 m-0 text-dark">PENDING REQUESTS</h6>
                <span className="count-badge bg-warning">{bookings.filter(b => b.status === "pending").length}</span>
              </div>
              <div className="drv-list-scroll">
                {bookings.filter(b => b.status === "pending").length === 0 && <p className="text-center text-muted mt-4">No pending requests</p>}
                {bookings.filter(b => b.status === "pending").map(b => (
                  <div key={b._id} className="drv-list-item-new">
                    <div className="flex-grow-1 me-2">
                      <div className="fw-bold text-dark small-mobile-text">{b.studentId?.name}</div>
                      <div className="text-muted extra-small-text">Seat {b.seatNumber} • {b.pickupStop}</div>
                    </div>
                    <button className="btn-approve-mini" onClick={() => updateStatus(b._id, "approved")}>APPROVE</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="unified-glass-card h-100 border-top-blue">
              <div className="p-3 p-md-4 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="fw-800 m-0 text-dark">ON-BOARD MANIFEST</h6>
                <span className="count-badge bg-primary">{bookings.filter(b => b.status === "approved").length}</span>
              </div>
              <div className="drv-list-scroll">
                {bookings.filter(b => b.status === "approved").length === 0 && <p className="text-center text-muted mt-4">No students on board</p>}
                {bookings.filter(b => b.status === "approved").map(b => (
                  <div key={b._id} className={`drv-list-item-new ${b.attendance === 'present' ? 'attended-row' : b.attendance === 'absent' ? 'absent-row' : ''}`}>
                    <div className="flex-grow-1 me-2">
                      <div className="fw-bold text-dark small-mobile-text">{b.studentId?.name}</div>
                      <div className="text-muted extra-small-text text-truncate" style={{maxWidth: '120px'}}>{b.pickupStop} → {b.dropStop}</div>
                    </div>
                    <div className="d-flex gap-1 gap-md-2">
                      <button className={`btn-att-pill p-btn ${b.attendance === 'present' ? 'active' : ''}`} onClick={() => markAttendance(b._id, "present")}>P</button>
                      <button className={`btn-att-pill a-btn ${b.attendance === 'absent' ? 'active' : ''}`} onClick={() => markAttendance(b._id, "absent")}>A</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-5 d-grid d-md-block px-3">
           <button className="btn-sync-cloud w-100" style={{maxWidth: '500px'}} onClick={submitFinal}>
             <i className="bi bi-cloud-check-fill me-2"></i> SUBMIT TO ADMIN
           </button>
        </div>

        {/* 📝 FULL WIDTH MANUAL ENTRY */}
        <div className="manual-entry-section-full shadow-lg">
           <div className="manual-entry-header-dark p-3 p-md-4 d-flex align-items-center gap-3">
              <div className="icon-circle-blue d-none d-sm-flex"><i className="bi bi-person-plus"></i></div>
              <div>
                <h4 className="fw-800 m-0 text-white manual-title-res">Manual Boarding</h4>
                <p className="m-0 text-white-50 small">Register students boarding now.</p>
              </div>
           </div>
           
           <div className="p-3 p-md-5">
             <div className="row flex-column g-4">
                <div className="col-12">
                   <label className="manual-label-light">1. Identify Student</label>
                   <AsyncSelect
                      cacheOptions
                      loadOptions={loadStudentOptions}
                      value={selectedStudent}
                      onChange={setSelectedStudent}
                      className="manual-async-select-custom"
                      placeholder="Search name..."
                    />
                </div>
                <div className="col-12">
                   <label className="manual-label-light">2. Assign Seat</label>
                   <input type="number" className="manual-input-large" placeholder="Seat #" value={manualSeat} onChange={(e) => setManualSeat(e.target.value)} />
                </div>
                <div className="col-12">
                   <label className="manual-label-light">3. Pickup Location</label>
                   <select className="manual-input-large" value={manualPickup} onChange={(e) => setManualPickup(e.target.value)}>
                     <option value="">Choose Stop</option>
                     {routeStops.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                   </select>
                </div>
                <div className="col-12">
                   <label className="manual-label-light">4. Drop Location</label>
                   <select className="manual-input-large" value={manualDrop} onChange={(e) => setManualDrop(e.target.value)}>
                     <option value="">Choose Stop</option>
                     {routeStops.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                   </select>
                </div>
                <div className="col-12 pt-2">
                   <button className="btn-manual-finalize w-100" onClick={addStudentManually}>
                      <i className="bi bi-check-circle-fill me-2"></i> REGISTER & BOARD
                   </button>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}