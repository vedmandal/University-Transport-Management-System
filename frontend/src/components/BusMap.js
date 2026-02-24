import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "./BusMap.css";

// Premium Indigo Bus Icon
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
    <div className="map-terminal-wrapper">
      {/* MAP MAIN AREA */}
      <div className="map-body position-relative">
        <MapContainer
          center={[28.7041, 77.1025]} 
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "450px", width: "100%" }}
          className="leaflet-container-indigo"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {busLocation ? (
            <>
              <Marker position={[busLocation.lat, busLocation.lng]} icon={busIcon} />
              <CenterMap busLocation={busLocation} />
            </>
          ) : null}
        </MapContainer>

        {/* MODERN LOADING OVERLAY */}
        {!busLocation && (
          <div className="map-glass-overlay">
            <div className="glass-loader-card">
              <div className="spinner-indigo mb-3"></div>
              <h6 className="fw-800 text-slate mb-1">Awaiting GPS Feed</h6>
              <p className="text-muted small mb-0">The bus hasn't started its route yet.</p>
            </div>
          </div>
        )}
      </div>

      {/* REFINED STATS FOOTER */}
      <div className="map-footer-premium">
        <div className="d-flex justify-content-around w-100">
          <div className="stat-pill">
             <span className="stat-label">STATUS</span>
             <span className={`stat-value ${busLocation ? "text-emerald" : "text-slate"}`}>
               {busLocation ? "● ON ROUTE" : "● IDLE"}
             </span>
          </div>
          <div className="stat-pill-divider"></div>
          <div className="stat-pill">
             <span className="stat-label">LAST PING</span>
             <span className="stat-value text-slate">
               {busLocation ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}