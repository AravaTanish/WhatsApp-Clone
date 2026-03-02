import express from "express";
import {
  acceptRequest,
  addFriend,
  profile,
  rejectRequest,
  removeFriend,
  showAllFriends,
  showPendingRequests,
} from "../controllers/friend.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addFriend);
router.delete("/remove/:receiverId", authMiddleware, removeFriend);
router.post("/accept", authMiddleware, acceptRequest);
router.post("/reject", authMiddleware, rejectRequest);
router.get("/pending-requests", authMiddleware, showPendingRequests);
router.get("/all-friends", authMiddleware, showAllFriends);
router.get("/profile/:userId", authMiddleware, profile);

export default router;
