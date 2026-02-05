import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";

export const uploadProfilePhoto = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
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
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Profile photo upload failed" });
  }
};

export const removeProfilePhoto = async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove photo" });
  }
};
