import express from "express";
import { sendSupportMessages } from "../controllers/support.controller.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const supportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests from this IP, please try again later",
});

router.post("/support", supportLimiter, sendSupportMessages);

export default router;
