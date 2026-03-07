import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";

export const fetchMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { conversationId } = req.params;

    const messages = await Message.find({ conversation: conversationId });

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
