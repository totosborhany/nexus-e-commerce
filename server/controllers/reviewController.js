const catchAsync = require('../utills/catchAsync');
const appError = require('../utills/appError');
const Review = require("../models/reviewModel");
const handler = require("./handlerFactory");

// exports.getReviews = handler.getAll(Review);

exports.getReviews = async (req, res, next) => {
  let filter = {};
  if (req.params.gameId) filter = { game: req.params.gameId };

  const reviews = await Review.find(filter)
    .populate("user", "name photo")
    .populate("game", "name ratingsAverage");

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: reviews,
  });
};
exports.getReview= handler.getOne(Review);
exports.createReview = handler.createOne(Review);

exports.deletReview = catchAsync(async (req, res, next) => {
  console.log(req.params ,req.originalUrl);
    const review = await Review.findByIdAndDelete(req.params.id); 
  console.log(review);

  if (!review) {
    return next(new appError("Review not found", 404));
  }

  res.status(204).send(); // 204 usually has no JSON body
});
exports.getGameAndUser = catchAsync(async(req,res,next)=>{
    req.body.game = req.params.gameId;
    req.body.user = req.user.id;
    next();
});