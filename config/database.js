    // config/database.js
    const mongoose = require("mongoose");

    const connect = async () => {
    try {
        // Just call mongoose.connect with URI (no deprecated options)
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");  // this will run after connection
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);  // stop the process if DB fails
    }
    };

    module.exports = { connect };
