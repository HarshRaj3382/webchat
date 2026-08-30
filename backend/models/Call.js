import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    roomName: {
      type: String,
      required: true,
      unique: true,
    },
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["audio", "video"],
      default: "video",
    },
    status: {
      type: String,
      enum: ["ringing", "accepted", "rejected", "missed", "ended"],
      default: "ringing",
    },
    startedAt: Date,
    lastActiveAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

callSchema.index({ caller: 1, receiver: 1, createdAt: -1 });

export default mongoose.model("Call", callSchema);
