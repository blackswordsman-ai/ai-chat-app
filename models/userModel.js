const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true

    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}
,{ timestamps:{createdAt:true, updatedAt: true} }
);


const User = mongoose.model('User', userSchema);

module.exports = User;