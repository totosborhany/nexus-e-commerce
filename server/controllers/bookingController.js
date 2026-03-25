
const AppError = require('../utills/appError');
const Booking = require('../models/bookingModel');
const Game = require('../models/gameModel');
let stripe;
const factory = require('./handlerFactory');
const catchAsync = require('../utills/catchAsync');
const Cart = require("../models/cartModel");

// const AppError = require('../utills/appError');
// const Booking = require('../models/bookingModel');
// const Cart = require('../models/cartModel');
// const catchAsync = require('../utills/catchAsync');
// const factory = require('./handlerFactory');

// let stripe;

// --------------------
// 1️⃣ Create Checkout Session
// --------------------
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  if (!stripe) stripe = require('stripe')(process.env.STRIPE);

  // 1️⃣ Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('games');
  if (!cart || cart.games.length === 0) {
    return next(new AppError('Cart is empty', 400));
  }

  // 2️⃣ Remove already-owned games
  const owned = await Booking.find({
    user: req.user._id,
    games: { $in: cart.games.map(g => g._id) },
  });
  const ownedIds = new Set(owned.flatMap(b => b.games.map(id => id.toString())));
  cart.games = cart.games.filter(g => !ownedIds.has(g._id.toString()));
  if (cart.games.length === 0) {
    return next(new AppError('All items in your cart are already purchased', 400));
  }

  await Cart.findByIdAndUpdate(cart._id, { games: cart.games });

  // 3️⃣ Map games to Stripe line items
  const line_items = cart.games.map(game => ({
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(game.price * 100),
      product_data: {
        name: game.name,
        description: game.description || '',
        images: game.photo
          ? [`${req.protocol}://${req.get('host')}/uploads/games/cover/${game.photo}`]
          : [],
      },
    },
    quantity: 1,
  }));

  const frontendBase = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

  // 4️⃣ Create Stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${frontendBase}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendBase}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.user._id.toString(),
    metadata: {
      userId: req.user._id.toString(),
      cartId: cart._id.toString(),
    },
    line_items,
  });

  res.status(200).json({ status: 'success', session });
});

