import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

const userRoom = (userId) => `user:${userId}`;
const conversationRoom = (conversationId) => `conversation:${conversationId}`;
const socketError = (message) => ({ success: false, message });

export const initializeSocket = (io) => {
  const onlineSockets = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("username email profilePic");
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      return next();
    } catch {
      return next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user._id);
    const sockets = onlineSockets.get(userId) || new Set();
    sockets.add(socket.id);
    onlineSockets.set(userId, sockets);
    socket.join(userRoom(userId));

    socket.emit("presence:snapshot", [...onlineSockets.keys()]);
    socket.broadcast.emit("presence:update", { userId, online: true });

    socket.on("conversation:join", async ({ conversationId } = {}, acknowledge = () => {}) => {
      try {
        if (!mongoose.isValidObjectId(conversationId)) return acknowledge(socketError("Invalid conversation"));
        const conversation = await Conversation.findOne({ _id: conversationId, participants: socket.user._id });
        if (!conversation) return acknowledge(socketError("Conversation access denied"));

        for (const room of socket.rooms) {
          if (room.startsWith("conversation:")) socket.leave(room);
        }
        socket.join(conversationRoom(conversationId));
        return acknowledge({ success: true });
      } catch (error) {
        return acknowledge(socketError(error.message));
      }
    });

    const relayTyping = async (eventName, { conversationId } = {}) => {
      if (!mongoose.isValidObjectId(conversationId)) return;
      const isMember = await Conversation.exists({ _id: conversationId, participants: socket.user._id });
      if (!isMember) return;
      socket.to(conversationRoom(conversationId)).emit(eventName, {
        conversationId,
        userId,
        username: socket.user.username,
      });
    };

    socket.on("typing:start", (payload) => relayTyping("typing:start", payload));
    socket.on("typing:stop", (payload) => relayTyping("typing:stop", payload));

    socket.on("disconnect", () => {
      const activeSockets = onlineSockets.get(userId);
      activeSockets?.delete(socket.id);
      if (activeSockets?.size) return;
      onlineSockets.delete(userId);
      socket.broadcast.emit("presence:update", { userId, online: false });
    });
  });
};
