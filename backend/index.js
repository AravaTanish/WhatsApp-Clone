import "dotenv/config";
import express from "express";
import connectDB from "./config/dbConnect.js";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
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
app.use("/backend/user", uploadRoutes);

connectDB();
app.listen(process.env.PORT, () => {
  console.log(`\nServer is listening on port: ${process.env.PORT}`);
});
