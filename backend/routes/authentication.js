import { Router } from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
} from "../controllers/authController.js";

export const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
