import express from "express";
import {
  createLiveKitToken,
  endCall,
  getCallConfiguration,
  heartbeatCall,
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
router.patch("/:callId/heartbeat", heartbeatCall);
router.post("/:callId/token", createLiveKitToken);

export default router;
