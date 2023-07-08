const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Token = require('../models/token');
const authenticateToken = require('../middleware/auth');

async function handleGetAllUsers(req, res){
    try {
        const users = await User.find({}).select('-password -__v');
        return res.send({ statusCode: 200, message: 'success', data: users });
      } catch (err) {
        console.log(err);
      }
}

async function handlePostUser(req, res){
     var Name = req.body.name;
    var email = req.body.email;
    var dob = req.body.dob;
    var contactNo = req.body.contact;
    var userPassword = req.body.password;
    // console.log(Name);
    const existingUser = await User.findOne({
      email: email
    });
    if (existingUser) {
      return res.send("User already exists!");
    }
    const user = new User({
      name: Name,
      email: email,
      dob: dob,
      contact: contactNo,
      password: userPassword
    });
    try {
      await user.save();
      res.send("User created successfully!");
    } catch (err) {
      console.log(err);
      res.status(500).send("An error occurred.");
    }
}

async function handlePostLogin(req, res){
    User.find({ email: req.body.email }).exec().then(user => {
      if (user.length < 1) {
        return res.status(401).send("User does not exist");
      }
      bcrypt.compare(req.body.password, user[0].password, async (err, result) => {
        if (err) {
          return res.status(500).send("An error occurred.");
        }
        if (!result) {
          return res.status(401).send("Password does not match");
        }
        const token = jwt.sign({
          ID: user[0]._id,
          email: user[0].email
        },
          'Dummy text',
          {
            expiresIn: "24h"
          });

        // await Token.findOneAndUpdate({userId: user[0]._id}, {$set: {updatedAt: Date.now()}}, {upsert: true});
          const exists = await Token.findOne({userId: user[0]._id});
          if(exists){
            await Token.updateOne({userId: user[0]._id}, {$set: {updatedAt: Date.now(), userToken: token}});
          }else{
            const newToken = new Token({
              userId: user[0]._id,
              userToken: token,
            })
            await newToken.save();
          }

          
        res.status(200).json({
          id: user[0]._id,
          email: user[0].email,
          token: token,
          name: user[0].name,
        });
      });
    }).catch(err => {
      res.status(500).send("An error occurred.");
    });
}

async function handlePostUserList(req, res){
 const currentUser = req.body.id;
  try {
    const users = await User.find({ _id: { $ne: currentUser } }).select('-password -__v -dob -email');
    return res.send({ statusCode: 200, message: 'success', data: users });

  }
  catch (err) {
    console.log(err);
    return res.status(500).send({ statusCode: 500, message: 'Internal server error' });

  }
}

async function handleGetAUser(req, res) {
  var userId = req.params.id;
  try {
    const user = await User.findOne({ _id: userId }).select('-password -__v');
    if (user) {
      return res.send({ statusCode: 200, message: 'success', data: user })
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred.");
  }
}

async function handlePatchAUser (req, res) {
  const userId = req.params.id;
  const { name, email, contact, dob } = req.body;
  if (req.body.password) {
    res.status(422).send("Password is not accepted while updating")
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name, email, contact, dob
      }
    ).select('-password');
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.send(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred.");
  }
}

async function handleDeleteAUser(req, res) {
  var userId = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(userId).select('-password -__v');

    console.log("Deleted");

    if (!deletedUser) { return res.status(404).send("User not found"); }
    return res.send(deletedUser);
  }
  catch (err) {
    console.log(err);
    return res.status(500).send("An error occurred.");
  }
}

async function handlePostLogout(req, res){
  const {id} = req.body;
  console.log("current user when logout is: "+ id);
  try{
    const userToLogout = await Token.findOneAndDelete({userId: id});
    if(!userToLogout){
      return res.status(404).send("Unable to logout");
    }
    return res.status(200).send("Successfully logged out");
  }catch(err){
    console.log(err);
    return res.status(500).send("Internal Server Error. Unable to logout");
  }
}


module.exports = {
    handleGetAllUsers,
    handlePostUser,
    handlePostLogin,
    handlePostUserList,
    handleGetAUser,
    handlePatchAUser,
    handleDeleteAUser,
    handlePostLogout,
}


