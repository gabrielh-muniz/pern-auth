import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

export const router = Router();

router.post("/increment", verifyToken, incrementClickCount);

router.get("/me", verifyToken, fetchGameData);
