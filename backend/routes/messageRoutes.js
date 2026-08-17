import express from "express";
import { getMessages, markMessagesRead, sendMessage } from "../controllers/messageController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/:conversationId", getMessages);
router.post("/:conversationId", sendMessage);
router.put("/:conversationId/read", markMessagesRead);

export default router;
