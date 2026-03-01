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

/* ================= NORMAL AUTH ================= */

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMyProfile);

/* ================= GOOGLE ================= */

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

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

/* ================= MICROSOFT ================= */

router.get(
  "/microsoft",
  passport.authenticate("microsoft", {
    scope: ["openid", "profile", "email"],
  })
);

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