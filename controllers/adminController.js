const ChatBot = require("../models/chatBotModel");
const {validationResult} = require('express-validator');
const path = require('path');
const {deleteFile} = require('../utils/helper');

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
            image: 'uploads/images/' + req.file.filename
           
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

const updateChatBot = async (req, res) => {
 try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const{id,name,message,promptMessage,image} = req.body;
        
      
        const data= {
            name,
            message,
            promptMessage
        }

        if(req.file !== undefined){
    
        data.image = 'uploads/images/' + req.file.filename;
        const chatBot = await ChatBot.findOne({_id:id});

        const oldFilePath = path.join(__dirname, '../public/'+ chatBot.image);
         await deleteFile(oldFilePath);    
} 
  const chatBotData = await   ChatBot.findByIdAndUpdate(id,
        {
            $set:data
            
        },
        {
            new:true
        }
    )
    
    return res.status(200).json({
        success: true,
        message: "Chat bot updated successfully",
        data: chatBotData
    });
    
    }catch (error) {
        console.error("Error updating chatbot:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data:chatBotData
        });
    }
};


const deleteChatBots = async (req, res) => {
    try {
        const errors = validationResult(req);
         if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const {id} = req.body; // Expecting an array of IDs to delete
        const chatBots = await ChatBot.find({_id:id});

        // Delete associated files
        for (const chatBot of chatBots) {
            const oldFilePath = path.join(__dirname, '../public/' + chatBot.image);
            await deleteFile(oldFilePath);
        }

        const data = await ChatBot.deleteOne({_id:id})
        return res.status(200).json({
            success: true,
            message: "Chat bots deleted successfully",
            data:data
        });
    } catch (error) {
        console.error("Error fetching chat bots:", error);
         return res.status(500).json({
            success: false,
            message: "Internal server error",
            data:data
        });
    }
}




    
    

    
module.exports = {
    addChatBot,
    getChatBots,
    updateChatBot,
    deleteChatBots
};