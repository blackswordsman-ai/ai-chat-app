const {validationResult} = require('express-validator');
const User = require("../models/userModel");
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const {name, email, password} = req.body;
        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: encryptedPassword
        })
        await newUser.save();
        res.status(201).json({
            success: true,
            message:errors.message
        });
    } catch (error) {
        
    }
}

module.exports = {register};


