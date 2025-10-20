const { GoogleGenerativeAI } = require('@google/generative-ai');
const { response } = require('express');
const { validationResult } = require('express-validator');
const Chat = require('../models/chatModel');
const Conversation = require('../models/conversationModel');
const ChatBot = require('../models/chatBotModel');
const { checkBotExists } = require('../utils/helper');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const sendMessage = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation failed",
        errors: errors.array()
      });
    }

    const { message, chatBotId, conversationId } = req.body;
    const userId = req.user?.id; // Extract user ID from authenticated user
    
    // Debug logging for authentication
    console.log("Authentication debug:", {
      hasUser: !!req.user,
      userStructure: req.user ? Object.keys(req.user) : 'no user',
      userId: userId
    });

    // Check if chat bot exists and is active
    const botCheck = await checkBotExists(chatBotId);
    if (!botCheck.exists) {
      return res.status(404).json({
        success: false,
        msg: botCheck.message
      });
    }
    
  // Try a list of candidate models until one works
  const preferredModel = process.env.GOOGLE_GEMINI_MODEL && process.env.GOOGLE_GEMINI_MODEL.trim();
  const candidates = [
    preferredModel,
    "gemini-2.0-flash-exp", // Latest Gemini 2.0 Flash experimental
    "gemini-1.5-flash",     // Current stable Gemini 1.5 Flash
    "gemini-1.5-pro",       // Current stable Gemini 1.5 Pro
    "gemini-1.5-flash-8b"   // Lightweight model
  ].filter(Boolean);

  const attemptErrors = [];
  for (const modelName of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();
      
      // Create or update conversation
      let conversation;
      try {
        // Validate required fields before database operations
        if (!userId) {
          throw new Error("User ID is required - please ensure you are properly authenticated");
        }
        if (!chatBotId) {
          throw new Error("ChatBot ID is required");
        }
        if (!text || text.trim() === '') {
          throw new Error("AI response text is required");
        }

        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
          if (conversation) {
            conversation.lastMessage = text;
            await conversation.save();
          } else {
            // Create new conversation if the provided ID doesn't exist
            conversation = new Conversation({
              userId: userId,
              chatBotId: chatBotId,
              lastMessage: text
            });
            await conversation.save();
          }
        } else {
          conversation = new Conversation({
            userId: userId,
            chatBotId: chatBotId,
            lastMessage: text
          });
          await conversation.save();
        }

        // Save chat record
        const chat = new Chat({
          userId: userId,
          conversationId: conversation._id,
          chatBotId: chatBotId,
          lastMessage: text,
          userMessage: message || '',
          aiMessage: text
        });
        await chat.save();
      } catch (dbError) {
        console.error("Database error details:", {
          message: dbError.message,
          name: dbError.name,
          code: dbError.code,
          stack: dbError.stack
        });
        // Still return the AI response even if database save fails
        return res.status(200).json({
          success: true,
          msg: "AI Response successfully (database save failed)",
          data: { 
            model: modelName, 
            response: text,
            warning: "Chat history not saved due to database error",
            errorDetails: dbError.message
          }
        });
      }

      return res.status(200).json({
        success: true,
        msg: "AI Response successfully",
        data: { 
          model: modelName, 
          response: text,
          conversationId: conversation._id,
          chatId: chat._id
        }
      });
    } catch (err) {
      attemptErrors.push({ model: modelName, error: err.message });
    }
  }


  return res.status(502).json({
    success: false,
    msg: "No supported Gemini model available for this API key",
    attemptedModels: candidates,
    errors: attemptErrors
  });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};



module.exports = {
  sendMessage,
};
