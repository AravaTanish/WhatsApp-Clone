import "dotenv/config";
import express from "express";
import connectDB from "./config/dbConnect.js";

import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import logoutRoutes from "./routes/logout.routes.js";
import searchRoutes from "./routes/search.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";

import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/backend/login", authRoutes);
app.use("/backend/logout", logoutRoutes);
app.use("/backend/user", uploadRoutes);
app.use("/backend/search", searchRoutes);
app.use("/backend/friends", friendRoutes);
app.use("/backend/conversations", conversationRoutes);
app.use("/backend/message", messageRoutes);

connectDB();
app.listen(process.env.PORT, () => {
  console.log(`\nServer is listening on port: ${process.env.PORT}`);
});
