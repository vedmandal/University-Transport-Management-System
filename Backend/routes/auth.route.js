import express from "express";
import passport from "passport";
import {
  register,
  login,
  getAllDrivers,
  searchStudents,
  createParent,
  getParentBus,
  getAllParents,
  assignBusToStudent,
  getMyProfile,
} from "../controller/auth.controller.js";
import { protect, role } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================
   AUTH ROUTES
========================= */

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMyProfile);

/* =========================
   ADMIN ROUTES
========================= */

router.get("/get-drivers", protect, role("admin"), getAllDrivers);

router.get(
  "/students/search",
  protect,
  role("driver", "admin"),
  searchStudents
);

router.post(
  "/create-parent",
  protect,
  role("admin"),
  createParent
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

/* =========================
   PARENT ROUTES
========================= */

router.get(
  "/parent/bus",
  protect,
  role("parent"),
  getParentBus
);

/* =========================
   GOOGLE OAUTH
========================= */

// Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const { token, role } = req.user;

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${token}&role=${role}`
    );
  }
);

/* =========================
   MICROSOFT OAUTH
========================= */

// Redirect to Microsoft
router.get(
  "/microsoft",
  passport.authenticate("microsoft")
);

// Microsoft callback
router.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const { token, role } = req.user;

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${token}&role=${role}`
    );
  }
);

export default router;