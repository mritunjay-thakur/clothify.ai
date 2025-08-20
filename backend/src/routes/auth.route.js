import express from "express";
import passport from "passport";
import rateLimit from "express-rate-limit";
import {
  login,
  logout,
  signup,
  verifyOtp,
  resendOtp,
  editProfile,
  googleCallback,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests from this IP, please try again later",
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/resend-otp", authLimiter, resendOtp);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

router.post("/logout", protectRoute, logout);
router.put("/profile", protectRoute, editProfile);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed`,
    session: false,
  }),
  googleCallback
);

router.get("/me", protectRoute, (req, res) => {
  const { _id, email, fullName, profilePic } = req.user;
  res.status(200).json({
    success: true,
    user: { _id, email, fullName, profilePic },
  });
});

export default router;
