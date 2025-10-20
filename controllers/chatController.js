const { GoogleGenerativeAI } = require('@google/generative-ai');
const { response } = require('express');
const { validationResult } = require('express-validator');
const Chat = require('../models/chatModel');
const Conversation = require('../models/conversationModel');
const ChatBot = require('../models/chatBotModel');
const { checkBotExists, createConversation, updateConversation, createChat } = require('../utils/helper');

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
    const userId = req.user?._id; // Extract user ID from authenticated user
    
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

        // Handle conversation creation or update using helper functions
        console.log("Starting conversation operations:", { conversationId, userId, chatBotId });
        
        if (conversationId) {
          // Try to update existing conversation
          console.log("Attempting to update conversation:", conversationId);
          const updateResult = await updateConversation(conversationId, userId, {
            lastMessage: text
          });
          console.log("Update result:", updateResult);
          
          if (updateResult.success) {
            conversation = updateResult.conversation;
            console.log("Conversation updated successfully:", conversation._id);
          } else {
            // If update fails (conversation doesn't exist or doesn't belong to user),
            // create a new conversation
            console.log("Update failed, creating new conversation");
            const createResult = await createConversation(userId, chatBotId, text);
            console.log("Create result:", createResult);
            if (createResult.success) {
              conversation = createResult.conversation;
              console.log("New conversation created:", conversation._id);
            } else {
              throw new Error(createResult.message);
            }
          }
        } else {
          // Create new conversation
          console.log("Creating new conversation");
          const createResult = await createConversation(userId, chatBotId, text);
          console.log("Create result:", createResult);
          if (createResult.success) {
            conversation = createResult.conversation;
            console.log("Conversation created successfully:", conversation._id);
          } else {
            throw new Error(createResult.message);
          }
        }

        // Create chat record using helper function
        console.log("Creating chat record with:", {
          userId, 
          conversationId: conversation._id, 
          chatBotId, 
          lastMessage: text, 
          userMessage: message || '', 
          aiMessage: text
        });
        
        const chatResult = await createChat(userId, conversation._id, {
          lastMessage: text,
          userMessage: message || '',
          aiMessage: text
        });
        
        if (!chatResult.success) {
          throw new Error(chatResult.message);
        }
        
        const chat = chatResult.chat;
        console.log("Chat record created successfully:", chat._id);
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
