import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { io } from "../index.js";
import { onlineUsers } from "../socket/onlineUsers.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import { emitConversationUpdate } from "../utils/emitConversationUpdate.js";
import {
  uploadImagesToCloudinary,
  uploadVideosToCloudinary,
} from "../utils/uploadToCloudinary.js";
import { compressImages } from "../utils/compressImages.js";
import { deleteFiles } from "../utils/deleteFiles.js";

export const fetchMessages = asyncHandler(async (req, res) => {
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
});

export const sendMessage = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (files.length > 10) {
    throw new AppError("More than 10 images", 400);
  }

  const { messageContent, conversationId } = req.body;
  const receiverId = req.params.id;
  const senderId = req.user.id;

  if (!files.length && !messageContent?.trim()) {
    throw new AppError("Message cannot be empty", 400);
  }

  const imageFiles = files.filter((file) => file.mimetype.startsWith("image/"));
  const videoFiles = files.filter((file) => file.mimetype.startsWith("video/"));
  const compressedImages = await compressImages(imageFiles);

  let conversation;
  if (!conversationId || conversationId === "") {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      unreadCounts: [
        { user: senderId, count: 0 },
        { user: receiverId, count: 0 },
      ],
    });
  } else {
    conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }
  }

  // conversation = await conversation.populate(
  //   "participants",
  //   "userId profilePicture about",
  // );

  const imageUrls = await uploadImagesToCloudinary(
    compressedImages,
    `Conversation:${conversation._id}/media/images`,
  );

  const videoUrls = await uploadVideosToCloudinary(
    videoFiles,
    `Conversation:${conversation._id}/media/videos`,
  );

  const filesToDelete = [
    ...compressedImages.flatMap((file) => [file.path, file.originalPath]),
    ...videoFiles.map((file) => file.path),
  ];

  await deleteFiles(filesToDelete);

  // console.log("Urls:", urls);

  const imageMessages = imageUrls.map((url) => ({
    sender: senderId,
    conversation: conversation._id,
    contentType: "image",
    mediaUrl: url,
  }));

  const videoMessages = videoUrls.map((url) => ({
    sender: senderId,
    conversation: conversation._id,
    contentType: "video",
    mediaUrl: url,
  }));

  const mediaMessages = [...imageMessages, ...videoMessages];

  let createdMessages;

  if (mediaMessages.length > 0) {
    createdMessages = await Message.insertMany(mediaMessages);
  } else {
    createdMessages = [
      await Message.create({
        sender: senderId,
        conversation: conversation._id,
        text: messageContent,
      }),
    ];
  }

  const lastMessage = createdMessages[createdMessages.length - 1];

  conversation.lastMessagePerUser = [
    { user: senderId, message: lastMessage._id },
    { user: receiverId, message: lastMessage._id },
  ];

  const unread = conversation.unreadCounts.find(
    (u) => u.user.toString() === receiverId.toString(),
  );

  if (unread) {
    unread.count += createdMessages.length;
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

    await Message.updateMany(
      {
        _id: { $in: createdMessages.map((msg) => msg._id) },
      },
      {
        $push: {
          deliveredTo: {
            user: receiverId,
            deliveredAt: now,
          },
          readBy: {
            user: receiverId,
            readAt: now,
          },
        },
      },
    );

    conversation.unreadCounts = conversation.unreadCounts.map((item) =>
      item.user.toString() === receiverId.toString()
        ? { ...item, count: 0 }
        : item,
    );

    io.to(`user:${senderId}`).emit("messagesReadUpdate", {
      messageIds: createdMessages.map((msg) => msg._id),
      id: receiverId,
      readAt: now,
    });
  } else if (isReceiverOnline) {
    const deliveredAt = new Date();

    await Message.updateMany(
      {
        _id: { $in: createdMessages.map((msg) => msg._id) },
      },
      {
        $push: {
          deliveredTo: {
            user: receiverId,
            deliveredAt,
          },
        },
      },
    );

    io.to(`user:${senderId}`).emit("messagesDeliveredUpdate", {
      updates: createdMessages.map((msg) => ({
        messageId: msg._id,
        id: receiverId,
        deliveredAt,
      })),
    });
  }

  await conversation.save();

  const updatedMessages = await Message.find({
    _id: {
      $in: createdMessages.map((msg) => msg._id),
    },
  });

  io.to(conversation._id.toString()).emit("newMessages", updatedMessages);

  await emitConversationUpdate(conversation._id, [senderId, receiverId]);

  return res.status(200).json({
    success: true,
    conversationId: conversation._id,
    sentMessages: updatedMessages,
    message: "Message sent successfully",
  });
});

export const deleteMessageForMe = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const { messageIds, conversationId } = req.body;

  if (!messageIds || messageIds.length === 0) {
    throw new AppError("No messages selected", 400);
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  const messages = await Message.find({
    _id: { $in: messageIds },
  });

  if (messages.length !== messageIds.length) {
    throw new AppError("Some messages not found", 404);
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

  // const updatedConversation = await Conversation.findById(conversationId)
  //   .populate("participants", "userId profilePicture about")
  //   .populate("lastMessagePerUser.message");

  const userSockets = onlineUsers.get(id);
  if (userSockets) {
    userSockets.forEach((socketId) => {
      io.to(socketId).emit("messagesDeletedForMe", {
        messageIds,
        id,
      });

      // io.to(socketId).emit("conversationUpdated", {
      //   conversation: updatedConversation,
      // });
    });
  }

  await emitConversationUpdate(conversationId, [id]);

  return res.status(200).json({
    success: true,
    message: "Messages deleted for you",
  });
});

export const deleteMessageForEveryone = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const { messageIds } = req.body;

  if (!messageIds || messageIds.length === 0) {
    throw new AppError("Messages are not selected", 404);
  }

  const messages = await Message.find({
    _id: { $in: messageIds },
  });

  if (messages.length === 0) {
    throw new AppError("Messages not found", 404);
  }

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
      throw new AppError(
        "One or more messages cannot be deleted for everyone",
        400,
      );
    }
  }

  await Message.updateMany(
    { _id: { $in: messageIds } },
    {
      $set: { deletedForEveryone: true },
    },
  );

  // const updatedConversation = await Conversation.findById(conversationId)
  //   .populate("participants", "userId profilePicture about")
  //   .populate("lastMessagePerUser.message");

  io.to(conversationId.toString()).emit("messagesDeletedForEveryone", {
    messageIds,
  });

  await emitConversationUpdate(
    conversationId,
    conversation.participants.map((p) => p._id || p),
  );

  // io.to(conversationId.toString()).emit("conversationUpdated", {
  //   conversation: updatedConversation,
  // });

  return res.status(200).json({
    success: true,
    message: "Messages deleted for everyone",
  });
});
