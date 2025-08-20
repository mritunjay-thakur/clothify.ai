import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";

const getAuthorizedConversation = async (conversationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return { error: { status: 404, message: "Conversation not found" } };
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return { error: { status: 404, message: "Conversation not found" } };
  }

  if (conversation.userId.toString() !== userId.toString()) {
    return {
      error: {
        status: 403,
        message: "Unauthorized to access this conversation",
      },
    };
  }

  return { conversation };
};

const cleanupAbandonedConversations = async (userId) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  await Conversation.deleteMany({
    userId,
    messages: { $size: 1 },
    updatedAt: { $lt: fiveMinutesAgo },
  });
};

export const getUserConversations = async (req, res) => {
  try {
    await cleanupAbandonedConversations(req.user._id);

    const conversations = await Conversation.find({
      userId: req.user._id,
    }).sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { initialMessage } = req.body;

    if (!initialMessage?.content?.trim()) {
      return res
        .status(400)
        .json({ message: "Initial message content is required" });
    }

    const newConversation = new Conversation({
      userId: req.user._id,
      title:
        initialMessage.content.trim().substring(0, 50) || "New Conversation",
      messages: [initialMessage],
    });

    const conversation = await newConversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addMessageToConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message?.content?.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const { error, conversation } = await getAuthorizedConversation(
      id,
      req.user._id
    );
    if (error) return res.status(error.status).json({ message: error.message });

    conversation.messages.push(message);

    if (message.role === "user" && conversation.messages.length === 2) {
      conversation.title =
        message.content.trim().substring(0, 50) || "New Conversation";
    }

    const updatedConversation = await conversation.save();
    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, conversation } = await getAuthorizedConversation(
      id,
      req.user._id
    );

    if (error) return res.status(error.status).json({ message: error.message });

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, conversation } = await getAuthorizedConversation(
      id,
      req.user._id
    );

    if (error) return res.status(error.status).json({ message: error.message });

    await Conversation.deleteOne({ _id: id });
    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};
