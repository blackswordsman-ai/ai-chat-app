const ChatBot = require("../models/chatBotModel");
const {validationResult} = require('express-validator');

const addChatBot = async (req, res) => {
 try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const{name,message,promptMessage,image} = req.body;
        
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required"
            });
        }
        
        const  chatBot=  new ChatBot({
            name,
            message,
            promptMessage,
            image: 'images/' + req.file.filename
           
        })
        await chatBot.save();

     return res.status(201).json({
        success:true,
        message:"Chat Bot added successfully",
        data:chatBot 
        
     })
       
        } catch (error) {
        console.error("Error adding chatbot:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}




const getChatBots = async (req, res) => {
    try {
        const chatBots = await ChatBot.find({})
            .sort({ createdAt: -1 }) // Sort by newest first
            .select('-__v'); // Exclude version field

        return res.status(200).json({
            success: true,
            message: "Chat bots retrieved successfully",
            count: chatBots.length,
            data: chatBots
        });

    } catch (error) {
        console.error("Error fetching chat bots:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    addChatBot,
    getChatBots
};