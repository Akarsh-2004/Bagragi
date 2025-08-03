const express = require('express');
const router = express.Router();
const { getCountryHistory, getCountryRelations } = require('../controllers/info.controller');

router.get('/history/:country', getCountryHistory);
router.get('/relations/:country1/:country2', getCountryRelations);

module.exports = router;
