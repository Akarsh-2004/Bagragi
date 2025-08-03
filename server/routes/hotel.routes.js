const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/', verifyToken, hotelController.createHotel); // ✅ Host only
router.get('/', hotelController.getAllHotels);              // ✅ Public
router.get('/:id', hotelController.getHotelById);           // ✅ Public
router.get('/host/my-hotels', verifyToken, hotelController.getHotelsByHost); // ✅ Host dashboard
router.put('/:id', verifyToken, hotelController.updateHotel); // ✅ Host only
router.delete('/:id', verifyToken, hotelController.deleteHotel); // ✅ Host only

module.exports = router;
