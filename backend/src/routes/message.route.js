import express from "express";
import rateLimit from "express-rate-limit";
import { sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many messages sent from this IP, please try again later",
});

router.post("/message", messageLimiter, sendMessage);

export default router;
