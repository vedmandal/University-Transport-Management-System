import api from "../api/axios";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import "./SeatLayout.css"; 

export default function SeatLayout({ busId, route, totalSeats }) {
  const [bookedSeats, setBookedSeats] = useState([]);
  const [pickupStop, setPickupStop] = useState("");
  const [dropStop, setDropStop] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔄 REFRESH LOGIC 
     Moved to a separate function so we can call it after a booking failure.
  */
  const refreshBookedSeats = useCallback(async () => {
    if (!busId) return;
    try {
      const res = await api.get(`/bookings/get-bus/${busId}`);
      // Assuming res.data.bookings is an array of objects containing seatNumber
      const booked = res.data.bookings.map((b) => b.seatNumber);
      setBookedSeats(booked);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load live seat data");
    }
  }, [busId]);

  useEffect(() => {
    refreshBookedSeats();
    setPickupStop("");
    setDropStop("");
  }, [busId, refreshBookedSeats]);

  const bookSeat = async (seatNumber) => {
    if (loading) return;

    // Frontend Validations
    if (!pickupStop || !dropStop) {
      toast.error("Please select pickup and drop stop");
      return;
    }
    if (pickupStop === dropStop) {
      toast.error("Pickup and drop stop cannot be same");
      return;
    }
    if (bookedSeats.includes(seatNumber)) {
      toast.error("This seat is already taken");
      return;
    }

    setLoading(true);
    try {
      await api.post("/bookings/create-booking", {
        busId,
        seatNumber,
        pickupStop,
        dropStop,
      });

      toast.success(`Seat ${seatNumber} booked successfully!`);
      // Optimistically update local state
      setBookedSeats((prev) => [...prev, seatNumber]);
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Booking failed";
      toast.error(serverMessage);

      /* 🛡️ CONCURRENCY HANDLING
         If the backend rejected the request because the seat was taken 
         in the last millisecond, we refresh the map immediately.
      */
      if (serverMessage.toLowerCase().includes("taken") || serverMessage.toLowerCase().includes("booked")) {
        refreshBookedSeats(); 
      }
    } finally {
      setLoading(false);
    }
  };

  if (!busId) return null;

  return (
    <div className="seat-booking-container p-4 bg-white rounded-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-dark m-0">Select Your Seat</h5>
        <button 
          className="btn btn-sm btn-outline-primary" 
          onClick={refreshBookedSeats}
          title="Refresh availability"
        >
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {/* 🚏 STOP SELECTION */}
      <div className="row mb-5">
        <div className="col-md-6 mb-3">
          <label className="custom-label">Pickup Point</label>
          <select
            className="form-select custom-input-light"
            value={pickupStop}
            onChange={(e) => setPickupStop(e.target.value)}
          >
            <option value="">Where from?</option>
            {route?.stops?.map((stop) => (
              <option key={stop._id} value={stop.name}>{stop.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label className="custom-label">Drop Point</label>
          <select
            className="form-select custom-input-light"
            value={dropStop}
            onChange={(e) => setDropStop(e.target.value)}
          >
            <option value="">Where to?</option>
            {route?.stops?.map((stop) => (
              <option key={stop._id} value={stop.name}>{stop.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🚌 BUS CABIN STRUCTURE */}
      <div className="bus-cabin p-4 mx-auto shadow-inner">
        <div className="driver-cabin d-flex justify-content-end mb-4 border-bottom pb-2">
           <div className="steering-wheel"><i className="bi bi-gear-wide-connected text-muted"></i></div>
        </div>

        <div className="seat-grid">
          {Array.from({ length: totalSeats }).map((_, i) => {
            const seatNo = i + 1;
            const isBooked = bookedSeats.includes(seatNo);

            return (
              <div key={seatNo} className="seat-wrapper">
                <button
                  className={`seat-btn ${isBooked ? "booked" : "available"}`}
                  disabled={isBooked || loading}
                  onClick={() => bookSeat(seatNo)}
                  style={{ cursor: isBooked ? "not-allowed" : "pointer" }}
                >
                  <span className="seat-top"></span>
                  <span className="seat-number">{seatNo}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ℹ️ LEGEND & STATUS */}
      <div className="d-flex justify-content-center gap-4 mt-5 pt-3 border-top">
        <div className="d-flex align-items-center gap-2">
          <div className="legend-box available"></div>
          <span className="small fw-bold text-muted">Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="legend-box booked"></div>
          <span className="small fw-bold text-muted">Booked</span>
        </div>
      </div>
    </div>
  );
}