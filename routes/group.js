const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { handlePostCreateGroup, handlePostAddInGroup, handlePostGroupList, handlePostSendGroup, handlePostDeleteFromGroup, handlePostParticipants, handlePostGroupChat } = require('../controllers/group');
const authenticateToken = require('../middleware/auth');

router.route("/create") .post(authenticateToken,handlePostCreateGroup);
router.route("/add") .post(authenticateToken,handlePostAddInGroup);
router.route("/sendmessage") .post(authenticateToken,handlePostSendGroup);
router.route("/participants") .post(authenticateToken,handlePostParticipants);
router.route("/delete-from-group") .post(authenticateToken,handlePostDeleteFromGroup);
router.route("/:chatId") .post(authenticateToken,handlePostGroupChat);
router.route("/") .post(authenticateToken,handlePostGroupList);

module.exports = router;