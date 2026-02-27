import User from "../models/user.model.js";
import FriendRequest from "../models/FriendRequests.model.js";

export const addFriend = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.userId;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send friend request to yourself",
      });
    }

    const senderExists = await User.exists({ _id: senderId });
    if (!senderExists) {
      return res.status(400).json({
        success: false,
        message: "Sender not found",
      });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(400).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const isFriends = await User.exists({
      _id: senderId,
      friends: receiverId,
    });

    if (isFriends) {
      return res.status(400).json({
        success: false,
        message: "You both are already friends",
      });
    }

    const existingRequest = await FriendRequest.exists({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ success: false, message: "The request is in pending" });
    }

    await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      message: message,
    });

    return res
      .status(200)
      .json({ success: true, message: "Request sent successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send request" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.userId;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send friend request to yourself",
      });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res
        .status(400)
        .json({ success: false, message: "Sender not found" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver not found" });
    }

    const isFriends = sender.friends.some((id) => id.toString() === receiverId);
    if (!isFriends) {
      return res
        .status(400)
        .json({ success: false, message: "You both are not friends" });
    }

    sender.friends.pull(receiverId);
    receiver.friends.pull(senderId);

    await sender.save();
    await receiver.save();

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove friend" });
  }
};

export const acceptRequest = async (req, res) => {};

export const rejectRequest = async (req, res) => {};

export const showAllFriends = async (req, res) => {};

export const showPendingRequests = async (req, res) => {};
