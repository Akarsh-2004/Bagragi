const express = require('express');
const router = express.Router();
const { getCostOfLiving } = require('../controllers/cost.controller');

// Example: /api/cost-of-living?place=mumbai&type=City
router.get('/cost-of-living', getCostOfLiving);

module.exports = router;
