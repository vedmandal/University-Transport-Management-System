import express from "express"
import {register,login, getAllDrivers} from "../controller/auth.controller.js"
import { protect,role } from "../middlewares/auth.middleware.js";
const router=express.Router();

router.post('/register',register)
router.post("/login",login);
router.get('/get-drivers',protect,role("admin"),getAllDrivers)

export default router

