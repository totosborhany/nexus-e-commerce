const mongoose = require("mongoose");
const Game = require("./gameModel");
const reviewSchema = mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      minLength: [10, "review must be longer"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    game: {
      type: mongoose.Schema.ObjectId,
      ref: "Game",
      required: true,
    },
  },
  {
    toJSON: { virtals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/g, function () {
  this.populate({
    path: "user",
  }).populate({
    path: "game",
  });
});

reviewSchema.index({ game: 1, user: 1 });

reviewSchema.statics.calcAvg = async function (gameId) {
  
const stats = await this.aggregate([
  {
    $match: {
      game: gameId,
    },
  },
  {
    $group: {
      _id: "$game",
      avgRating: { $avg: "$rating" }, 
      numRating: { $sum: 1 },         
    },
  },
]);

  if (stats.length > 0) {
   await  Game.findByIdAndUpdate(gameId, {
      ratingsAverage: stats[0].avgRating,
      greviewCount: stats[0].numRating,
    });
  } else {
    await Game.findByIdAndUpdate(gameId, {
      ratingsAverage: 4.5,
      reviewCount: 0,
    });
  }
};
reviewSchema.post("save",async  function () {
 await this.constructor.calcAvg(this.game);
});
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
// });
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne(this.getQuery()); 
});
reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.calcAvg(this.r.game);
});
const reviewModel = mongoose.model("Review", reviewSchema);
module.exports = reviewModel;
