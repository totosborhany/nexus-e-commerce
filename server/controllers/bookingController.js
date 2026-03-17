const AppError = require('../utills/appError');
const Booking = require('../models/bookingModel');
let stripe;
const factory = require('./handlerFactory');
const catchAsync = require('../utills/catchAsync');
const Cart = require("../models/cartModel");

exports.getCheckoutSession = catchAsync(async (req, res) => {
  // Initialize stripe on first use
  if (!stripe) stripe = require('stripe')(process.env.STRIPE);
  
  // 1️⃣ Get user's cart and populate game details
  const cart = await Cart.findOne({ user: req.user.id }).populate('games');

  if (!cart || cart.games.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Cart is empty' });
  }

  // Optional check: filter out games user already owns
  const alreadyBooked = await Booking.find({
    user: req.user.id,
    game: { $in: cart.games.map(g => g._id) },
  });
  if (alreadyBooked && alreadyBooked.length > 0) {
    // remove duplicates from cart list
    const ownedIds = alreadyBooked.flatMap(b => b.game.map(id => id.toString()));
    cart.games = cart.games.filter(g => !ownedIds.includes(g._id.toString()));
    // persist the cleaned cart so user doesn't see already-owned items later
    await Cart.findByIdAndUpdate(cart._id, { games: cart.games });
    if (cart.games.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'All items in your cart are already owned',
      });
    }
  }

  // 2️⃣ Map each game to a Stripe line_item
  const line_items = cart.games.map(gameData => ({
    price_data: {
      currency: 'usd',
      unit_amount: gameData.price * 100, // amount in cents
      product_data: {
        name: `${gameData.name} game`,
        description: gameData.description,
        images: [
          gameData.photo ? `${req.protocol}://${req.get('host')}/uploads/games/cover/${gameData.photo}` : null,
        ],
      },
    },
    quantity: 1,
  }));

  // use environment variable so dev/front end port can differ
  const frontendBase = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

  // 3️⃣ Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${frontendBase}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendBase}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.user.id,
    metadata: {
      userId: req.user.id,
      cartId: cart._id.toString(),
    },
    line_items,
  });

  // 4️⃣ Send session info to frontend
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.webhookCheckout = async (req, res) => {
  // Initialize stripe on first use
  if (!stripe) stripe = require('stripe')(process.env.STRIPE);
  
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🔥 Handle event type
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Get the cart that was purchased
    const cart = await Cart.findById(session.metadata.cartId).populate('games');

    if (!cart) {
      console.log('Cart not found for session:', session.id);
      return res.status(400).send('Cart not found');
    }

    // filter out games user already owns to avoid duplicates
    const existing = await Booking.find({
      user: session.metadata.userId,
      game: { $in: cart.games.map(g => g._id) },
    });
    const existingIds = new Set(
      existing.flatMap(b => b.game.map(id => id.toString()))
    );

    const newBookings = cart.games
      .filter(g => !existingIds.has(g._id.toString()))
      .map(gameData => ({
        game: [gameData._id],
        user: session.metadata.userId,
        price: gameData.price,
        paid: true,
      }));

    if (newBookings.length > 0) {
      await Booking.insertMany(newBookings);
      console.log(`Created ${newBookings.length} bookings for user ${session.metadata.userId}`);
    } else {
      console.log(`No new bookings needed for user ${session.metadata.userId}`);
    }

    // Clear the cart after successful payment
    await Cart.findByIdAndDelete(session.metadata.cartId);
  }

  res.status(200).json({ received: true });
};

// ensure user is set and duplicates are prevented when creating bookings manually
exports.createBooking = catchAsync(async (req, res, next) => {
  if (!req.body.user && req.user) {
    req.body.user = req.user.id;
  }

  // guard against duplicate purchases
  if (req.body.game) {
    const gameIds = Array.isArray(req.body.game) ? req.body.game : [req.body.game];
    const existing = await Booking.find({
      user: req.body.user,
      game: { $in: gameIds },
    });
    if (existing && existing.length > 0) {
      return next(new AppError('One or more of the specified games are already purchased', 400));
    }
  }

  // delegate to generic factory
  return factory.createOne(Booking)(req, res, next);
});

exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.deleteBooking = factory.deletOne(Booking);
exports.updateBooking = factory.updateItem(Booking);
