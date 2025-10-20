const express = require('express');
const router =express.Router();
const chatController = require("../controllers/chatController");    
const { } = require("../utils/validation");
const auth = require("../middlewares/auth");


router.post('/sendMessage', chatController.sendMessage);


module.exports = router;