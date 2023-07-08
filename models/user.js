const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const bcrypt = require('bcrypt');


//---------USER---------
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    contact: String,
    dob: Date,
    password: String,
    createdAt: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false }
  });
  
  //BEFORE SAVE THE USER IN DATABASE, ENCRYPT THE PASSWORD
  userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) {
      return next();
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;
      next();
    } catch (error) {
      return next(error);
    }
  });
  const User = mongoose.model("User", userSchema);

  module.exports = User;