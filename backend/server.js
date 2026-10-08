const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staynest';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB:', MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`🚀 StayNest API server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints:`);
      console.log(`   GET    /api/rooms`);
      console.log(`   GET    /api/rooms/search?type=&checkIn=&checkOut=`);
      console.log(`   POST   /api/rooms`);
      console.log(`   PUT    /api/rooms/:id`);
      console.log(`   DELETE /api/rooms/:id`);
      console.log(`   GET    /api/bookings`);
      console.log(`   GET    /api/bookings/my/:email`);
      console.log(`   POST   /api/bookings`);
      console.log(`   PUT    /api/bookings/:id/cancel`);
      console.log(`   PUT    /api/bookings/:id/checkin`);
      console.log(`   PUT    /api/bookings/:id/checkout`);
      console.log(`   DELETE /api/bookings/:id`);
      console.log(`   POST   /api/payments/process`);
      console.log(`   POST   /api/payments/refund`);
      console.log(`   GET    /api/bookings/stats`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Make sure MongoDB is running locally on port 27017');
    process.exit(1);
  });

module.exports = app;
