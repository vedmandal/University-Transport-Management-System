import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "./BusMap.css"; // Ensure your CSS is imported

// Using a more modern, high-contrast bus icon
const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -40],
});

function CenterMap({ busLocation }) {
  const map = useMap();

  useEffect(() => {
    if (busLocation) {
      // Smoothly pans and zooms to the bus location
      map.flyTo([busLocation.lat, busLocation.lng], 16, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [busLocation, map]);

  return null;
}

export default function BusMap({ busLocation }) {
  return (
    <div className="card shadow-lg map-card border-0">
      {/* HEADER WITH PULSE INDICATOR */}
      <div className="card-header d-flex justify-content-between align-items-center bg-white py-3 px-4">
        <div className="d-flex align-items-center">
          <div className={`status-dot ${busLocation ? "pulse-green" : "pulse-orange"} me-3`}></div>
          <h5 className="fw-bold text-dark mb-0">Live Tracking Terminal</h5>
        </div>
        {busLocation && (
          <span className="badge bg-soft-primary text-primary px-3 py-2 rounded-pill">
            <i className="bi bi-broadcast me-2"></i>Signal Active
          </span>
        )}
      </div>

      <div className="card-body p-0 position-relative">
        {/* MAP CONTAINER */}
        <MapContainer
          center={[28.7041, 77.1025]} 
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "500px", width: "100%" }}
          className="admin-map-instance"
        >
          {/* Using a cleaner, high-contrast Tile Set (CartoDB Voyager) */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {busLocation ? (
            <>
              <Marker
                position={[busLocation.lat, busLocation.lng]}
                icon={busIcon}
              />
              <CenterMap busLocation={busLocation} />
            </>
          ) : null}
        </MapContainer>

        {/* FLOATING ACTION OVERLAY IF NO DATA */}
        {!busLocation && (
          <div className="map-loading-overlay">
            <div className="text-center p-4 bg-white shadow rounded-4">
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <h6 className="fw-bold text-dark mb-1">Awaiting GPS Feed</h6>
              <p className="text-muted small mb-0">The bus hasn't started its route yet.</p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="card-footer bg-light border-0 py-3 px-4">
        <div className="row text-center">
          <div className="col-6 border-end">
             <small className="text-muted d-block">Status</small>
             <span className={`fw-bold ${busLocation ? "text-success" : "text-muted"}`}>
               {busLocation ? "Moving" : "Idle"}
             </span>
          </div>
          <div className="col-6">
             <small className="text-muted d-block">Last Ping</small>
             <span className="fw-bold text-dark">
               {busLocation ? new Date().toLocaleTimeString() : "--:--"}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}