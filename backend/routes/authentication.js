import { Router } from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  oauthCallback,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import passport from "../config/passport.js";

export const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/check-auth", verifyToken, checkAuth);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  oauthCallback
);
