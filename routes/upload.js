const express = require("express");
const router = express.Router();
const {handlePostUploadFiles} = require('../controllers/upload');
const {upload} = require('../multer');
const authenticateToken = require('../middleware/auth');


router.route("/") .post(upload.array("files", 10),authenticateToken, handlePostUploadFiles );

module.exports = router;
