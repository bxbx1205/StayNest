const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room reference is required']
  },
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guests: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: ''
  },
  transactionId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['confirmed', 'checked-in', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  specialRequests: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Validate check-out is after check-in and generate booking ID
bookingSchema.pre('validate', function() {
  if (this.checkIn && this.checkOut) {
    if (this.checkOut <= this.checkIn) {
      this.invalidate('checkOut', 'Check-out date must be after check-in date');
    }
  }
  if (!this.bookingId) {
    const num = Math.floor(100000 + Math.random() * 900000);
    this.bookingId = `STN-${num}`;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
