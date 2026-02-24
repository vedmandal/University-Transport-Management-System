import express from "express";
import {
  bookSeat,
  getBookedSeats,
  getBusAttendance,
  getDriverBookings,
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

// Create booking
router.post(
  "/create",
  protect,
  role("student"),
  bookSeat
);

// Get booked seats for seat layout
router.get(
  "/bus/:busId",
  protect,
  getBookedSeats
);


/* ======================================================
   DRIVER ROUTES
====================================================== */

// Get today's bookings for driver
router.get(
  "/driver/:busId",
  protect,
  role("driver"),
  getDriverBookings
);

// Approve / Reject booking
router.put(
  "/status/:id",
  protect,
  role("driver"),
  updateBookingStatus
);

// Mark attendance
router.put(
  "/attendance/:id",
  protect,
  role("driver"),
  markAttendance
);

// Submit final attendance
router.post(
  "/finalize/:busId",
  protect,
  role("driver"),
  submitFinalAttendance
);


router.get(
  "/my/:busId",
  protect,
  role("student"),
  getMyBooking
);

router.post(
  "/driver/add/:busId",
  protect,
  role("driver"),
  driverAddStudent
);

/* ======================================================
   ADMIN ROUTES
====================================================== */

// Get finalized attendance (date-wise)
router.get(
  "/attendance/:busId",
  protect,
  role("admin"),
  getBusAttendance
);

export default router;