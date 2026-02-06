import api from "../api/axios";
import { useEffect, useState } from "react";
import "./BusList.css"; // Reuse your core styles

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

  if (loading)
    return (
      <div className="p-4 text-center">
        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
        <span className="text-muted fw-bold">Finding available buses...</span>
      </div>
    );

  if (error)
    return <div className="p-3 text-danger fw-bold text-center border rounded-3 bg-light">{error}</div>;

  return (
    <div className="bus-selection-wrapper pe-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
      <h6 className="text-uppercase small fw-bold text-muted mb-3 px-1">Available Fleet</h6>
      
      {buses.map((bus) => {
        const isSelected = selectedBusId === bus._id;
        
        return (
          <div
            key={bus._id}
            className={`bus-select-card mb-3 p-3 shadow-sm border ${isSelected ? "selected" : ""}`}
            onClick={() => {
              setSelectedBusId(bus._id);
              onSelectBus(bus);
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <div className={`bus-icon-mini me-2 ${isSelected ? "bg-white text-primary" : "bg-primary text-white"}`}>
                  <i className="bi bi-bus-front"></i>
                </div>
                <span className={`fw-bold fs-5 ${isSelected ? "text-white" : "text-dark"}`}>
                  {bus.busNo}
                </span>
              </div>
              {isSelected && <i className="bi bi-check-circle-fill text-white fs-5"></i>}
            </div>

            <div className={`route-info-row p-2 rounded-2 ${isSelected ? "bg-glass-light" : "bg-light"}`}>
              <div className="d-flex align-items-center mb-1">
                <i className={`bi bi-geo-alt-fill me-2 ${isSelected ? "text-white" : "text-primary"}`}></i>
                <small className={`fw-semibold ${isSelected ? "text-white" : "text-dark"}`}>
                  {bus.routeId?.routeName || "General Route"}
                </small>
              </div>
              <div className="d-flex align-items-center">
                <i className={`bi bi-person-badge me-2 ${isSelected ? "text-white-50" : "text-muted"}`}></i>
                <small className={`${isSelected ? "text-white-50" : "text-muted"}`}>
                  {bus.driverId?.name || "Assigning Driver..."}
                </small>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}