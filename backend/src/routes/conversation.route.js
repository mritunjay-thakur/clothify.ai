import express from "express";
import {
  getUserConversations,
  createConversation,
  addMessageToConversation,
  getConversationById,
  deleteConversation,
} from "../controllers/conversation.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/conversations", protectRoute, getUserConversations);
router.post("/conversations", protectRoute, createConversation);
router.post(
  "/conversations/:id/messages",
  protectRoute,
  addMessageToConversation
);
router.get("/conversations/:id", protectRoute, getConversationById);
router.delete("/conversations/:id", protectRoute, deleteConversation);

export default router;
