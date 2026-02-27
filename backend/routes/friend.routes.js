import express from "express";
import { addFriend, removeFriend } from "../controllers/friend.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addFriend);
router.delete("/remove", authMiddleware, removeFriend);

export default router;
