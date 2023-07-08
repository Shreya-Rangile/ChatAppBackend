const express = require("express");
const router = express.Router();
const {handleGetAllUsers, handlePostUser, handlePostLogin, handlePostUserList, handleGetAUser, handlePatchAUser, handleDeleteAUser, handlePostLogout} = require('../controllers/user');
const authenticateToken = require('../middleware/auth');

router.route("/").get(authenticateToken,handleGetAllUsers).post(handlePostUser);
router.route('/login').post( handlePostLogin);
router.route("/list").post(authenticateToken, handlePostUserList);
router.route('/logout').post(authenticateToken, handlePostLogout);
router.route('/').get()
//SERVER SIDE API TO GET, PATCH, POST A PARTICULAR USER
router.route("/:id") .get(authenticateToken, handleGetAUser) .patch(authenticateToken, handlePatchAUser) .delete(authenticateToken, handleDeleteAUser);

module.exports = router;

