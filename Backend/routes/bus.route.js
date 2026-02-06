import express from "express";
import { addBus, getAllBusLocations, getBuses, getMyBus } from "../controller/bus.controller.js";
import { protect, role } from "../middlewares/auth.middleware.js";
import busModel from "../models/bus.model.js";

const router = express.Router();

router.post("/add-bus", protect, role("admin"), addBus);
router.get("/get-bus", protect, getBuses);
router.get("/my-bus", protect, role("driver"), getMyBus);
router.get("/all-locations", getAllBusLocations);

router.get("/:busId/last-location", async (req, res) => {
    try {
      const bus = await busModel.findById(req.params.busId);
  
      if (!bus || !bus.lastLocation) {
        return res.json(null);
      }
  
      res.json({
        lat: bus.lastLocation.lat,
        lng: bus.lastLocation.lng,
        lastUpdatedAt: bus.lastUpdatedAt,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch last location" });
    }
  });

export default router;
