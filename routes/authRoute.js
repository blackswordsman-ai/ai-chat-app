const express = require('express');
const router =express.Router();
const authController = require("../controllers/authController");    
const {registerValidationRules} = require("../utils/validation");



router.post('/register', registerValidationRules, authController.register);



module.exports = router;