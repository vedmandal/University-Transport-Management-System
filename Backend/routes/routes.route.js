import express from "express";
import { addRoute, deleteRoute, getRoutes, getSingleRoute, updateRoute } from "../controller/route.controller.js";
import { protect, role } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add-route", protect, role("admin"), addRoute);
router.get("/get-route", protect, getRoutes);
router.get("/get-route/:id",protect, getSingleRoute);
router.put("/update-route/:id", updateRoute);
router.delete("/delete-route/:id", deleteRoute);


export default router;
