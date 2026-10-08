const Booking = require('../models/Booking');
const Room = require('../models/Room');

// GET /api/bookings — list all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, q } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (q) {
      filter.$or = [
        { bookingId: { $regex: q, $options: 'i' } },
        { guestName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('room')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/my/:email — get bookings for a specific guest email
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ email: req.params.email })
      .populate('room')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/bookings — create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { room: roomId, checkIn, checkOut, guestName, email, phone, guests, specialRequests } = req.body;

    // 1. Verify room exists
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // 2. Check guest count
    if (guests > room.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNo} allows max ${room.maxGuests} guests. You requested ${guests}.`
      });
    }

    // 3. Check for overlapping bookings (DOUBLE-BOOKING PREVENTION)
    const ciDate = new Date(checkIn);
    const coDate = new Date(checkOut);

    const overlap = await Booking.findOne({
      room: roomId,
      status: { $nin: ['cancelled'] },
      checkIn: { $lt: coDate },
      checkOut: { $gt: ciDate }
    });

    if (overlap) {
      return res.status(409).json({
        success: false,
        message: `Room ${room.roomNo} is already booked from ${overlap.checkIn.toLocaleDateString()} to ${overlap.checkOut.toLocaleDateString()}. Please choose different dates.`
      });
    }

    // 4. Calculate total
    const nights = Math.ceil((coDate - ciDate) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in.' });
    }
    const subtotal = room.price * nights;
    const tax = Math.round(subtotal * 0.12);
    const totalAmount = subtotal + tax;

    // 5. Create booking
    const booking = await Booking.create({
      room: roomId,
      guestName,
      email,
      phone,
      checkIn: ciDate,
      checkOut: coDate,
      guests: guests || 1,
      totalAmount,
      specialRequests: specialRequests || '',
      status: 'confirmed',
      paymentStatus: 'pending'
    });

    const populated = await booking.populate('room');
    res.status(201).json({
      success: true,
      data: populated,
      breakdown: { nights, pricePerNight: room.price, subtotal, tax, totalAmount }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/bookings/:id/cancel — cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }
    if (booking.status === 'checked-in') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a checked-in guest. Process checkout instead.' });
    }

    booking.status = 'cancelled';
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }
    await booking.save();

    res.json({
      success: true,
      message: `Booking ${booking.bookingId} cancelled successfully.`,
      data: booking,
      refundAmount: booking.paymentStatus === 'refunded' ? booking.totalAmount : 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/bookings/:id/checkin
exports.checkInBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: `Cannot check in. Current status: ${booking.status}` });
    }
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment must be completed before check-in.' });
    }

    booking.status = 'checked-in';
    await booking.save();

    // Update room status
    await Room.findByIdAndUpdate(booking.room._id, { status: 'occupied' });

    res.json({ success: true, message: `Guest ${booking.guestName} checked in to Room ${booking.room.roomNo}.`, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/bookings/:id/checkout
exports.checkOutBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.status !== 'checked-in') {
      return res.status(400).json({ success: false, message: `Cannot check out. Current status: ${booking.status}` });
    }

    booking.status = 'completed';
    await booking.save();

    // Set room to housekeeping after checkout
    await Room.findByIdAndUpdate(booking.room._id, { status: 'housekeeping' });

    res.json({ success: true, message: `Guest ${booking.guestName} checked out from Room ${booking.room.roomNo}.`, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/bookings/:id — permanently delete
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.status === 'checked-in') {
      return res.status(400).json({ success: false, message: 'Cannot delete an active check-in. Check out first.' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Booking ${booking.bookingId} permanently deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/stats — dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkInsToday = await Booking.countDocuments({
      status: 'confirmed',
      checkIn: { $gte: today, $lt: tomorrow }
    });

    const checkOutsToday = await Booking.countDocuments({
      status: 'checked-in',
      checkOut: { $gte: today, $lt: tomorrow }
    });

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthBookings = await Booking.find({
      createdAt: { $gte: monthStart },
      paymentStatus: 'paid'
    });
    const monthRevenue = monthBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $in: ['confirmed', 'checked-in'] } });

    res.json({
      success: true,
      data: {
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms: await Room.countDocuments({ status: { $in: ['maintenance', 'housekeeping'] } }),
        checkInsToday,
        checkOutsToday,
        monthRevenue,
        totalBookings,
        activeBookings,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
