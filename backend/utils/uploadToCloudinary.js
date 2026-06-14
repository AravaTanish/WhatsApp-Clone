import cloudinary from "../config/cloudinary.js";
import AppError from "./appError.js";

export const uploadImagesToCloudinary = async (files, folder) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
      });
      return result.secure_url;
    });
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to upload images", 500);
  }
};

export const uploadVideosToCloudinary = async (files, folder) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "video",
      });
      return result.secure_url;
    });
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new AppError("Failed to upload videos", 500);
  }
};
