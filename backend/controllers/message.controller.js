import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { io } from "../index.js";
import { onlineUsers } from "../socket/onlineUsers.js";

export const fetchMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversation: conversationId,
      deletedFor: { $ne: currentUserId },
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      currentUserId,
      messages,
      message: "Messages fetched successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { messageContent } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user.id;

    let conversation = await Conversation.findOne({
      conversationType: "private",
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        unreadCounts: [
          { user: senderId, count: 0 },
          { user: receiverId, count: 0 },
        ],
      });
    }

    conversation = await conversation.populate(
      "participants",
      "userId profilePicture about",
    );

    const message = await Message.create({
      sender: senderId,
      conversation: conversation._id,
      text: messageContent,
    });

    conversation.lastMessagePerUser = [
      { user: senderId, message: message._id },
      { user: receiverId, message: message._id },
    ];

    const unread = conversation.unreadCounts.find(
      (u) => u.user.toString() === receiverId.toString(),
    );

    if (unread) {
      unread.count += 1;
    }

    const receiverSockets = onlineUsers.get(receiverId.toString());

    let isReceiverOnline = false;
    let isReceiverViewingThisChat = false;

    if (receiverSockets && receiverSockets.size > 0) {
      isReceiverOnline = true;

      for (const socketId of receiverSockets) {
        const receiverSocket = io.sockets.sockets.get(socketId);

        if (
          receiverSocket &&
          receiverSocket.activeConversationId === conversation._id.toString()
        ) {
          isReceiverViewingThisChat = true;
          break;
        }
      }
    }

    if (isReceiverViewingThisChat) {
      const now = new Date();

      message.deliveredTo.push({
        user: receiverId,
        deliveredAt: now,
      });

      message.readBy.push({
        user: receiverId,
        readAt: now,
      });

      conversation.unreadCounts = conversation.unreadCounts.map((item) =>
        item.user.toString() === receiverId.toString()
          ? { ...item, count: 0 }
          : item,
      );

      await message.save();

      io.to(`user:${senderId}`).emit("messagesReadUpdate", {
        messageIds: [message._id],
        id: receiverId,
        readAt: now,
      });
    } else if (isReceiverOnline) {
      const deliveredAt = new Date();

      message.deliveredTo.push({
        user: receiverId,
        deliveredAt,
      });

      await message.save();

      io.to(`user:${senderId}`).emit("messagesDeliveredUpdate", {
        updates: [
          {
            messageId: message._id,
            id: receiverId,
            deliveredAt,
          },
        ],
      });
    }

    await conversation.save();

    const updatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "userId profilePicture about")
      .populate("lastMessagePerUser.message");

    io.to(conversation._id.toString()).emit("newMessage", message);

    io.to(`user:${receiverId}`).emit("conversationUpdated", {
      conversation: updatedConversation,
    });

    io.to(`user:${senderId}`).emit("conversationUpdated", {
      conversation: updatedConversation,
    });

    return res.status(200).json({
      success: true,
      conversation: conversation,
      sentMessage: message,
      message: "Message sent successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send the message" });
  }
};

export const deleteMessageForMe = async (req, res) => {
  try {
    const id = req.user.id;
    const { messageIds, conversationId } = req.body;

    if (!messageIds || messageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No messages selected",
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const messages = await Message.find({
      _id: { $in: messageIds },
    });

    if (messages.length !== messageIds.length) {
      return res.status(404).json({
        success: false,
        message: "Some messages not found",
      });
    }

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { deletedFor: id } },
    );

    const userLastMessageEntry = conversation.lastMessagePerUser.find(
      (entry) => entry.user.toString() === id.toString(),
    );

    if (userLastMessageEntry) {
      const isLastMessageDeleted = messageIds
        .map((id) => id.toString())
        .includes(userLastMessageEntry.message.toString());

      if (isLastMessageDeleted) {
        const newLastMessage = await Message.findOne({
          conversation: conversationId,
          deletedFor: { $nin: [id] },
          _id: { $nin: messageIds },
        }).sort({ createdAt: -1 });

        const userEntry = conversation.lastMessagePerUser.find(
          (u) => u.user == id,
        );

        userEntry.message = newLastMessage?._id || null;
        await conversation.save();
      }
    }

    const updatedConversation = await Conversation.findById(conversationId)
      .populate("participants", "userId profilePicture about")
      .populate("lastMessagePerUser.message");

    const userSockets = onlineUsers.get(id);
    console.log(userSockets);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        io.to(socketId).emit("messagesDeletedForMe", {
          messageIds,
          id,
        });

        io.to(socketId).emit("conversationUpdated", {
          conversation: updatedConversation,
        });
      });
    }

    return res.status(200).json({
      success: true,
      message: "Messages deleted for you",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete messages for you",
    });
  }
};

export const deleteMessageForEveryone = async (req, res) => {
  try {
    const id = req.user.id;
    const { messageIds } = req.body;

    if (!messageIds || messageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No messages selected",
      });
    }

    const messages = await Message.find({
      _id: { $in: messageIds },
    });

    const conversationId = messages[0].conversation;

    const conversation = await Conversation.findById(conversationId).populate(
      "lastMessagePerUser.message",
    );
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    if (messages.length !== messageIds.length) {
      return res.status(404).json({
        success: false,
        message: "Some messages not found",
      });
    }

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    for (const msg of messages) {
      const timeDiff = now - msg.createdAt;

      if (
        msg.sender.toString() !== id.toString() ||
        timeDiff > oneDay ||
        msg.deletedForEveryone
      ) {
        return res.status(400).json({
          success: false,
          message: "One or more messages cannot be deleted for everyone",
        });
      }
    }

    await Message.updateMany(
      { _id: { $in: messageIds } },
      {
        $set: { deletedForEveryone: true },
      },
    );

    const updatedConversation = await Conversation.findById(conversationId)
      .populate("participants", "userId profilePicture about")
      .populate("lastMessagePerUser.message");

    io.to(conversationId.toString()).emit("messagesDeletedForEveryone", {
      messageIds,
    });

    io.to(conversationId.toString()).emit("conversationUpdated", {
      conversation: updatedConversation,
    });

    return res.status(200).json({
      success: true,
      message: "Messages deleted for everyone",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete messages for everyone",
    });
  }
};
