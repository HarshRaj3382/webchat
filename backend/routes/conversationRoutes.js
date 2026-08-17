import express from "express";
import { createConversation, getConversations } from "../controllers/conversationController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getConversations);
router.post("/", createConversation);

export default router;
