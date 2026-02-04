import express from "express";
import upload from "../middlewares/multer.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  uploadProfilePhoto,
  removeProfilePhoto,
} from "../controllers/upload.controller.js";

const router = express.Router();

router.post(
  "/profile-photo",
  authMiddleware,
  upload.single("photo"),
  uploadProfilePhoto,
);
router.delete("/profile-photo", authMiddleware, removeProfilePhoto);

export default router;
