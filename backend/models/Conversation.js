import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
      validate: {
        validator: (participants) => participants.length === 2,
        message: "A direct conversation must have exactly two participants",
      },
    },
    participantKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

export const makeParticipantKey = (...participantIds) =>
  participantIds.map(String).sort().join(":");

export default mongoose.model("Conversation", conversationSchema);
