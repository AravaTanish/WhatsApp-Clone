import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const maxImageSize = 10 * 1024 * 1024; // 10 MB
    const maxVideoSize = 50 * 1024 * 1024; // 50 MB

    if (file.mimetype.startsWith("image/")) {
      if (parseInt(req.headers["content-length"]) > maxImageSize) {
        return cb(new Error("Image size should not exceed 10 MB"));
      }
    }

    if (file.mimetype.startsWith("video/")) {
      if (parseInt(req.headers["content-length"]) > maxVideoSize) {
        return cb(new Error("Video size should not exceed 50 MB"));
      }
    }

    cb(null, true);
  },
});

export default upload;
