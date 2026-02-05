import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/user.model.js";
import { generateOtp } from "../utils/generateOtp.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import { sendWhatsAppEmailOTP } from "../services/brevoOtpService.js";
import { generateUniqueUsername } from "../utils/generateUsername.js";

export const sendOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const otp = generateOtp();
    console.log("otp: ", otp);
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email: email });
    }

    try {
      await sendWhatsAppEmailOTP(email, otp);
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "There was an error sending OTP" });
    }

    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });
    }

    if (otp.length !== 6) {
      return res
        .status(400)
        .json({ success: false, message: "OTP must be of 6 digits" });
    }

    const user = await User.findOne({ email }).select(
      "+emailOtp +emailOtpExpiry",
    );

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (!user.emailOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request OTP first",
      });
    }

    if (user.emailOtpExpiry.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (String(user.emailOtp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
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
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const otp = generateOtp();

    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    try {
      await sendWhatsAppEmailOTP(email, otp);
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "There was an error sending OTP" });
    }

    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const userIdGeneration = async (req, res) => {
  try {
    const id = req.user.userId;

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
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
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ success: false, message: "Username generation failed." });
  }
};

export const checkUserId = async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId.length < 3) {
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
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      valid: false,
      message: "Username checking failed.",
    });
  }
};

export const complete = async (req, res) => {
  const { photoURL, userId, about } = req.body;
  const id = req.user.userId;

  const user = await User.findById(id);
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  user.profilePicture.url = photoURL;
  user.profilePicture.publicId = id;
  user.userId = userId;
  user.about = about;

  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "User login completed" });
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
    );

    // Find user
    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // (Optional but BEST PRACTICE)
    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh token mismatch",
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};
