import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { logout } from "../controllers/logout.controller.js";

const router = express.Router();

router.get("/", logout);

export default router;
