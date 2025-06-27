import express from "express";
import { config } from "dotenv";
import { router as authRouter } from "./routes/authentication.js";
import cookieParser from "cookie-parser";

config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
