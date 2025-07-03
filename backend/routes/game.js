import { Router } from "express";
import {
  incrementClickCount,
  fetchGameData,
  fetchLeaderboard,
} from "../controllers/gameController.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const router = Router();

router.post("/increment", verifyToken, incrementClickCount);

router.get("/me", verifyToken, fetchGameData);

router.get("/leaderboard", verifyToken, fetchLeaderboard);
