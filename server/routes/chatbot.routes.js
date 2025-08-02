const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatbot.controller');

// Handle chat messages
router.post('/chat', handleChat);

module.exports = router; 