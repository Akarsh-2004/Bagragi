const express = require('express');
const router = express.Router();
const { createTripPlan, getTripSuggestions } = require('../controllers/trip.controller');

// Create a trip plan
router.post('/plan', createTripPlan);

// Get trip suggestions for a destination
router.get('/suggestions/:destination', getTripSuggestions);

module.exports = router; 