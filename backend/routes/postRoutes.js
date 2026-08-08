import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

import {
  createPost,
  getPosts,
  likePost,
  addComment,
} from "../controllers/postController.js";

const router = express.Router();

// Get All Posts
router.get("/", getPosts);

// Create Post
router.post(
  "/create",
  protectRoute,
  upload.single("image"),
  createPost
);

// Like / Unlike Post
router.put("/:id/like", protectRoute, likePost);

// Add Comment
router.post("/:id/comment", protectRoute, addComment);

export default router;