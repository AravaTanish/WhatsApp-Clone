import express from "express";
import {
  verify,
  refresh,
  sendOtp,
  resendOtp,
  userIdGeneration,
  checkUserId,
  complete,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", sendOtp);
router.post("/verify", verify);
router.post("/refresh", refresh);
router.put("/resend-otp", resendOtp);
router.post("/userId-generation", authMiddleware, userIdGeneration);
router.post("/check-userId", authMiddleware, checkUserId);
router.post("/complete", authMiddleware, complete);

export default router;
