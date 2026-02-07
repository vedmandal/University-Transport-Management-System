import express from "express"
import dotenv from 'dotenv'
import http from "http"
import ConnectDb from "./Database/Db.js";
import authRoutes from "./routes/auth.route.js";
import routeRoutes from "./routes/routes.route.js";
import busRoutes from "./routes/bus.route.js"

import bookingRoutes from "./routes/booking.route.js";
import tripRoutes from "./routes/trip.route.js";
import cors from "cors"
import {Server} from "socket.io"
import { socketHandler } from "./socket.js";
dotenv.config();
const app=express();
const server=http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001","https://university-transport-management-sys.vercel.app"],
    
      methods: ["GET", "POST"]
    }
  });
  socketHandler(io);

  app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "https://university-transport-management-sys.vercel.app"],
    credentials: true
}));
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/bus",busRoutes)
app.use("/api/bookings", bookingRoutes);
app.use("/api/trips", tripRoutes);





ConnectDb();





server.listen(process.env.PORT,()=>{
    console.log(`server is working on port ${process.env.PORT}`);
})