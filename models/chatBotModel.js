const mongoose = require('mongoose');

const chatBotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
    
    },
    promptMessage: {
        type: String,
        required: true

    },
    image: {
        type: String,
        required: true
    },
    status:{
        type:Number,
        enum:[0,1], // 0- inactive, 1-active
        default: 1
    }
}
,{ timestamps:{createdAt:true, updatedAt: true} }
);


const ChatBot = mongoose.model('ChatBot', chatBotSchema);

module.exports = ChatBot;