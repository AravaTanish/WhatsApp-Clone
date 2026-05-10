import Conversation from "../models/Conversation.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

export const fetchConversations = asyncHandler(async (req, res) => {
  const id = req.user.id;

  const conversations = await Conversation.find({
    participants: id,
  })
    .populate("participants", "userId profilePicture about")
    .populate("lastMessagePerUser.message")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    conversations,
    message: "Conversations fetched successfully",
  });
});

export const findConversation = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const { userId } = req.params;

  let conversation = await Conversation.findOne({
    conversationType: "private",
    participants: { $all: [currentUserId, userId] },
  });

  if (!conversation) {
    return res
      .status(200)
      .json({ success: true, message: "No conversation exists" });
  }

  return res.status(200).json({
    success: true,
    conversation,
    message: "Conversation fetched successfully",
  });
});
