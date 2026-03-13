const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const router = express.Router();

// stripe session creation is idempotent; accept GET or POST for ease of use
router.route('/checkout-session')
  .get(authController.protected, bookingController.getCheckoutSession)
  .post(authController.protected, bookingController.getCheckoutSession);

router.use(authController.protected);

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
