// Dummy Payment Gateway Controller
// Simulates payment processing with realistic delays and responses

exports.processPayment = async (req, res) => {
  try {
    const { bookingId, amount, method, cardNumber, upiId, nameOnCard } = req.body;

    if (!bookingId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId, amount, method'
      });
    }

    // Simulate processing delay (500ms - 2s)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

    // Simulate failure for specific test card numbers
    if (cardNumber === '4000000000000002' || upiId === 'fail@upi') {
      return res.status(402).json({
        success: false,
        message: 'Payment declined by issuer. Please try a different payment method.',
        transactionId: null
      });
    }

    // Generate dummy transaction ID
    const txnId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Mask card/upi for display
    let maskedMethod = '';
    if (method === 'card') {
      maskedMethod = `Card ending ${cardNumber ? cardNumber.slice(-4) : '****'}`;
    } else if (method === 'upi') {
      maskedMethod = `UPI ${upiId || '****@upi'}`;
    } else if (method === 'netbanking') {
      maskedMethod = 'Net Banking';
    }

    // Update booking payment status in DB
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = maskedMethod;
    booking.transactionId = txnId;
    await booking.save();

    res.json({
      success: true,
      message: 'Payment processed successfully!',
      data: {
        transactionId: txnId,
        amount,
        method: maskedMethod,
        status: 'paid',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const Booking = require('../models/Booking');
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ success: false, message: 'No paid transaction to refund.' });
    }

    // Simulate refund delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const refundTxnId = `RFD${Date.now()}${Math.floor(Math.random() * 10000)}`;

    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({
      success: true,
      message: `Refund of ₹${booking.totalAmount.toLocaleString('en-IN')} initiated.`,
      data: {
        refundTransactionId: refundTxnId,
        originalTransactionId: booking.transactionId,
        refundAmount: booking.totalAmount,
        estimatedDays: '2-4 business days'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
