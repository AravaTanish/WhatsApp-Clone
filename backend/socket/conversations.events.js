import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { io } from "../index.js";

export default function conversationsEvents(socket) {
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    socket.activeConversationId = conversationId;

    console.log("Joined Room:", socket.id, "->", conversationId);
  });

  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);

    if (socket.activeConversationId === conversationId) {
      socket.activeConversationId = null;
    }

    console.log("Left Room:", socket.id, "->", conversationId);
  });

  socket.on("markMessagesAsRead", async ({ conversationId }) => {
    try {
      const id = socket.user.id;
      const now = new Date();

      const unreadMessages = await Message.find({
        conversation: conversationId,
        sender: { $ne: id },
        deletedForEveryone: false,
        deletedFor: { $ne: id },
        "readBy.user": { $ne: id },
      }).select("_id sender");

      if (!unreadMessages.length) return;

      const messageIds = unreadMessages.map((msg) => msg._id);

      await Message.updateMany(
        { _id: { $in: messageIds } },
        {
          $addToSet: {
            readBy: {
              user: id,
              readAt: now,
            },
          },
        },
      );

      await Conversation.updateOne(
        { _id: conversationId, "unreadCounts.user": id },
        {
          $set: {
            "unreadCounts.$.count": 0,
          },
        },
      );

      const groupedBySender = new Map();

      for (const msg of unreadMessages) {
        const senderId = msg.sender.toString();

        if (!groupedBySender.has(senderId)) {
          groupedBySender.set(senderId, []);
        }

        groupedBySender.get(senderId).push(msg._id);
      }

      for (const [senderId, msgIds] of groupedBySender.entries()) {
        io.to(`user:${senderId}`).emit("messagesReadUpdate", {
          messageIds: msgIds,
          id,
          readAt: now,
        });
      }

      const updatedConversation = await Conversation.findById(conversationId)
        .populate("participants", "userId profilePicture about")
        .populate("lastMessagePerUser.message");

      for (const participant of updatedConversation.participants) {
        io.to(`user:${participant._id}`).emit("conversationUpdated", {
          conversation: updatedConversation,
        });
      }
    } catch (error) {
      console.log("markMessagesAsRead error:", error);
    }
  });
}
