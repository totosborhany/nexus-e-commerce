
const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

// 1️⃣ Stripe checkout session creation (requires auth)
router.route('/checkout-session')
  .get(authController.protected, bookingController.getCheckoutSession)
  .post(authController.protected, bookingController.getCheckoutSession);

// 2️⃣ Webhook is handled in app.js BEFORE JSON parsing (no auth needed)
// This allows Stripe to send raw JSON for signature validation

// 3️⃣ Protect all routes below
router.use(authController.protected);

// 4️⃣ CRUD routes for bookings (only show user's own bookings)
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;