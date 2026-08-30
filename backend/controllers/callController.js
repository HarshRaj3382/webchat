import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { AccessToken } from "livekit-server-sdk";
import Call from "../models/Call.js";
import Conversation from "../models/Conversation.js";

const userRoom = (userId) => `user:${userId}`;
const STALE_RINGING_AFTER_MS = 60_000;
const STALE_ACCEPTED_AFTER_MS = 3 * 60_000;

const populateCall = (query) =>
  query.populate("caller receiver", "username email profilePic");

const isCallParticipant = (call, userId) =>
  call && [call.caller, call.receiver].some((participantId) =>
    String(participantId?._id || participantId) === String(userId)
  );

export const getCallConfiguration = (req, res) => {
  const configured = Boolean(
    process.env.LIVEKIT_URL &&
    process.env.LIVEKIT_API_KEY &&
    process.env.LIVEKIT_API_SECRET
  );

  return res.json({ success: true, configured });
};

export const startCall = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const type = req.body.type === "audio" ? "audio" : "video";

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });
    if (!conversation) {
      return res.status(403).json({ success: false, message: "Conversation access denied" });
    }

    const receiverId = conversation.participants.find(
      (participantId) => String(participantId) !== String(req.user._id)
    );

    const now = new Date();
    const staleRingingBefore = new Date(now.getTime() - STALE_RINGING_AFTER_MS);
    const staleAcceptedBefore = new Date(now.getTime() - STALE_ACCEPTED_AFTER_MS);
    await Call.updateMany(
      {
        conversation: conversation._id,
        $or: [
          { status: "ringing", createdAt: { $lt: staleRingingBefore } },
          {
            status: "accepted",
            $or: [
              { lastActiveAt: { $lt: staleAcceptedBefore } },
              { lastActiveAt: { $exists: false }, startedAt: { $lt: staleAcceptedBefore } },
            ],
          },
        ],
      },
      { $set: { status: "ended", endedAt: now } }
    );

    const existingCall = await Call.findOne({
      conversation: conversation._id,
      status: { $in: ["ringing", "accepted"] },
    });
    if (existingCall) {
      return res.status(409).json({ success: false, message: "A call is already active in this conversation" });
    }

    let call = await Call.create({
      conversation: conversation._id,
      roomName: `webchat-${randomUUID()}`,
      caller: req.user._id,
      receiver: receiverId,
      type,
    });
    call = await populateCall(Call.findById(call._id));

    const io = req.app.get("io");
    io?.to(userRoom(receiverId)).emit("call:incoming", call);

    const callId = call._id;
    setTimeout(async () => {
      try {
        const missedCall = await Call.findOneAndUpdate(
          { _id: callId, status: "ringing" },
          { $set: { status: "missed", endedAt: new Date() } },
          { new: true }
        );
        if (missedCall) {
          io?.to([userRoom(missedCall.caller), userRoom(missedCall.receiver)]).emit(
            "call:ended",
            missedCall
          );
        }
      } catch (error) {
        console.error("Failed to expire unanswered call:", error.message);
      }
    }, 45_000);

    return res.status(201).json({ success: true, call });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToCall = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.callId)) {
      return res.status(400).json({ success: false, message: "Invalid call" });
    }

    const accepted = req.body.accepted === true || req.body.accepted === "true";
    const call = await Call.findById(req.params.callId);
    if (!call) {
      return res.status(404).json({ success: false, message: "Call not found" });
    }
    if (String(call.receiver) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the receiver can respond to this call" });
    }

    // Accept is idempotent. This protects against a double click or a delayed
    // retry after the first request was already committed by the server.
    if (accepted && call.status === "accepted") {
      const populatedCall = await populateCall(Call.findById(call._id));
      return res.json({ success: true, call: populatedCall });
    }
    if (call.status !== "ringing") {
      return res.status(409).json({ success: false, message: "Call is no longer available" });
    }

    call.status = accepted ? "accepted" : "rejected";
    if (accepted) {
      call.startedAt = new Date();
      call.lastActiveAt = new Date();
    }
    else call.endedAt = new Date();
    await call.save();

    const populatedCall = await populateCall(Call.findById(call._id));
    const eventName = accepted ? "call:accepted" : "call:rejected";
    req.app.get("io")
      ?.to([userRoom(call.caller), userRoom(call.receiver)])
      .emit(eventName, populatedCall);

    return res.json({ success: true, call: populatedCall });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const heartbeatCall = async (req, res) => {
  try {
    const call = await Call.findById(req.params.callId);
    if (!isCallParticipant(call, req.user._id)) {
      return res.status(403).json({ success: false, message: "Call access denied" });
    }
    if (call.status !== "accepted") {
      return res.status(409).json({ success: false, message: "The call is no longer active" });
    }

    call.lastActiveAt = new Date();
    await call.save();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const endCall = async (req, res) => {
  try {
    const call = await Call.findById(req.params.callId);
    if (!isCallParticipant(call, req.user._id)) {
      return res.status(403).json({ success: false, message: "Call access denied" });
    }
    if (!["ringing", "accepted"].includes(call.status)) {
      return res.json({ success: true, call });
    }

    call.status = call.status === "ringing" ? "missed" : "ended";
    call.endedAt = new Date();
    await call.save();

    req.app.get("io")
      ?.to([userRoom(call.caller), userRoom(call.receiver)])
      .emit("call:ended", call);

    return res.json({ success: true, call });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createLiveKitToken = async (req, res) => {
  try {
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
      return res.status(503).json({
        success: false,
        message: "LiveKit is not configured on the server yet",
      });
    }

    const call = await Call.findById(req.params.callId);
    if (!isCallParticipant(call, req.user._id)) {
      return res.status(403).json({ success: false, message: "Call access denied" });
    }
    if (call.status !== "accepted") {
      return res.status(409).json({ success: false, message: "The call must be accepted before joining" });
    }

    const accessToken = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: String(req.user._id),
        name: req.user.username,
        metadata: JSON.stringify({ profilePic: req.user.profilePic || "" }),
        ttl: "1h",
      }
    );

    accessToken.addGrant({
      roomJoin: true,
      room: call.roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return res.json({
      success: true,
      token: await accessToken.toJwt(),
      url: process.env.LIVEKIT_URL,
      call,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
