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

const createConversation = async (userId, chatBotId, lastMessage) => {
    try {
        console.log("Helper: createConversation called with:", { userId, chatBotId, lastMessage });
        
        // Validate required fields
        if (!userId) {
            console.log("Helper: User ID validation failed");
            return {
                success: false,
                message: "User ID is required"
            };
        }
        
        if (!chatBotId) {
            console.log("Helper: ChatBot ID validation failed");
            return {
                success: false,
                message: "ChatBot ID is required"
            };
        }
        
        if (!lastMessage || lastMessage.trim() === '') {
            console.log("Helper: Last message validation failed");
            return {
                success: false,
                message: "Last message is required"
            };
        }
        
        // Create new conversation
        console.log("Helper: Creating new Conversation model");
        const conversation = new Conversation({
            userId: userId,
            chatBotId: chatBotId,
            lastMessage: lastMessage.trim()
        });
        
        console.log("Helper: Saving conversation to database");
        await conversation.save();
        console.log("Helper: Conversation saved successfully:", conversation._id);
        
        return {
            success: true,
            conversation: conversation,
            message: "Conversation created successfully"
        };
    } catch (error) {
        console.error("Helper: Error creating conversation:", error);
        return {
            success: false,
            message: "Error creating conversation",
            error: error.message
        };
    }
}

const updateConversation = async (conversationId, userId, updateData) => {
    try {
        console.log("Helper: updateConversation called with:", { conversationId, userId, updateData });
        
        // Validate required fields
        if (!conversationId) {
            console.log("Helper: Conversation ID validation failed");
            return {
                success: false,
                message: "Conversation ID is required"
            };
        }
        
        if (!userId) {
            console.log("Helper: User ID validation failed");
            return {
                success: false,
                message: "User ID is required"
            };
        }
        
        // Check if conversation exists and belongs to user
        console.log("Helper: Checking if conversation exists");
        const conversationCheck = await checkConversationExists(conversationId, userId);
        console.log("Helper: Conversation check result:", conversationCheck);
        
        if (!conversationCheck.exists) {
            return {
                success: false,
                message: conversationCheck.message
            };
        }
        
        // Prepare update data (only allow specific fields)
        const allowedUpdates = {};
        if (updateData.lastMessage !== undefined) {
            allowedUpdates.lastMessage = updateData.lastMessage.trim();
        }
        if (updateData.chatBotId !== undefined) {
            allowedUpdates.chatBotId = updateData.chatBotId;
        }
        
        console.log("Helper: Updating conversation with:", allowedUpdates);
        
        // Update conversation
        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            allowedUpdates,
            { new: true, runValidators: true }
        );
        
        console.log("Helper: Conversation updated successfully:", updatedConversation._id);
        
        return {
            success: true,
            conversation: updatedConversation,
            message: "Conversation updated successfully"
        };
    } catch (error) {
        console.error("Helper: Error updating conversation:", error);
        return {
            success: false,
            message: "Error updating conversation",
            error: error.message
        };
    }
}

const createChat = async (userId, conversationId, chatData) => {
    try {
        console.log("Helper: createChat called with:", { userId, conversationId, chatData });
        
        // Validate required fields
        if (!userId) {
            console.log("Helper: User ID validation failed");
            return {
                success: false,
                message: "User ID is required"
            };
        }
        
        if (!conversationId) {
            console.log("Helper: Conversation ID validation failed");
            return {
                success: false,
                message: "Conversation ID is required"
            };
        }
        
        if (!chatData || !chatData.lastMessage || chatData.lastMessage.trim() === '') {
            console.log("Helper: Last message validation failed");
            return {
                success: false,
                message: "Last message is required"
            };
        }
        
        // Check if conversation exists and belongs to user
        console.log("Helper: Checking if conversation exists");
        const conversationCheck = await checkConversationExists(conversationId, userId);
        console.log("Helper: Conversation check result:", conversationCheck);
        
        if (!conversationCheck.exists) {
            return {
                success: false,
                message: conversationCheck.message
            };
        }
        
        // Get chatBotId from conversation
        const chatBotId = conversationCheck.conversation.chatBotId;
        
        // Create new chat
        console.log("Helper: Creating new Chat model");
        const chat = new Chat({
            userId: userId,
            conversationId: conversationId,
            chatBotId: chatBotId,
            lastMessage: chatData.lastMessage.trim(),
            userMessage: chatData.userMessage || '',
            aiMessage: chatData.aiMessage || ''
        });
        
        console.log("Helper: Saving chat to database");
        await chat.save();
        console.log("Helper: Chat saved successfully:", chat._id);
        
        return {
            success: true,
            chat: chat,
            message: "Chat created successfully"
        };
    } catch (error) {
        console.error("Helper: Error creating chat:", error);
        return {
            success: false,
            message: "Error creating chat",
            error: error.message
        };
    }
}

module.exports = {
    deleteFile,
    checkBotExists,
    checkConversationExists,
    checkChatExists,
    createConversation,
    updateConversation,
    createChat
};