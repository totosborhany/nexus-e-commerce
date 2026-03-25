const catchAsync = require("../utills/catchAsync");
const AppError = require("../utills/appError");
const Cart = require("../models/cartModel");

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("games");

  if (!cart) {
    return res.status(200).json({
      status: "success",
      data: [],  // Return empty array instead of error
    });
  }

  return res.status(200).json({
    status: "success",
    data: cart.games || [],
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id });

  const gameId = req.params.gameId;

  if (cart.games.includes(gameId)) {
    return next(new AppError("Game already in cart", 400));
  }

  cart.games.push(gameId);
  await cart.save();

  return res.status(201).json({
    status: "success",
    message: "Added to cart successfully",
    data: cart.games,
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError("No cart found for this user", 404));

  const gameId = req.params.gameId;
  cart.games = cart.games.filter((id) => id.toString() !== gameId);
  await cart.save();

  return res.status(200).json({
    status: "success",
    message: "Game removed from cart successfully",
    data: cart.games,
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError("No cart found for this user", 404));

  cart.games = [];
  await cart.save();

  return res.status(200).json({
    status: "success",
    message: "Cart cleared successfully",
    data: [],
  });
});