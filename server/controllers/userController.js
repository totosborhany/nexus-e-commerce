const handler = require("./handlerFactory");
const User = require("../models/userModel");
const catchAsync = require("../utills/catchAsync");
const AppError = require("../utills/appError");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const Review = require("../models/reviewModel");const Booking = require('../models/bookingModel');
const multerStorage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("sorry we accept only photos", 404), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
});

exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  // FIXED: Use absolute path instead of relative path
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(__dirname, '../uploads/users', req.file.filename));
  req.body.photo = req.file.filename;
  return next();
});
exports.uploadUserPhoto = upload.single("photo");

exports.getUsers = handler.getAll(User);
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: "success",
    message: "your account is deleted",
  });
});

exports.getLikes = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("likes")
    .select("likes");

  res.status(200).json({
    status: "success",
    data: {
      likedGames: user.likes,
    },
  });
});
exports.likeGame = catchAsync(async (req, res, next) => {
  // if (req.params.gameId) {
  //   req.body.game = req.params.gameId;

  // }
  // console.log(req.body.game,req.params.gameId);

  const gameId = req.params.gameId;

  if (!gameId) {
    return next(new AppError("No game ID provided", 400));
  }

  // Make sure req.user exists
  if (!req.user) {
    return next(new AppError("User not found", 401));
  }
  req.user.likes.push(req.params.gameId);
  await req.user.save();
  res.status(201).json({
    status: "success",
    message: "Game liked successfully",
  });
});
exports.removeLike = catchAsync(async (req, res, next) => {
  const index = req.user.likes.indexOf(req.params.gameId);
  console.log(index, req.params.gameId, req.user.likes);
  if (index === -1) {
    return next(new AppError("doesnt exist", 404));
  }
  req.user.likes.splice(index, 1);
  await req.user.save();
  res.status(204).json({
    status: "success",
    message: "Game like removed successfully",
  });
});
exports.getUserReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id });
  if (!reviews) {
    return next(new AppError("sorry you dont have any reiews yet", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      reviews,
    },
  });
});

exports.getUserBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate({
      path: 'game',
      select: 'name photo'
    })
    .sort('-CreatedAt');

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: bookings,
  });
});

exports.deleteUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});
