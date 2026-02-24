import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../../api/axios";
import { socket } from "../../socket";
import "./AdminTrackBuses.css";

// Premium Bus Icon
const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", 
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
          if (bus.lastLocation) {
            map[bus._id] = {
              lat: bus.lastLocation.lat,
              lng: bus.lastLocation.lng,
              busNo: bus.busNo,
              updatedAt: new Date().toLocaleTimeString(),
            };
          }
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
    <div className="adm-page-content p-0">
      <div className="adm-fleet-layout shadow-sm">
        
        {/* 🗺️ MAP SECTION */}
        <div className="adm-map-container">
          <div className="adm-map-overlay">
             <span className="adm-pulse-dot"></span> 
             <span className="adm-live-label">Fleet Live View</span>
          </div>
          <MapContainer
            center={[28.3188, 77.0608]} 
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            className="adm-leaflet-map"
          >
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
              attribution='&copy; CARTO'
            />

            {Object.entries(busLocations).map(([busId, loc]) => (
              <Marker key={busId} position={[loc.lat, loc.lng]} icon={busIcon}>
                <Popup>
                  <div className="adm-popup-content">
                    <strong className="adm-popup-bus">Bus: {loc.busNo}</strong>
                    <span className="adm-popup-time">Active: {loc.updatedAt}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 📊 LIVE STATUS SIDEBAR */}
        <div className="adm-fleet-sidebar">
          <div className="adm-sidebar-header">
            <h6 className="adm-sidebar-title">Active Fleet</h6>
            <div className="adm-online-pill">
                {Object.keys(busLocations).length} ONLINE
            </div>
          </div>
          
          <div className="adm-sidebar-scroll">
            {Object.keys(busLocations).length === 0 ? (
                <div className="adm-empty-fleet">No buses currently broadcasting.</div>
            ) : (
                Object.entries(busLocations).map(([id, bus]) => (
                  <div key={id} className="adm-fleet-item">
                    <div className="adm-fleet-meta">
                      <span className="adm-fleet-no">{bus.busNo}</span>
                      <span className="adm-live-tag">LIVE</span>
                    </div>
                    <div className="adm-fleet-time">
                       🕒 Updated at {bus.updatedAt}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}