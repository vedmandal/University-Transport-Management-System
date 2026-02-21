import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { socket } from "../../socket";
import BusMap from "../../components/BusMap";

export default function AdminTrackBus() {
  const { busId } = useParams();
  const [busLocation, setBusLocation] = useState(null);

  /* 1️⃣ Join bus room */
  useEffect(() => {
    if (!busId) return;

    const joinRoom = () => {
      console.log("Joining room:", busId);
      socket.emit("joinBus", busId);
    };

    if (!socket.connected) {
      socket.connect();
    }

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    return () => socket.off("connect", joinRoom);
  }, [busId]);

  /* 2️⃣ Listen live updates */
  useEffect(() => {
    const handleReceive = (data) => {
      console.log("Admin received:", data);

      if (data?.lat && data?.lng) {
        setBusLocation({
          lat: data.lat,
          lng: data.lng,
        });
      }
    };

    socket.on("receiveLocation", handleReceive);

    return () => socket.off("receiveLocation", handleReceive);
  }, []);

  /* 3️⃣ Load last known location */
  useEffect(() => {
    const loadLastLocation = async () => {
      try {
        const res = await api.get(`/bus/${busId}/last-location`);
        if (res.data?.lat) {
          setBusLocation(res.data);
        }
      } catch {
        setBusLocation(null);
      }
    };

    loadLastLocation();
  }, [busId]);

  return (
    <div className="card shadow p-4">
      <h5 className="fw-bold mb-3">Tracking Bus</h5>
      <BusMap busLocation={busLocation} />
    </div>
  );
}