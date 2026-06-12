import fs from "fs/promises";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  if (!req.file) {
    throw new AppError("No file provided", 400);
  }

  let uploadResult;

  try {
    uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_photos",
      public_id: userId,
      overwrite: true,
      resource_type: "image",
    });
  } finally {
    // Always remove local file
    await fs.unlink(req.file.path).catch(() => {});
  }

  await User.findByIdAndUpdate(userId, {
    profilePicture: uploadResult.secure_url,
  });

  return res.status(200).json({
    success: true,
    photoURL: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    message: "Profile photo uploaded successfully",
  });
});

export const removeProfilePhoto = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  await cloudinary.uploader.destroy(`profile_photos/${userId}`, {
    resource_type: "image",
  });

  await User.findByIdAndUpdate(userId, {
    $unset: { profilePicture: 1 },
  });

  return res.status(200).json({
    success: true,
    message: "Profile photo removed successfully",
  });
});
