const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me — lấy info user hiện tại
router.get('/me', authenticate, authController.getMe);

module.exports = router;
