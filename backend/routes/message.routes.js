import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  fetchMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:conversationId", authMiddleware, fetchMessages);
router.post("/:id/send", authMiddleware, sendMessage);

export default router;
