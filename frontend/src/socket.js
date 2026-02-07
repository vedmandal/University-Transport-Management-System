import { io } from "socket.io-client";


const URL = process.env.REACT_APP_API_BASE_URL 
  ? process.env.REACT_APP_API_BASE_URL.replace('/api', '') 
  : "http://localhost:8080";

export const socket = io(URL, {
  transports: ["websocket"], 
  withCredentials: true
});