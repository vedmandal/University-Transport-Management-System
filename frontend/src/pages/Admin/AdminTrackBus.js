import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import BusMap from "../../components/BusMap";
import { useSocket } from "../../socket";
import { AuthContext } from "../../context/AuthContext";

export default function AdminTrackBus() {
  const { token } = useContext(AuthContext);
  const socket = useSocket(token);

  const { busId } = useParams();
  const [busLocation, setBusLocation] = useState(null);

  /* 1️⃣ Join bus room */
  useEffect(() => {
    if (!socket || !busId) return;

    const joinRoom = () => {
      console.log("Joining room:", busId);
      socket.emit("joinBus", busId);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on("connect", joinRoom);
    }

    return () => {
      socket.off("connect", joinRoom);
    };

  }, [socket, busId]);

  /* 2️⃣ Listen live updates */
  useEffect(() => {
    if (!socket) return;

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

    return () => {
      socket.off("receiveLocation", handleReceive);
    };

  }, [socket]);

  /* 3️⃣ Load last known location */
  useEffect(() => {
    if (!busId) return;

    const loadLastLocation = async () => {
      try {
        const res = await api.get(`/bus/${busId}/last-location`);
        if (res.data?.lat && res.data?.lng) {
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