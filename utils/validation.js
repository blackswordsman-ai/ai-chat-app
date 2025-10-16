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

module.exports = { registerValidationRules };
