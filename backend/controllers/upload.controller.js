import cloudinary from "../config/cloudinary.js";
//import User from "../models/user.model.js";

export const uploadProfilePhoto = async (req, res) => {
  try {
    const { defaultPhoto } = req.body;
    const { userId } = req.user;
    let photoURL = defaultPhoto;
    let publicId = null;
    if (req.file) {
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
      photoURL = uploadResult.secure_url;
      publicId = uploadResult.public_id;

      return res
        .status(200)
        .json({
          success: true,
          photoURL: photoURL,
          publicId: publicId,
          message: "Profile photo uploaded successfully",
        });
    }
    return res
        .status(200)
        .json({
          success: true,
          photoURL: defaultPhoto,
          publicId: userId,
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

    return res
      .status(200)
      .json({ success: true, message: "Profile photo removed" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove photo" });
  }
};
