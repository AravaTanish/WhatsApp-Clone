import Conversation from "../models/Conversation.model.js";

export const fetchConversations = async (req, res) => {
  try {
    const id = req.user.userId;

    const conversations = await Conversation.find({
      participants: id,
    })
      .populate("participants", "userId profilePicture.url about")
      .populate("lastMessage")
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
    const currentUserId = req.user.userId;
    const { userId } = req.params;
    console.log("1111", currentUserId, userId);
    let conversation = await Conversation.findOne({
      conversationType: "private",
      participants: { $all: [currentUserId, userId] },
    });
    console.log("2222", currentUserId, userId);
    if (!conversation) {
      return res
        .status(200)
        .json({ success: true, message: "No conversation exists" });
    }
    console.log("3333", currentUserId, userId);
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
