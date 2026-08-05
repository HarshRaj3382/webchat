import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { createPost ,getPosts} from "../controllers/postController.js";

const router = express.Router();

router.post("/create", protectRoute, createPost);
router.get("/",getPosts)
export default router;