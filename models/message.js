const mongoose = require("mongoose");
const User = require('./user');
const Chat = require('./chat');

//---------MESSAGE---------
const messageSchema = new mongoose.Schema({
    senderId: {
      type: mongoose.Schema.ObjectId,
      ref: User
    },
    receiverId: {
      type: mongoose.Schema.ObjectId,
      ref: User
    },
    chatId: {
      type: mongoose.Schema.ObjectId,
      ref: Chat
    },
    message: String,
    sentAt: { type: Date, default: Date.now },
    type: { type: String, default: "text" },
    filename: String,
    isRead: { type: Boolean, default: false },
    senderName: String,
  });
  
  const Message = mongoose.model("Message", messageSchema);

  module.exports = Message;