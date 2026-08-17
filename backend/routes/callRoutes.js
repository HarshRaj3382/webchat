import express from "express";
import {
  createLiveKitToken,
  endCall,
  getCallConfiguration,
  respondToCall,
  startCall,
} from "../controllers/callController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/config", getCallConfiguration);
router.post("/", startCall);
router.patch("/:callId/respond", respondToCall);
router.patch("/:callId/end", endCall);
router.post("/:callId/token", createLiveKitToken);

export default router;
