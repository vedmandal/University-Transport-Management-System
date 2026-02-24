import api from "../api/axios";
import { useEffect, useState } from "react";
import "./BusList.css"; 

export default function BusList({ onSelectBus }) {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/bus/get-bus");
        setBuses(res.data.allBus || []);
      } catch {
        setError("Failed to load buses");
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  useEffect(() => {
    if (buses.length > 0 && !selectedBusId) {
      setSelectedBusId(buses[0]._id);
      onSelectBus(buses[0]);
    }
  }, [buses, selectedBusId, onSelectBus]);

  if (loading) return (
    <div className="bus-loader p-5 text-center">
      <div className="spinner-border text-indigo" role="status"></div>
      <div className="mt-3 text-muted small fw-bold">SYNCING FLEET...</div>
    </div>
  );

  return (
    <div className="bus-selection-container">
      <div className="d-flex align-items-center justify-content-between mb-4 px-2">
        <h5 className="sidebar-title">Available Buses</h5>
        <span className="count-badge">{buses.length}</span>
      </div>
      
      <div className="bus-list-scroll">
        {buses.map((bus) => {
          const isSelected = selectedBusId === bus._id;
          return (
            <div
              key={bus._id}
              className={`bus-premium-card ${isSelected ? "active" : ""}`}
              onClick={() => {
                setSelectedBusId(bus._id);
                onSelectBus(bus);
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bus-plate">
                  <span className="plate-label">VEHICLE</span>
                  <span className="plate-number">{bus.busNo}</span>
                </div>
                <div className="status-indicator">
                  <div className={`status-dot ${isSelected ? 'bg-white' : 'pulse-green'}`}></div>
                  <span className={`status-text ${isSelected ? 'text-white' : 'text-success'}`}>
                    LIVE
                  </span>
                </div>
              </div>

              <div className="route-details">
                <div className="detail-item">
                  <i className="bi bi-geo-alt"></i>
                  <span>{bus.routeId?.routeName || "General Route"}</span>
                </div>
                <div className="detail-item mt-2">
                  <i className="bi bi-person"></i>
                  <span>{bus.driverId?.name || "Driver Unassigned"}</span>
                </div>
              </div>
              
              {/* Decorative SVG Bus Icon */}
              <i className="bi bi-bus-front card-bg-icon"></i>
            </div>
          );
        })}
      </div>
    </div>
  );
}