import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const URL = process.env.REACT_APP_API_BASE_URL 
  ? process.env.REACT_APP_API_BASE_URL.replace('/api', '') 
  : "http://localhost:8080";

export const useSocket = (token) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // ✅ create socket with token
    socketRef.current = io(URL, {
      transports: ["websocket"],
      auth: {
        token: token
      }
    });

    return () => {
      socketRef.current.disconnect();
    };

  }, [token]);

  return socketRef.current;
};