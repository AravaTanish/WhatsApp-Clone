import User from "../models/user.model.js";

export const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await User.find(
      {
        userId: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      "userId profilePicture.url",
    ).limit(20);
    return res
      .status(200)
      .json({ success: true, message: "Users fetched", users });
  } catch (error) {
    console.error("Search error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
