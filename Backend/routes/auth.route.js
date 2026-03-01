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
  changePassword,
} from "../controller/auth.controller.js";
import { protect, role } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= BASIC AUTH ================= */

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMyProfile);

/* ================= ADMIN ================= */

router.get("/get-drivers", protect, role("admin"), getAllDrivers);
router.get("/students/search", protect, role("driver", "admin"), searchStudents);
router.post("/create-parent", protect, role("admin"), createParent);
router.get("/parents", protect, role("admin"), getAllParents);
router.put("/assign-bus", protect, role("admin"), assignBusToStudent);

/* ================= PARENT ================= */

router.get("/parent/bus", protect, role("parent"), getParentBus);

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

    return res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${token}&role=${role}`
    );
  }
);

/* ================= MICROSOFT ================= */
router.get(
  "/microsoft",
  passport.authenticate("microsoft")
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


router.post("/change-password", protect, changePassword);

export default router;