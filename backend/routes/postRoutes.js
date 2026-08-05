import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  createPost,
  getPosts,
  likePost,
} from "../controllers/postController.js";

const router = express.Router();

// Get All Posts
router.get("/", getPosts);

// Create Post
router.post("/create", protectRoute, createPost);

// Like / Unlike Post
router.put("/:id/like", protectRoute, likePost);

export default router;