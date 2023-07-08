const express = require("express");
const router = express.Router();
const {handlePostChat, handlePostSendMessage, handlePostChatList} = require('../controllers/chat');
const authenticateToken = require('../middleware/auth');


router.route("/send-message").post(authenticateToken,handlePostSendMessage);
router.route("/:id").post(authenticateToken,handlePostChat);
router.route("/").post(authenticateToken,handlePostChatList);

module.exports = router;

