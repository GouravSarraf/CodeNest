const express = require('express');
const router = express.Router();
const { generateInvite, verifyInvite } = require('../controllers/inviteController');
const { verifyAccessToken } = require('../middleware/authMiddleware');
router.post('/generateInvite', verifyAccessToken, generateInvite);
router.get('/verifyInvite/:inviteId', verifyAccessToken, verifyInvite);

module.exports = router;