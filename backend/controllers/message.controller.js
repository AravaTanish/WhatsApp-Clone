import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";

export const fetchMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
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
    const senderId = req.user.userId;

    let conversation = await Conversation.findOne({
      conversationType: "private",
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const message = await Message.create({
      sender: senderId,
      conversation: conversation._id,
      text: messageContent,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    return res.status(200).json({
      success: true,
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
    const userId = req.user.userId;
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

    if (messages.length !== messageIds.length) {
      return res.status(404).json({
        success: false,
        message: "Some messages not found",
      });
    }

    await Message.updateMany(
      { _id: { $in: messageIds } },
      {
        $addToSet: { deletedFor: userId },
      },
    );

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
    const userId = req.user.userId;
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
        msg.sender.toString() !== userId.toString() ||
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
