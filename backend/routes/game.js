import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

export const router = Router();

router.get("/me", verifyToken, fetchGameData);
