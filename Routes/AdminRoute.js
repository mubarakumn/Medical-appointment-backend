const express = require('express');
const authMiddleware = require('../MiddleWares/authMiddleware');
const { getAdminStats } = require('../Controllers/AdminCtrl');

const router = express.Router();

router.get('/stats', authMiddleware, getAdminStats);


module.exports = router;
