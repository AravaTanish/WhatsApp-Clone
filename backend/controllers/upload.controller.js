import cloudinary from "../config/cloudinary.js";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  if (!req.file) {
    throw new AppError("No file provided", 400);
  }

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "profile_photos",
          public_id: userId,
          overwrite: true,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(req.file.buffer);
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
    message: "Profile photo removed",
  });
});
