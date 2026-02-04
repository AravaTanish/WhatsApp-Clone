import User from "../models/user.model.js";

const baseUsernameFromEmail = (email) => {
  return email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z]/g, "");
};

export const generateUniqueUsername = async (email) => {
  const base = baseUsernameFromEmail(email);

  let username = "";
  while (true) {
    const suffix = Math.floor(100 + Math.random() * 900);
    username = `${base}_${suffix}`;
    const exists = await User.exists({ username });
    if (!exists) return username;
  }
};
