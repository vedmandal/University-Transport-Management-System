import express from "express";
import { bookSeat, getBookedSeats, getBusAttendance } from "../controller/booking.controller.js";
import { protect, role } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-booking", protect, role("student"), bookSeat);
router.get("/get-bus/:busId", protect, getBookedSeats);
router.get(
    "/attendance/:busId",
    getBusAttendance
  );
  
export default router;
