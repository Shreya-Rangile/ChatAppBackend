const mongoose = require("mongoose");
const User = require('./user');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: User
    },
    userToken: String, 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expirationTime: {
        type: Date, 
       
        
    }
});


tokenSchema.pre('save', function (next) {
    const twoDaysFromNow = new Date(this.updatedAt);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    this.expirationTime = twoDaysFromNow;
    next();
  });


const Token = mongoose.model("Token", tokenSchema);


module.exports = Token;