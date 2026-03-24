import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { io } from "../index.js";

export const markPendingMessagesAsDelivered = async (id) => {
  try {
    const conversations = await Conversation.find({
      participants: id,
    }).select("_id participants");

    if (!conversations.length) return;

    const conversationIds = conversations.map((c) => c._id);

    const pendingMessages = await Message.find({
      conversation: { $in: conversationIds },
      sender: { $ne: id },
      deletedForEveryone: false,
      deletedFor: { $ne: id },
      "deliveredTo.user": { $ne: id },
    }).select("_id sender conversation");

    if (!pendingMessages.length) return;

    const now = new Date();
    const messageIds = pendingMessages.map((msg) => msg._id);

    await Message.updateMany(
      { _id: { $in: messageIds } },
      {
        $addToSet: {
          deliveredTo: {
            user: id,
            deliveredAt: now,
          },
        },
      },
    );

    const groupedBySender = new Map();

    for (const msg of pendingMessages) {
      const senderId = msg.sender.toString();

      if (!groupedBySender.has(senderId)) {
        groupedBySender.set(senderId, []);
      }

      groupedBySender.get(senderId).push({
        messageId: msg._id,
        id,
        deliveredAt: now,
      });
    }

    for (const [senderId, updates] of groupedBySender.entries()) {
      io.to(`user:${senderId}`).emit("messagesDeliveredUpdate", {
        updates,
      });
    }
  } catch (error) {
    console.log("markPendingMessagesAsDelivered error:", error);
  }
};