import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../../api/axios";
import { socket } from "../../socket";
import "./AdminTrackBuses.css";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", // More modern bus icon
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

export default function AdminTrackBuses() {
  const [busLocations, setBusLocations] = useState({});

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await api.get("/bus/all-locations");
        const map = {};
        res.data.buses.forEach((bus) => {
          map[bus._id] = {
            lat: bus.lastLocation.lat,
            lng: bus.lastLocation.lng,
            busNo: bus.busNo,
            updatedAt: new Date().toLocaleTimeString(),
          };
        });
        setBusLocations(map);
      } catch (err) {
        console.error("Failed to load initial locations");
      }
    };
    loadLocations();
  }, []);

  useEffect(() => {
    socket.emit("joinAdmin");
    socket.on("adminReceiveLocation", (data) => {
      setBusLocations((prev) => ({
        ...prev,
        [data.busId]: {
          ...prev[data.busId],
          lat: data.lat,
          lng: data.lng,
          updatedAt: new Date().toLocaleTimeString(),
        },
      }));
    });
    return () => socket.off("adminReceiveLocation");
  }, []);

  return (
    <div className="container-fluid p-0">
      <div className="row g-0 overflow-hidden" style={{ borderRadius: "20px", border: "1px solid #e0e0e5" }}>
        
        {/* 🗺️ MAP SECTION */}
        <div className="col-md-9 position-relative">
          <div className="map-overlay-badge">
             <span className="dot pulse me-2"></span> Live Fleet View
          </div>
          <MapContainer
            center={[28.3188, 77.0608]} // Set this to KR Mangalam University coords
            zoom={13}
            style={{ height: "700px", width: "100%" }}
            className="admin-map"
          >
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Cleaner, more modern tile set
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {Object.entries(busLocations).map(([busId, loc]) => (
              <Marker key={busId} position={[loc.lat, loc.lng]} icon={busIcon}>
                <Popup>
                  <div className="p-1">
                    <strong className="text-primary d-block">Bus: {loc.busNo}</strong>
                    <small className="text-muted">Last update: {loc.updatedAt}</small>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 📊 LIVE STATUS SIDEBAR */}
        <div className="col-md-3 bg-white border-start overflow-auto" style={{ height: "700px" }}>
          <div className="p-3 bg-light border-bottom sticky-top">
            <h6 className="fw-bold mb-0 text-dark">Active Fleet</h6>
            <small className="text-muted">{Object.keys(busLocations).length} buses currently online</small>
          </div>
          <div className="list-group list-group-flush">
            {Object.entries(busLocations).map(([id, bus]) => (
              <div key={id} className="list-group-item p-3 border-bottom-0 border-start border-4 border-success mb-1">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-dark">{bus.busNo}</span>
                  <span className="badge bg-soft-success text-success">Live</span>
                </div>
                <div className="text-muted mt-1" style={{ fontSize: "11px" }}>
                   <i className="bi bi-clock me-1"></i> Updated {bus.updatedAt}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}