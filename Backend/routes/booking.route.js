import express from "express";
import {
  bookSeat,
  getBookedSeats,
  getBusAttendance,
  getDriverBookings,
  getUnifiedManifest, // 🔥 ADD THIS IMPORT
  updateBookingStatus,
  markAttendance,
  submitFinalAttendance,
  getMyBooking,
  driverAddStudent
} from "../controller/booking.controller.js";

import { protect, role } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ======================================================
   STUDENT ROUTES
====================================================== */
router.post("/create", protect, role("student"), bookSeat);
router.get("/bus/:busId", protect, getBookedSeats);
router.get("/my/:busId", protect, role("student"), getMyBooking);

/* ======================================================
   DRIVER ROUTES
====================================================== */

// 🔥 NEW: Get unified manifest (Roster + Bookings)
router.get(
  "/manifest/:busId", 
  protect, 
  role("driver"), 
  getUnifiedManifest
);

// Get today's bookings for driver (Keep for backwards compatibility if needed)
router.get("/driver/:busId", protect, role("driver"), getDriverBookings);

// Approve / Reject booking
router.put("/status/:id", protect, role("driver"), updateBookingStatus);

// Mark attendance
router.put("/attendance/:id", protect, role("driver"), markAttendance);

// Submit final attendance (This now handles auto-absent logic)
router.post("/finalize/:busId", protect, role("driver"), submitFinalAttendance);

// Manual Boarding
router.post("/driver/add/:busId", protect, role("driver"), driverAddStudent);

/* ======================================================
   ADMIN ROUTES
====================================================== */
router.get("/attendance/:busId", protect, role("admin"), getBusAttendance);

export default router;