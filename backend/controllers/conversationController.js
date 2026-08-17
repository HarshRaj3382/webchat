import mongoose from "mongoose";
import Conversation, { makeParticipantKey } from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const populateConversation = (query) =>
  query
    .populate("participants", "username email profilePic")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "username profilePic" },
    });

export const listUsers = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = { _id: { $ne: req.user._id } };

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { username: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("username email profilePic")
      .sort({ username: 1 })
      .limit(20);

    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await populateConversation(
      Conversation.find({ participants: req.user._id }).sort({ lastMessageAt: -1 })
    );

    const withUnreadCounts = await Promise.all(
      conversations.map(async (conversation) => ({
        ...conversation.toObject(),
        unreadCount: await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
        }),
      }))
    );

    return res.json({ success: true, conversations: withUnreadCounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(userId) || String(userId) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "Choose a valid user" });
    }

    const targetUser = await User.findById(userId).select("_id");
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const participantKey = makeParticipantKey(req.user._id, userId);
    let conversation;

    try {
      conversation = await Conversation.findOneAndUpdate(
        { participantKey },
        {
          $setOnInsert: {
            participantKey,
            participants: [req.user._id, userId],
          },
        },
        { new: true, upsert: true, runValidators: true }
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      conversation = await Conversation.findOne({ participantKey });
    }

    conversation = await populateConversation(Conversation.findById(conversation._id));

    return res.status(201).json({
      success: true,
      conversation: { ...conversation.toObject(), unreadCount: 0 },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
