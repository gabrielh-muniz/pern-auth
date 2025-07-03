import { Router } from "express";
import {
  incrementClickCount,
  fetchGameData,
} from "../controllers/gameController.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const router = Router();

router.post("/increment", verifyToken, incrementClickCount);

router.get("/me", verifyToken, fetchGameData);
