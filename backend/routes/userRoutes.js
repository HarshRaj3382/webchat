import express from "express";
import { listUsers } from "../controllers/conversationController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectRoute, listUsers);

export default router;
