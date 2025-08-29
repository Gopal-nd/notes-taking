import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import prisma from "./lib/prisma";

dotenv.config();
const app = express();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

const generateToken = (user: { id: string; email: string }) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload)
      return res.status(400).json({ error: "Invalid Google token" });

    let user = await prisma.user.findUnique({
      where: { googleId: payload.sub! },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: payload.sub!,
          email: payload.email!,
          name: payload.name || "No Name",
          avatar: payload.picture || null,
        },
      });
    }

    const jwtToken = generateToken(user);
    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
};

app.get("/api/me", authenticate, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json(user);
});

app.post("/api/logout", (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

app.listen(8000, () => console.log("Server running on http://localhost:5000"));
