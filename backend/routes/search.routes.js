import express from "express";
import { searchUsers } from "../controllers/search.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/users", authMiddleware, searchUsers);

export default router;
