import Chat from "../models/Chats.js";

export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Server error while fetching chats" });
  }
};
