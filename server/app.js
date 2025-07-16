const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes.js');
const hotelRoutes=require('./routes/hotel.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Mount auth routes at /api
app.use('/api', authRoutes);
app.use('/api/hotels', hotelRoutes);
module.exports = app;
