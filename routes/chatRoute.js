const express = require('express');
const router =express.Router();
const chatController = require("../controllers/chatController");    
const {sendMessageRules } = require("../utils/validation");
const auth = require("../middlewares/auth");


router.post('/sendMessage',auth,sendMessageRules, chatController.sendMessage);


module.exports = router;