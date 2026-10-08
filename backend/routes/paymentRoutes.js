const express = require('express');
const router = express.Router();
const { processPayment, refundPayment } = require('../controllers/paymentController');

router.post('/process', processPayment);
router.post('/refund', refundPayment);

module.exports = router;
