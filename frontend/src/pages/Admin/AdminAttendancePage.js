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

  return (
    <div className="container-fluid py-2">
      {/* HEADER & DATE SELECTOR */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Student Attendance</h4>
          <p className="text-muted small">Viewing boarding logs for Bus ID: <span className="text-primary fw-bold">{busId.substring(0, 8)}...</span></p>
        </div>
        
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <div className="date-input-wrapper">
            <input
              type="date"
              className="form-control custom-input-light border-0 shadow-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: '8px 15px' }}
            />
          </div>
          <button className="btn btn-action px-3 shadow-sm" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i>Export
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="summary-pill d-flex align-items-center p-3 shadow-sm bg-white rounded-3 border border-light">
             <div className="icon-box bg-soft-primary text-primary me-3">
               <i className="bi bi-people-fill"></i>
             </div>
             <div>
               <h6 className="mb-0 fw-bold">{attendance.length}</h6>
               <small className="text-muted">Students Boarded</small>
             </div>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="table-responsive bg-white rounded-4 shadow-sm border p-2">
        <table className="table table-hover mb-0 align-middle">
          <thead className="border-bottom text-uppercase small letter-spacing-1">
            <tr className="text-muted">
              <th className="ps-4 py-3">#</th>
              <th>Student Details</th>
              <th>Contact Info</th>
              <th className="text-center">Seat No.</th>
              <th className="pe-4 text-end">Status</th>
            </tr>
          </thead>

          <tbody className="border-0">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x d-block fs-1 mb-2 opacity-50"></i>
                  No boarding records found for this date.
                </td>
              </tr>
            ) : (
              attendance.map((b, i) => (
                <tr key={b._id} className="border-bottom-0">
                  <td className="ps-4 text-muted">{i + 1}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm me-2">{b.studentId?.name?.charAt(0)}</div>
                      <span className="fw-bold text-dark">{b.studentId?.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{b.studentId?.email}</td>
                  <td className="text-center">
                    <span className="badge bg-light text-dark fw-bold border p-2">
                      {b.seatNumber}
                    </span>
                  </td>
                  <td className="pe-4 text-end">
                    <span className="badge bg-success-soft text-success px-3 py-2 rounded-pill">
                      Boarded
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