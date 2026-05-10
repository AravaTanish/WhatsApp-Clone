import User from "../models/User.model.js";
import FriendRequest from "../models/FriendRequests.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

export const addFriend = asyncHandler(async (req, res) => {
  const { receiverId, message } = req.body;
  const senderId = req.user.id;

  if (senderId === receiverId) {
    throw new AppError("You cannot send friend request to yourself", 400);
  }

  const senderExists = await User.exists({ _id: senderId });
  if (!senderExists) {
    throw new AppError("Sender not found", 400);
  }

  const receiverExists = await User.exists({ _id: receiverId });
  if (!receiverExists) {
    throw new AppError("Receiver not found", 400);
  }

  const isFriends = await User.exists({
    _id: senderId,
    friends: receiverId,
  });

  if (isFriends) {
    throw new AppError("You both are already friends", 400);
  }

  const existingRequest = await FriendRequest.exists({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });
  if (existingRequest) {
    throw new AppError("The request is in pending", 400);
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
});

export const removeFriend = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  const senderId = req.user.id;

  if (senderId === receiverId) {
    throw new AppError("You cannot send friend request to yourself", 400);
  }

  const sender = await User.findById(senderId);
  if (!sender) {
    throw new AppError("Sender not found", 400);
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new AppError("Receiver not found", 400);
  }

  const isFriends = sender.friends.some((id) => id.toString() === receiverId);
  if (!isFriends) {
    throw new AppError("You both are not friends", 400);
  }

  sender.friends.pull(receiverId);
  receiver.friends.pull(senderId);

  await sender.save();
  await receiver.save();

  return res.status(200).json({
    success: true,
    message: "Friend removed successfully",
  });
});

export const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user.id;

  const request = await FriendRequest.findById(requestId);
  if (!request) {
    throw new AppError("Friend request not found", 404);
  }

  if (request.receiver.toString() !== userId) {
    throw new AppError("You are not authorized to accept this request", 403);
  }

  const sender = await User.findById(request.sender);
  const receiver = await User.findById(request.receiver);

  if (!sender || !receiver) {
    throw new AppError("User not found", 404);
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
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user.id;

  const request = await FriendRequest.findById(requestId);
  if (!request) {
    throw new AppError("Friend request not found", 404);
  }

  if (request.receiver.toString() !== userId) {
    throw new AppError("You are not authorized to reject this request", 403);
  }

  await FriendRequest.findByIdAndDelete(requestId);

  return res.status(200).json({
    success: true,
    message: "Friend request rejected",
  });
});

export const showAllFriends = asyncHandler(async (req, res) => {
  const id = req.user.id;

  const user = await User.findById(id)
    .select("friends")
    .populate({
      path: "friends",
      select: "userId profilePicture about",
      options: { sort: { userId: 1 } }, // 1 = ascending, -1 = descending
    })
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    friends: user.friends,
  });
});

export const showPendingRequests = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const requests = await FriendRequest.find({
    receiver: userId,
  })
    .populate("sender", "userId profilePicture about")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

export const profile = asyncHandler(async (req, res) => {
  const id1 = req.user.id;
  const userId2 = req.params.userId;
  let friendshipStatus = "none";

  const user1 = await User.findById(id1);
  const user2 = await User.findOne({ userId: userId2 });

  if (!user1 || !user2) {
    throw new AppError("User not found", 400);
  }

  const id2 = user2._id;

  const userDetails = {
    _id: user2._id,
    userId: user2.userId,
    profilePicture: user2.profilePicture,
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
});
