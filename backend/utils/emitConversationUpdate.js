import Conversation from "../models/Conversation.model.js";
import { io } from "../index.js";

export const emitConversationUpdate = async (
  conversationId,
  participantIds,
) => {
  const updatedConversation = await Conversation.findById(conversationId)
    .populate("participants", "userId profilePicture about")
    .populate("lastMessagePerUser.message");

  participantIds.forEach((userId) => {
    io.to(`user:${userId}`).emit("conversationUpdated", {
      conversation: updatedConversation,
    });
  });

  return updatedConversation;
};
