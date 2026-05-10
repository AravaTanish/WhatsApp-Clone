import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import { generateOtp } from "../utils/generateOtp.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import { sendWhatsAppEmailOTP } from "../services/brevoOtpService.js";
import { generateUniqueUsername } from "../utils/generateUsername.js";

export const sendOtp = asyncHandler(async (req, res) => {
  let { email } = req.body;

  if (!email) {
    throw new AppError("Email required", 404);
  }

  if (!validator.isEmail(email)) {
    throw new AppError("Invalid email", 401);
  }

  const otp = generateOtp();
  console.log("otp: ", otp);
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email: email });
  }

  await sendWhatsAppEmailOTP(email, otp);

  user.emailOtp = otp;
  user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "OTP sent successfully!" });
});

export const verify = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and OTP required", 404);
  }

  if (otp.length !== 6) {
    throw new AppError("OTP must be of 6 digits", 401);
  }

  const user = await User.findOne({ email }).select(
    "+emailOtp +emailOtpExpiry",
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.emailOtp) {
    throw new AppError("OTP not found. Please request OTP first", 404);
  }

  if (user.emailOtpExpiry.getTime() < Date.now()) {
    throw new AppError("OTP expired", 401);
  }

  if (String(user.emailOtp) !== String(otp)) {
    throw new AppError("Invalid OTP", 401);
  }

  user.isVerified = true;
  user.emailOtp = null;
  user.emailOtpExpiry = null;

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "User verified successfully",
    isCompleted: user.isCompleted,
    profilePicture: user.profilePicture ? user.profilePicture : "",
    accessToken,
    email: user.email,
    userId: user.userId ? user.userId : "No userId",
    id: user._id,
  });
});

export const resendOtp = asyncHandler(async (req, res) => {
  let { email } = req.body;

  if (!email) {
    throw new AppError("Email required", 404);
  }

  if (!validator.isEmail(email)) {
    throw new AppError("Invalid email", 401);
  }

  const otp = generateOtp();

  let user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  try {
    await sendWhatsAppEmailOTP(email, otp);
  } catch (error) {
    throw new AppError("Failed to send OTP", 500);
  }

  user.emailOtp = otp;
  user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "OTP sent successfully!" });
});

export const userIdGeneration = asyncHandler(async (req, res) => {
  const id = req.user.id;

  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const photoURL = user.profilePicture?.url || "";
  const about = user.about || "";

  // User already has a username
  if (user.userId) {
    return res.status(200).json({
      success: true,
      userId: user.userId,
      photoURL,
      about,
      change: false,
      message: "User already exists, you cannot change your username now",
    });
  }

  // Generate new username
  const email = user.email;
  const newUserId = await generateUniqueUsername(email);

  return res.status(200).json({
    success: true,
    userId: newUserId,
    photoURL,
    about,
    change: true,
    message: "Username generated successfully",
  });
});

export const checkUserId = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId || userId.length < 3) {
    return res.status(200).json({
      success: true,
      valid: false,
      message: "Username atleast of 3 characters",
    });
  }
  const user = await User.findOne({ userId: userId });
  if (!user) {
    return res
      .status(200)
      .json({ success: true, valid: true, message: "Username available" });
  }
  return res.status(200).json({
    success: true,
    valid: false,
    message: "User with this username already exists",
  });
});

export const complete = asyncHandler(async (req, res) => {
  const { photoURL, userId, about } = req.body;
  const id = req.user.id;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.profilePicture = photoURL;
  user.userId = userId;
  user.about = about;
  user.isCompleted = true;

  await user.save();

  return res.status(200).json({
    success: true,
    userId: user.userId,
    id: user._id,
    profilePicture: user.profilePicture,
    email: user.email,
    isCompleted: user.isCompleted,
    message: "Profile setup completed",
  });
});

export const me = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const user = await User.findById(id).lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "User details fetched",
    userId: user.userId,
    id: user._id,
    profilePicture: user.profilePicture,
    email: user.email,
    isCompleted: user.isCompleted,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError("No refresh token", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new AppError("Invalid refresh token", 403);
  }

  const user = await User.findById(decoded.userId).select("+refreshToken");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.refreshToken !== refreshToken) {
    throw new AppError("Refresh token mismatch", 403);
  }

  const newAccessToken = generateAccessToken(user._id);

  return res.status(200).json({
    success: true,
    accessToken: newAccessToken,
  });
});
