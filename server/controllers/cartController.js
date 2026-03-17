const catchAsync = require("../utills/catchAsync");
const handler = require("./handlerFactory");
const Cart = require("../models/cartModel");
const AppError = require("../utills/appError");
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("games");
  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});
exports.addToCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id });
  }

  if(cart.games.includes(req.params.gameId)){
    return next(new AppError("Game already in cart",400));
  }
  if (!cart.games.includes(req.params.gameId)) {
    cart.games.push(req.params.gameId);
    await cart.save();
  }
  console.log(cart);
  res.status(201).json({
    status: "success",
    message: "added to cart successfully",
  });
});
exports.removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError("No cart found for this user", 404));
  }

  const gameId = req.params.gameId;

  cart.games = cart.games.filter((id) => id.toString() !== gameId);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Game removed from cart successfully",
    data: {
      cart,
    },
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError("No cart found for this user", 404));
  }

  cart.games = [];
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Cart cleared successfully",
    data: {
      cart,
    },
  });
});
