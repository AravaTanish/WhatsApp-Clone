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

    const request = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      message: message,
    });

    return res.status(200).json({
      success: true,
      message: "Request sent successfully",
      requestId: request._id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send request" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { receiverId } = req.params;
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

export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user.userId;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this request",
      });
    }

    const sender = await User.findById(request.sender);
    const receiver = await User.findById(request.receiver);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    sender.friends.addToSet(receiver._id);
    receiver.friends.addToSet(sender._id);

    await sender.save();
    await receiver.save();

    await FriendRequest.findByIdAndDelete(requestId);

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to accept request",
    });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user.userId;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this request",
      });
    }

    await FriendRequest.findByIdAndDelete(requestId);

    return res.status(200).json({
      success: true,
      message: "Friend request rejected",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject request",
    });
  }
};

export const showAllFriends = async (req, res) => {
  try {
    const id = req.user.userId;

    const user = await User.findById(id)
      .select("friends")
      .populate({
        path: "friends",
        select: "userId profilePicture.url about",
        options: { sort: { userId: 1 } }, // 1 = ascending, -1 = descending
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      friends: user.friends,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your friends",
    });
  }
};

export const showPendingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await FriendRequest.find({
      receiver: userId,
    })
      .populate("sender", "userId profilePicture.url about")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending requests",
    });
  }
};

export const profile = async (req, res) => {
  try {
    const id1 = req.user.userId;
    const userId2 = req.params.userId;
    let friendshipStatus = "none";

    const user1 = await User.findById(id1);
    const user2 = await User.findOne({ userId: userId2 });

    if (!user1 || !user2) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const id2 = user2._id;

    const userDetails = {
      _id: user2._id,
      userId: user2.userId,
      profilePicture: user2.profilePicture.url,
      about: user2.about,
    };

    const isFriends = await User.exists({
      _id: id1,
      friends: id2,
    });

    if (isFriends) {
      friendshipStatus = "accepted";
      return res.status(200).json({
        success: true,
        user: userDetails,
        friendshipStatus: friendshipStatus,
        message: "You both are already friends",
      });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: id1, receiver: id2 },
        { sender: id2, receiver: id1 },
      ],
    });

    if (existingRequest) {
      const senderId = existingRequest.sender.toString();
      if (senderId === id1) {
        friendshipStatus = "pending_sent";
      } else {
        friendshipStatus = "pending_received";
      }
      return res.status(200).json({
        success: true,
        user: userDetails,
        requestId: existingRequest._id,
        requestMessage: existingRequest.message,
        friendshipStatus: friendshipStatus,
        message: "The request is in pending",
      });
    }

    return res.status(200).json({
      success: true,
      user: userDetails,
      friendshipStatus: friendshipStatus,
      message: "No relation",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to find relation" });
  }
};
