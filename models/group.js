const mongoose = require("mongoose");

//---------GROUP---------
const groupSchema = new mongoose.Schema({
    name: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  const Group = mongoose.model("Group", groupSchema);

  module.exports = Group;