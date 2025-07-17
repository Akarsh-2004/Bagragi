const express = require('express');
const router = express.Router();
const { getInflation } = require('../controllers/inflation.controller');

router.get('/inflation/:country', getInflation);

module.exports = router;
