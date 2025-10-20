const { body } = require("express-validator");
const User = require("../models/userModel"); // Adjust the path as necessary

const registerValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .trim(),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use");
      }
      return true;
    })
    .trim(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const userLoginRules = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .trim(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password is required"),
];


const addChatBotRules = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .trim(),
  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .trim(),
  body("promptMessage")
    .notEmpty()
    .withMessage("promptMessage is required")
    .trim(),
  body('image').custom((value, {req}) => {
    // Check if file was uploaded
    if (!req.file) {
      throw new Error('Image file is required');
    }
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new Error('Only .png, .jpg and .jpeg format allowed!');
    }
    
    // Validate file size (optional - limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB');
    }
    
    return true;
  }),

  
];

const updateChatBotRules = [
  body("id")
    .notEmpty()
    .withMessage("ID cannot be empty")
    .trim(),
    body("name")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .trim(),
  body("message")
    .optional()
    .notEmpty()
    .withMessage("Message cannot be empty")
    .trim(),
  body("promptMessage")
    .optional()
    .notEmpty()
    .withMessage("promptMessage cannot be empty")
    .trim(),
  body('image').custom((value, {req}) => {
    if (req.file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Only .png, .jpg and .jpeg format allowed!');
      }
      
      // Validate file size (optional - limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 5MB');
      }
    }
    return true;
  }),
];

const deleteChatBotRules = [
  body("id")
    .notEmpty()
    .withMessage("ID cannot be empty")
    .trim(),
];

const sendMessageRules = [
  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
  body("chatBotId")
    .notEmpty()
    .withMessage("ChatBot ID is required")
    .isMongoId()
    .withMessage("Invalid ChatBot ID format"),
  body("conversationId")
    .optional()
    .isMongoId()
    .withMessage("Invalid Conversation ID format"),
];

module.exports = { 
  registerValidationRules,
  userLoginRules,
  addChatBotRules,
  updateChatBotRules,
  deleteChatBotRules,
  sendMessageRules
 };
