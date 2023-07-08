const mongoose = require("mongoose");
const User = require('./user');
const Group = require('./group');


//---------GROUP PARTICIPANT---------
const groupParticipantSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: User
    },
    groupId: {
      type: mongoose.Schema.ObjectId,
      ref: Group
    },
    isAdmin: { type: Boolean, default: false },
    isActive: {type: Boolean, default: true}
  });
  
  const GroupParticipant = mongoose.model("GroupParticipant", groupParticipantSchema);

  module.exports = GroupParticipant;