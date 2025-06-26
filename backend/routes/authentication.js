import { Router } from "express";
import { signup, login, logout } from "../controllers/authController.js";

export const router = Router();

router.post("/signup", signup);
router.get("/login", login);
router.get("/logout", logout);
