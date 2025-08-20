import express from "express";
import { getUserChats } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/chats/", protectRoute, getUserChats);

export default router;
