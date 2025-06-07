const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, logout } = require('../controllers/authController');
const { verifyAccessToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyAccessToken, getCurrentUser);
router.post('/logout', verifyAccessToken, logout);

module.exports = router;
