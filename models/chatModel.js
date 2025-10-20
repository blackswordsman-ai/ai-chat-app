const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    chatBotId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ChatBot",
        },
    lastMessage: {
      type: String,
      required: true,
    },
    userMessage:{
        type: String,
        default: ''
    },
    aiMessage:{
        type: String,
        default: ''
    }

  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
