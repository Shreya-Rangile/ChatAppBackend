const express = require('express');

const userRoute = require('./user');
const chatRoutes = require('./chat');
const groupRoutes = require('./group');
const uploadRoutes = require('./upload');

const router = express.Router();

router.use('/users', userRoute);
router.use('/chat', chatRoutes);
router.use('/group', groupRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;

