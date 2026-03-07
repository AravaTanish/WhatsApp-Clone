import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  fetchConversations,
  findConversation,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/", authMiddleware, fetchConversations);
router.get("/:userId", authMiddleware, findConversation);

export default router;
