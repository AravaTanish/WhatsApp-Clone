import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

export const searchUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const users = await User.find(
    {
      userId: {
        $regex: escapedSearch,
        $options: "i",
      },
    },
    "userId profilePicture",
  )
    .limit(20)
    .lean();
  return res
    .status(200)
    .json({ success: true, message: "Users fetched", users });
});
