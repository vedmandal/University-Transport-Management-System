import api from "../api/axios";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import "./SeatLayout.css";

export default function SeatLayout({ busId, route, totalSeats, disabled }) {
  const [bookedSeats, setBookedSeats] = useState([]);
  const [pickupStop, setPickupStop] = useState("");
  const [dropStop, setDropStop] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshBookedSeats = useCallback(async () => {
    if (!busId) return;
    try {
      const res = await api.get(`/bookings/bus/${busId}`);
      const booked = res.data.bookings.map((b) => b.seatNumber);
      setBookedSeats(booked);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load seat data");
    }
  }, [busId]);

  useEffect(() => {
    refreshBookedSeats();
    setPickupStop("");
    setDropStop("");
  }, [busId, refreshBookedSeats]);

  const bookSeat = async (seatNumber) => {
    if (loading || disabled) return;
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
      await api.post("/bookings/create", {
        busId,
        seatNumber,
        pickupStop,
        dropStop,
      });
      toast.success(`Seat ${seatNumber} request sent to driver`);
      setBookedSeats((prev) => [...prev, seatNumber]);
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Booking failed";
      toast.error(serverMessage);
      if (serverMessage.toLowerCase().includes("taken") || serverMessage.toLowerCase().includes("booked")) {
        refreshBookedSeats();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!busId) return null;
  if (disabled) return <div className="alert alert-info shadow-sm rounded-3">You already have an active booking for this trip.</div>;

  return (
    <div className="seat-booking-container p-4 bg-white rounded-4 shadow-sm mx-auto" style={{ maxWidth: '450px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-dark m-0">Select Your Seat</h5>
        <button className="btn btn-refresh-premium" onClick={refreshBookedSeats}>
          Refresh Map
        </button>
      </div>

      {/* STOP SELECTION - MODERN UI */}
      <div className="stop-selection-card mb-4">
        <div className="row g-3">
          <div className="col-6">
            <div className="custom-input-group">
              <label className="input-label">📍 Pickup</label>
              <select className="premium-select" value={pickupStop} onChange={(e) => setPickupStop(e.target.value)}>
                <option value="">Boarding...</option>
                {route?.stops?.map((stop) => <option key={stop._id} value={stop.name}>{stop.name}</option>)}
              </select>
            </div>
          </div>
          <div className="col-6">
            <div className="custom-input-group">
              <label className="input-label">🏁 Drop</label>
              <select className="premium-select" value={dropStop} onChange={(e) => setDropStop(e.target.value)}>
                <option value="">Destination...</option>
                {route?.stops?.map((stop) => <option key={stop._id} value={stop.name}>{stop.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* BUS CABIN STRUCTURE */}
      <div className="bus-cabin p-4 shadow-inner">
        <div className="d-flex justify-content-between align-items-center mb-5 px-2">
          <div className="steering-wheel">☸️</div>
          <div className="entry-label">ENTRY</div>
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
                >
                  <div className="seat-top"></div>
                  <span className="seat-number">{seatNo}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* LEGEND */}
      <div className="d-flex justify-content-center gap-4 mt-4 py-2 border-top">
        <div className="d-flex align-items-center gap-2">
          <div className="legend-box available"></div>
          <small className="fw-bold text-muted">Available</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="legend-box booked"></div>
          <small className="fw-bold text-muted">Booked</small>
        </div>
      </div>
    </div>
  );
}