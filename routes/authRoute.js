const express = require('express');
const router =express.Router();
const authController = require("../controllers/authController");    
const {registerValidationRules,userLoginRules} = require("../utils/validation");
const auth = require("../middlewares/auth");


router.post('/register', registerValidationRules, authController.register);
router.post('/login', userLoginRules, authController.login);

router.get('/profile', auth,authController.profile);



module.exports = router;