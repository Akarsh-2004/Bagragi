const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes.js');
const hotelRoutes=require('./routes/hotel.routes');
const infoRoutes= require('./routes/info.routes');
const inflationRoutes = require('./routes/inflation.routes');
const costRoutes = require('./routes/cost.route');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Mount auth routes at /api
app.use('/api', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/info', inflationRoutes);
app.use('/api/cost', costRoutes);


module.exports = app;



