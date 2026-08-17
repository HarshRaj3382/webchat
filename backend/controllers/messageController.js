import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const canAccessConversation = (conversation, userId) =>
  conversation?.participants.some((participantId) => String(participantId) === String(userId));

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!canAccessConversation(conversation, req.user._id)) {
      return res.status(403).json({ success: false, message: "Conversation access denied" });
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const filter = { conversation: conversationId };

    if (req.query.before) {
      const before = new Date(req.query.before);
      if (!Number.isNaN(before.getTime())) filter.createdAt = { $lt: before };
    }

    const messages = await Message.find(filter)
      .populate("sender", "username profilePic")
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();
    messages.reverse();

    return res.json({ success: true, messages, hasMore });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const content = String(req.body.content || "").trim();

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation" });
    }
    if (!content || content.length > 2000) {
      return res.status(400).json({ success: false, message: "Message must be between 1 and 2000 characters" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!canAccessConversation(conversation, req.user._id)) {
      return res.status(403).json({ success: false, message: "Conversation access denied" });
    }

    let message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content,
      readBy: [req.user._id],
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();
    message = await message.populate("sender", "username profilePic");

    const io = req.app.get("io");
    io?.to(conversation.participants.map((participantId) => `user:${participantId}`)).emit(
      "message:new",
      message
    );

    return res.status(201).json({ success: true, message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markMessagesRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!canAccessConversation(conversation, req.user._id)) {
      return res.status(403).json({ success: false, message: "Conversation access denied" });
    }

    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    const io = req.app.get("io");
    io?.to(conversation.participants.map((participantId) => `user:${participantId}`)).emit(
      "messages:read",
      { conversationId: String(conversation._id), userId: String(req.user._id) }
    );

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { canAccessConversation };
