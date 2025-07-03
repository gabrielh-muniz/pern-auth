import express from "express";
import { config } from "dotenv";
import { router as authRouter } from "./routes/authentication.js";
import { router as gameRouter } from "./routes/game.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/api/auth", authRouter);
app.use("/api/game", gameRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
