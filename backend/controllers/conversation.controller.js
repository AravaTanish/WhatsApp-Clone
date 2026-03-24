import Conversation from "../models/Conversation.model.js";

export const fetchConversations = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch conversations" });
  }
};

export const findConversation = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get conversation" });
  }
};
