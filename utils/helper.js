const fs =require('fs').promises;
const ChatBot = require('../models/chatBotModel');
const Conversation = require('../models/conversationModel');
const Chat = require('../models/chatModel');

const deleteFile =async(filePath) => {
    try{
   await fs.unlink(filePath)
   console.log("file deleted successfully");
   
    } catch(error){
        console.error("Error deleting file:",error);
    }
}

const checkBotExists = async (chatBotId) => {
    try {
        const chatBot = await ChatBot.findById(chatBotId);
        if (!chatBot) {
            return {
                exists: false,
                message: "ChatBot not found"
            };
        }
        
        if (chatBot.status !== 1) {
            return {
                exists: false,
                message: "ChatBot is inactive"
            };
        }
        
        return {
            exists: true,
            chatBot: chatBot,
            message: "ChatBot is active and available"
        };
    } catch (error) {
        console.error("Error checking bot existence:", error);
        return {
            exists: false,
            message: "Error validating ChatBot"
        };
    }
}

const checkConversationExists = async (conversationId, userId) => {
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return {
                exists: false,
                message: "Conversation not found"
            };
        }
        
        if (conversation.userId.toString() !== userId.toString()) {
            return {
                exists: false,
                message: "Conversation does not belong to this user"
            };
        }
        
        return {
            exists: true,
            conversation: conversation,
            message: "Conversation is valid and accessible"
        };
    } catch (error) {
        console.error("Error checking conversation existence:", error);
        return {
            exists: false,
            message: "Error validating conversation"
        };
    }
}

const checkChatExists = async (chatId, userId) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return {
                exists: false,
                message: "Chat not found"
            };
        }
        
        if (chat.userId.toString() !== userId.toString()) {
            return {
                exists: false,
                message: "Chat does not belong to this user"
            };
        }
        
        return {
            exists: true,
            chat: chat,
            message: "Chat is valid and accessible"
        };
    } catch (error) {
        console.error("Error checking chat existence:", error);
        return {
            exists: false,
            message: "Error validating chat"
        };
    }
}

module.exports = {
    deleteFile,
    checkBotExists,
    checkConversationExists,
    checkChatExists
};