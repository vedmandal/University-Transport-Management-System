import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import "./AdminAttendance.css";

export default function AdminBusAttendance() {
  const { busId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const res = await api.get(`/bookings/attendance/${busId}?date=${date}`);
        setAttendance(res.data.attendance);
      } catch (err) {
        console.error("Failed to load attendance");
      }
    };
    loadAttendance();
  }, [busId, date]);

  const handlePrint = () => window.print();

  const total = attendance.length;
  const present = attendance.filter((b) => b.attendance === "present").length;
  const absent = attendance.filter((b) => b.attendance === "absent").length;

  return (
    <div className="adm-page-content">
      {/* HEADER SECTION */}
      <div className="adm-header-flex mb-4 no-print">
        <div>
          <h4 className="adm-section-title">Bus Attendance Report</h4>
          <p className="adm-section-subtitle">
            Terminal ID: <span className="fw-bold text-primary">{busId.substring(0, 8)}</span>
          </p>
        </div>

        <div className="adm-header-actions">
          <input
            type="date"
            className="adm-date-picker"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="adm-btn-print" onClick={handlePrint}>
            <span>🖨️</span> PRINT REPORT
          </button>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="adm-summary-card shadow-sm">
            <span className="adm-summary-label">TOTAL BOOKINGS</span>
            <h2 className="adm-summary-value">{total}</h2>
            <div className="adm-progress-bg"><div className="adm-progress-bar" style={{width: '100%', background: '#6366f1'}}></div></div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="adm-summary-card shadow-sm">
            <span className="adm-summary-label text-success">PRESENT</span>
            <h2 className="adm-summary-value text-success">{present}</h2>
            <div className="adm-progress-bg">
                <div className="adm-progress-bar" style={{width: `${(present/total)*100}%`, background: '#10b981'}}></div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="adm-summary-card shadow-sm">
            <span className="adm-summary-label text-danger">ABSENT</span>
            <h2 className="adm-summary-value text-danger">{absent}</h2>
            <div className="adm-progress-bg">
                <div className="adm-progress-bar" style={{width: `${(absent/total)*100}%`, background: '#ef4444'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="adm-table-container shadow-sm animate-fadeIn">
        <table className="adm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Email Address</th>
              <th className="text-center">Seat</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="5" className="adm-table-empty">
                  No attendance records found for this date.
                </td>
              </tr>
            ) : (
              attendance.map((b, i) => (
                <tr key={b._id}>
                  <td className="adm-td-id">{i + 1}</td>
                  <td className="adm-td-main">{b.studentId?.name}</td>
                  <td className="adm-td-sub">{b.studentId?.email}</td>
                  <td className="text-center fw-bold">{b.seatNumber}</td>
                  <td className="text-center">
                    <span className={`adm-badge-status ${b.attendance}`}>
                      {b.attendance.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}