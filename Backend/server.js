import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import session from "express-session";
import passport from "passport";

// Load passport strategies AFTER dotenv
import "./config/passport.js";

import ConnectDb from "./Database/Db.js";
import authRoutes from "./routes/auth.route.js";
import routeRoutes from "./routes/routes.route.js";
import busRoutes from "./routes/bus.route.js";
import bookingRoutes from "./routes/booking.route.js";
import tripRoutes from "./routes/trip.route.js";
import { socketHandler } from "./socket.js";

const app = express();
const server = http.createServer(app);

// ========================
// DATABASE
// ========================
ConnectDb();

// ========================
// CORS
// ========================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://university-transport-management-sys.vercel.app",
  "https://university-transport-management-system-qjbtg8zoa.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"), false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ========================
// SESSION (REQUIRED FOR MICROSOFT OIDC)
// ========================
app.use(
  session({
    name: "connect.sid",
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // required for HTTPS (Render)
      sameSite: "none", // required for cross-site (Vercel <-> Render)
    },
  })
);

// ========================
// PASSPORT
// ========================
app.use(passport.initialize());
app.use(passport.session());

// ========================
// ROUTES
// ========================
app.use("/api/auth", authRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/trips", tripRoutes);

// ========================
// SOCKET.IO
// ========================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

socketHandler(io);

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    "Google Client ID loaded:",
    process.env.GOOGLE_CLIENT_ID ? "YES" : "NO"
  );
});