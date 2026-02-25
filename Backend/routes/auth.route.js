import express from "express"
import {register,login, getAllDrivers, searchStudents, createParent, getParentBus, getAllParents, assignBusToStudent, getMyProfile} from "../controller/auth.controller.js"
import { protect,role } from "../middlewares/auth.middleware.js";
const router=express.Router();

router.post('/register',register)
router.post("/login",login);
router.get('/get-drivers',protect,role("admin"),getAllDrivers)
router.get(
    "/students/search",
    protect,
    role("driver","admin"),
    searchStudents
  );
  router.post(
    "/create-parent",
    protect,
    role("admin"),
    createParent 
 );


 router.get(
  "/parent/bus",
  protect,
  role("parent"),
  getParentBus
);


router.get(
  "/parents",
  protect,
  role("admin"),
  getAllParents
);


router.put(
  "/assign-bus",
  protect,
  role("admin"),
  assignBusToStudent
);

router.get("/me", protect, getMyProfile);

export default router