// --------------------
// 2️⃣ Webhook Handler
// --------------------
exports.webhookCheckout = async (req, res) => {
  if (!stripe) stripe = require('stripe')(process.env.STRIPE);

  const signature = req.headers['stripe-signature'];
  let event;

  // Convert Buffer to string for signature verification
  let rawBody = req.body;
  if (Buffer.isBuffer(rawBody)) {
    rawBody = rawBody.toString('utf8');
    console.log('📨 Converted Buffer to string, length:', rawBody.length);
  }
  console.log('🔍 Signature header:', signature ? signature.substring(0, 10) + '...' : 'MISSING');
  console.log('🔑 Webhook secret set:', !!process.env.STRIPE_WEBHOOK_SECRET);

  const signatureRequired = !!process.env.STRIPE_WEBHOOK_SECRET && process.env.NODE_ENV === 'production';

  try {
    if (!signature && signatureRequired) {
      throw new Error('No stripe-signature header provided');
    }

    if (signature && signatureRequired) {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('✅ Webhook signature verified:', event.type);
    } else {
      // Local/test mode (no signature required) - parse directly
      if (typeof rawBody === 'string') {
        event = JSON.parse(rawBody);
      } else {
        event = req.body;
      }
      console.log('⚠️ Webhook signature skipped (dev mode) ; event from body:', event.type);
    }
  } catch (err) {
    console.error('❌ Webhook signature/parsing error:', err.message);
    if (signatureRequired) {
      console.error('   Error code:', err.code);
      console.error('   Please verify:');
      console.error('   - Signature header is correct');
      console.error('   - Webhook secret is correct');
      console.error('   - Raw body is not modified');
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🔍 Checking event type:', event.type);
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('🎉 Processing checkout.session.completed');
    console.log('   Session ID:', session.id);
    console.log('   User ID (from metadata):', session.metadata?.userId);
    console.log('   Cart ID (from metadata):', session.metadata?.cartId);
    console.log('   Payment Status:', session.payment_status);
    console.log('   Amount Total:', session.amount_total);

    // Validate metadata
    if (!session.metadata?.userId || !session.metadata?.cartId) {
      console.error('❌ Missing required metadata in session');
      return res.status(400).send('Invalid webhook: Missing userId or cartId in metadata');
    }

    // Ensure payment is actually completed
    if (session.payment_status !== 'paid') {
      console.warn('⚠️ Received checkout.session.completed with payment_status:', session.payment_status);
      // Keep 200 so Stripe does not retry, but do NOT persist bookings until confirmed
      return res.status(200).json({ received: true, processed: false, message: 'Payment not completed yet' });
    }

    try {
      // Convert string IDs to MongoDB ObjectIds
      const mongoose = require('mongoose');
      const userId = new mongoose.Types.ObjectId(session.metadata.userId);
      const cartId = new mongoose.Types.ObjectId(session.metadata.cartId);

      console.log('   After conversion - User ID:', userId, 'Cart ID:', cartId);

      // Get cart
      const cart = await Cart.findById(cartId).populate('games');
      if (!cart) {
        console.error('❌ Cart not found with ID:', cartId);
        return res.status(400).send('Cart not found');
      }
      console.log('📦 Cart found with', cart.games.length, 'games');
      console.log('   Games:', cart.games.map(g => ({ id: g._id, name: g.name, price: g.price })));

      // Verify cart has games
      if (!cart.games || cart.games.length === 0) {
        console.error('❌ Cart has no games');
        return res.status(400).send('Cart is empty');
      }

      // Filter out games user already owns
      const existing = await Booking.find({
        user: userId,
        games: { $in: cart.games.map(g => g._id) },
      });
      console.log('🔍 Found', existing.length, 'existing bookings for this user');

      const existingIds = new Set(existing.flatMap(b => b.games.map(id => id.toString())));

      // Create new bookings - SET paid: true only after webhook confirms
      const newBookings = cart.games
        .filter(g => !existingIds.has(g._id.toString()))
        .map(game => ({
          games: [game._id],
          user: userId,
          price: game.price,
          paid: true, // ✅ Set to true ONLY after Stripe confirms payment
        }));

      console.log('📝 Creating', newBookings.length, 'new bookings');

      // Run DB writes in a transaction to guarantee atomicity
      const sessionDb = await Booking.startSession();
      try {
        sessionDb.startTransaction();

        // Insert bookings in transaction
        let createdInTx = [];
        if (newBookings.length > 0) {
          createdInTx = await Booking.insertMany(newBookings, { session: sessionDb });
          console.log('✅ Successfully created in transaction', createdInTx.length, 'bookings');
        }

        // Delete cart in same transaction
        await Cart.findByIdAndDelete(cartId, { session: sessionDb });

        await sessionDb.commitTransaction();
        sessionDb.endSession();

        // Verify bookings inserted
        if (createdInTx.length > 0) {
          const verification = await Booking.find({ user: userId, _id: { $in: createdInTx.map(b => b._id) } });
          if (verification.length !== createdInTx.length) {
            throw new Error('Booking verification failed - persisted count mismatch');
          }
          console.log('✅ Verification: Created', verification.length, 'bookings confirmed in database');
        }

        res.status(200).json({ received: true, processed: true, bookings: createdInTx.length });
      } catch (err) {
        await sessionDb.abortTransaction();
        sessionDb.endSession();
        console.error('❌ Transaction failure:', err);
        throw err; // bubble to outer catch
      }

    } catch (err) {
      console.error('❌ Error processing webhook:', err);
      console.error('   Error type:', err.constructor.name);
      console.error('   Error details:', err.message);
      console.error('   Stack:', err.stack);
      // Return 500 so Stripe will RETRY this webhook
      return res.status(500).json({ received: true, processed: false, error: err.message });
    }
  } else {
    console.log('ℹ️  Ignoring webhook event type:', event.type);
    res.status(200).json({ received: true, processed: false });
  }
};



// exports.getCheckoutSession = catchAsync(async (req, res) => {
//   // Initialize stripe on first use
//   if (!stripe) stripe = require('stripe')(process.env.STRIPE);
  
//   // 1️⃣ Get user's cart and populate game details
//   const cart = await Cart.findOne({ user: req.user.id }).populate('games');

//   if (!cart || cart.games.length === 0) {
//     return res.status(400).json({ status: 'fail', message: 'Cart is empty' });
//   }

//   // Optional check: filter out games user already owns
//   const alreadyBooked = await Booking.find({
//     user: req.user.id,
//     game: { $in: cart.games.map(g => g._id) },
//   });
//   if (alreadyBooked && alreadyBooked.length > 0) {
//     // remove duplicates from cart list
//     const ownedIds = alreadyBooked.flatMap(b => b.game.map(id => id.toString()));
//     cart.games = cart.games.filter(g => !ownedIds.includes(g._id.toString()));
//     // persist the cleaned cart so user doesn't see already-owned items later
//     await Cart.findByIdAndUpdate(cart._id, { games: cart.games });
//     if (cart.games.length === 0) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'All items in your cart are already owned',
//       });
//     }
//   }

//   // 2️⃣ Map each game to a Stripe line_item
//   const line_items = cart.games.map(gameData => ({
//     price_data: {
//       currency: 'usd',
//       unit_amount: gameData.price * 100, // amount in cents
//       product_data: {
//         name: `${gameData.name} game`,
//         description: gameData.description,
//         images: [
//           gameData.photo ? `${req.protocol}://${req.get('host')}/uploads/games/cover/${gameData.photo}` : null,
//         ],
//       },
//     },
//     quantity: 1,
//   }));

//   // use environment variable so dev/front end port can differ
//   const frontendBase = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

//   // 3️⃣ Create Stripe Checkout session
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     mode: 'payment',
//     success_url: `${frontendBase}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${frontendBase}/cart`,
//     customer_email: req.user.email,
//     client_reference_id: req.user.id,
//     metadata: {
//       userId: req.user.id,
//       cartId: cart._id.toString(),
//     },
//     line_items,
//   });

//   // 4️⃣ Send session info to frontend
//   res.status(200).json({
//     status: 'success',
//     session,
//   });
// });

// exports.webhookCheckout = async (req, res) => {
//   // Initialize stripe on first use
//   if (!stripe) stripe = require('stripe')(process.env.STRIPE);
  
//   const signature = req.headers['stripe-signature'];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.log('Webhook error:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // 🔥 Handle event type
//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object;

//     // Get the cart that was purchased
//     const cart = await Cart.findById(session.metadata.cartId).populate('games');

//     if (!cart) {
//       console.log('Cart not found for session:', session.id);
//       return res.status(400).send('Cart not found');
//     }

//     // filter out games user already owns to avoid duplicates
//     const existing = await Booking.find({
//       user: session.metadata.userId,
//       game: { $in: cart.games.map(g => g._id) },
//     });
//     const existingIds = new Set(
//       existing.flatMap(b => b.game.map(id => id.toString()))
//     );

//     const newBookings = cart.games
//       .filter(g => !existingIds.has(g._id.toString()))
//       .map(gameData => ({
//         game: [gameData._id],
//         user: session.metadata.userId,
//         price: gameData.price,
//         paid: true,
//       }));

//     if (newBookings.length > 0) {
//       await Booking.insertMany(newBookings);
//       console.log(`Created ${newBookings.length} bookings for user ${session.metadata.userId}`);
//     } else {
//       console.log(`No new bookings needed for user ${session.metadata.userId}`);
//     }

//     // Clear the cart after successful payment
//     await Cart.findByIdAndDelete(session.metadata.cartId);
//   }

//   res.status(200).json({ received: true });
// };

// // ensure user is set and duplicates are prevented when creating bookings manually
exports.createBooking = catchAsync(async (req, res, next) => {
  if (!req.body.user && req.user) {
    req.body.user = req.user._id;
  }

  // Convert 'game' to 'games' if provided in old format
  if (req.body.game && !req.body.games) {
    req.body.games = Array.isArray(req.body.game) ? req.body.game : [req.body.game];
    delete req.body.game; // Remove old field
  }

  // Guard against duplicate purchases
  if (req.body.games) {
    const gameIds = Array.isArray(req.body.games) ? req.body.games : [req.body.games];
    const existing = await Booking.find({
      user: req.body.user,
      games: { $in: gameIds },
    });
    if (existing && existing.length > 0) {
      return next(new AppError('One or more of the specified games are already purchased', 400));
    }
  }

  // Delegate to generic factory
  return factory.createOne(Booking)(req, res, next);
});

exports.getBooking = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("games", "name")
    .populate("user", "name email");

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: bookings || [],  // Always return an array
  });
});

// Fix: getAllBookings should filter by current user, not return all bookings
exports.getAllBookings = catchAsync(async (req, res, next) => {
  // Only return bookings for the current user
  const bookings = await Booking.find({ user: req.user._id })
    .populate("games", "name")
    .populate("user", "name email");

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: bookings || [],  // Always return an array
  });
});

exports.deleteBooking = factory.deletOne(Booking);
exports.updateBooking = factory.updateItem(Booking);
