const Room = require('../models/Room');
const Booking = require('../models/Booking');

// GET /api/rooms — list all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNo: 1 });
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rooms/search?type=&checkIn=&checkOut=&minPrice=&maxPrice=&guests=
exports.searchRooms = async (req, res) => {
  try {
    const { type, checkIn, checkOut, minPrice, maxPrice, guests } = req.query;
    const filter = {};

    if (type && type !== 'all') filter.type = type;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (guests) filter.maxGuests = { $gte: Number(guests) };

    let rooms = await Room.find(filter).sort({ price: 1 });

    // If date range provided, filter out rooms that have overlapping bookings
    if (checkIn && checkOut) {
      const ciDate = new Date(checkIn);
      const coDate = new Date(checkOut);

      const overlappingBookings = await Booking.find({
        status: { $nin: ['cancelled'] },
        checkIn: { $lt: coDate },
        checkOut: { $gt: ciDate }
      }).select('room');

      const bookedRoomIds = new Set(overlappingBookings.map(b => b.room.toString()));

      rooms = rooms.map(room => {
        const r = room.toObject();
        r.isAvailable = !bookedRoomIds.has(room._id.toString());
        return r;
      });
    } else {
      rooms = rooms.map(room => {
        const r = room.toObject();
        r.isAvailable = room.status === 'available';
        return r;
      });
    }

    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rooms/:id
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rooms — add a new room
exports.addRoom = async (req, res) => {
  try {
    const existing = await Room.findOne({ roomNo: req.body.roomNo });
    if (existing) {
      return res.status(400).json({ success: false, message: `Room ${req.body.roomNo} already exists` });
    }
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/rooms/:id — update a room
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/rooms/:id — delete a room
exports.deleteRoom = async (req, res) => {
  try {
    // Check if room has active bookings
    const activeBookings = await Booking.find({
      room: req.params.id,
      status: { $in: ['confirmed', 'checked-in'] }
    });
    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active bookings. Cancel bookings first.'
      });
    }

    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, message: `Room ${room.roomNo} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
