import express from "express";
import { handleAICommand } from "../controller/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// protect middleware ensures we have req.user (id and role)
router.post("/process", protect, handleAICommand);

export default router;