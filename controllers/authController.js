const {validationResult} = require('express-validator');
const User = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const {name, email, password,isAdmin} = req.body;
        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: encryptedPassword,
            isAdmin
        })
        await newUser.save();
        res.status(201).json({
            success: true,
            message:errors.message
        });
    } catch (error) {
        
    }
}

const genarateAccessToken = (user) => {
const token =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
return token;
}

const genarateRefreshToken = (user) => {
const token =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'4h'});
return token;
}

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const accessToken = await genarateAccessToken({ user: userData });
    const refreshToken = await genarateRefreshToken({ user: userData });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const profile = async (req, res) => {
    try {
   const userData = req.user 
   return res.status(200).json({
    success:true,
    msg:'User profile fetched successfully',
    data:userData
   })     
 
        }
        

    
       
     catch (error) {
        
    }
}
module.exports = {
    register,
    login,
    profile
    };


