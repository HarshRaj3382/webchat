import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { createPost } from "../controllers/postController.js";

const router = express.Router();

router.post("/create", protectRoute, createPost);

export default router;