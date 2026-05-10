import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await User.updateOne(
      { refreshToken: refreshToken },
      {
        $unset: { refreshToken: "" },
      },
    );
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
