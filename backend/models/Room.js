const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNo: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Deluxe', 'Executive', 'Presidential', 'Studio', 'Penthouse'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  maxGuests: {
    type: Number,
    required: true,
    default: 2,
    min: 1,
    max: 10
  },
  size: {
    type: String,
    default: ''
  },
  floor: {
    type: String,
    default: ''
  },
  amenities: {
    type: [String],
    default: []
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'housekeeping'],
    default: 'available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
