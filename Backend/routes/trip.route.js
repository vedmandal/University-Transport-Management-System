import express from "express";
import { startTrip, endTrip } from "../controller/trip.controller.js";
import { protect, role } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/start", protect, role("driver"), startTrip);
router.post("/end/:id", protect, role("driver"), endTrip);

export default router;
