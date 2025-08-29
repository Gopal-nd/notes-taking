import { OAuth2Client } from "google-auth-library";
import prisma from "../lib/prisma";
import { generateToken } from "../lib/jwt";
import type { Request, Response } from "express";
import { genrateOTP } from "../lib/genrate-opt";
import { sendEmail } from "../lib/mail";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleLogin = async (req: Request, res: Response) => {
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

    console.log(token);
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: payload.sub!,
          dob: new Date(),
          email: payload.email!,
          name: payload.name || "No Name",
          avatar: payload.picture || null,
        },
      });
    }
    const jwtToken = generateToken(user);

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return res.json({
      message: "Google login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        token: jwtToken,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const userDetails = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    console.log("i was called User: ", user);
    res.json(user);
  } catch (error) {
    console.log("error in user details /me", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const userExist = await prisma.user.findUnique({ where: { email } });
    if (!userExist) {
      return res.status(400).json({ error: "User does not exist" });
    }
    if (!otp) {
      const newOTP = genrateOTP();
      const newUser = await prisma.user.update({
        where: { email },
        data: {
          opt: newOTP,
        },
      });
      await sendEmail(email, "OTP", newOTP);
      return res
        .status(200)
        .json({ message: "Login otp Sent to email Successfully" });
    }

    if (userExist.opt !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const jwtToken = generateToken(userExist);

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      message: "Login successful",
      user: { ...userExist, token: jwtToken },
    });
  } catch (error) {
    console.log("error in login", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const Resend = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log(req.body);
    const userExist = await prisma.user.findUnique({ where: { email } });
    if (!userExist) {
      return res.status(400).json({ error: "User does not exist" });
    }
    const newOTP = genrateOTP();
    const newUser = await prisma.user.update({
      where: { email },
      data: {
        opt: newOTP,
      },
    });
    await sendEmail(email, "OTP", newOTP);
    res.status(200).json({ message: "OTP Resent to email Successfully" });
  } catch (error) {
    console.log("error in resend", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, otp, dob, name } = req.body;
    console.log(req.body);
    console.log(email, otp, name, dob);

    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newOTP = genrateOTP();
    const newUser = await prisma.user.create({
      data: {
        email,
        dob: new Date(dob),
        opt: newOTP,
        name,
      },
    });
    await sendEmail(email, "OTP", newOTP);
    console.log(newUser);
    res
      .status(200)
      .json({ message: "User created Please Enter OTP Sent to email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("error in logout", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
