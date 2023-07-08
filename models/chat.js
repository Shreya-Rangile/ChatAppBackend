const mongoose = require("mongoose");
const User = require('./user');
const Group = require('./group');

//---------CHAT---------
const chatSchema = new mongoose.Schema({
    senderId: {
      type: mongoose.Schema.ObjectId,
      ref: User
    },
    receiverId: {
      type: mongoose.Schema.ObjectId,
      ref: User
    },
    groupId: {
      type: mongoose.Schema.ObjectId,
      ref: Group
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastMessage: String,
    chatType: { type: String, default: "individual" },
    groupName: String,
  });
  
  const Chat = mongoose.model("Chat", chatSchema);

  module.exports = Chat;