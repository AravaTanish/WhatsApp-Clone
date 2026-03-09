import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  deleteMessageForEveryone,
  deleteMessageForMe,
  fetchMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:conversationId", authMiddleware, fetchMessages);
router.post("/:id/send", authMiddleware, sendMessage);
router.delete("/delete-me", authMiddleware, deleteMessageForMe);
router.delete("/delete-everyone", authMiddleware, deleteMessageForEveryone);

export default router;
