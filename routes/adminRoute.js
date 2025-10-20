const express = require("express");
const router = express.Router();

const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, path.join(__dirname, "../public/uploads/images"));
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + path.extname(file.originalname);
    cb(null, name);
  },
});

const fileFilter = function (req, file, cb) {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
const adminController = require("../controllers/adminController");
const  { addChatBotRules,updateChatBotRules,deleteChatBotRules } = require("../utils/validation");
const auth = require("../middlewares/auth");
const adminAuth = require("../middlewares/adminAuth");

router.post(
  "/add-chat-bot",
  auth,
  upload.single("image"),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB'
        });
      }
    }
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  },
  addChatBotRules,
  adminController.addChatBot
);

router.get('/chat-bots', adminAuth, adminController.getChatBots);

router.put(
  "/update-chat-bot",
  adminAuth,
  upload.single("image"),
  updateChatBotRules,
  adminController.updateChatBot
);

router.delete(
  "/delete-chat-bots",
  adminAuth,
  deleteChatBotRules,
  adminController.deleteChatBots
);



module.exports = router;
