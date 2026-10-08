const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  checkInBooking,
  checkOutBooking,
  deleteBooking,
  getStats
} = require('../controllers/bookingController');

router.get('/stats', getStats);
router.get('/my/:email', getMyBookings);
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/checkin', checkInBooking);
router.put('/:id/checkout', checkOutBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
