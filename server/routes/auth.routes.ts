import { Router } from "express";
import {
  googleLogin,
  login,
  logout,
  register,
  Resend,
  userDetails,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const authRoutes = Router();

authRoutes.post("/login", login);

authRoutes.post("/register", register);

authRoutes.post("/logout", logout);

authRoutes.get("/me", authenticate, userDetails);

authRoutes.post("/google", googleLogin);

authRoutes.post("/resend", Resend);

export default authRoutes;
