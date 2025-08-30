import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import notesRoutes from "./routes/notes.route";
import { authenticate } from "./middleware/auth.middleware";
dotenv.config();
const app = express();
app.set("trust proxy", 1);
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

app.use(cors({ origin: [`${process.env.FRONTEND_URL}`], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/notes", authenticate, notesRoutes);
app.listen(8000, () => console.log("Server running on http://localhost:8000"));
