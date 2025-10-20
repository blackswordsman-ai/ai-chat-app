const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    chatBotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatBot",
    },
    lastMessage: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
