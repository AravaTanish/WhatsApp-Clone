import fs from "fs/promises";
import cloudinary from "../config/cloudinary.js";
import AppError from "./appError.js";

export const uploadImagesToCloudinary = async (files, folder) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
      });

      await fs.unlink(file.path);

      return result.secure_url;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new AppError("Failed to upload images", 500);
  }
};