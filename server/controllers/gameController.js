const handler = require("../controllers/handlerFactory");
const ApiFeatures = require("../utills/apiFeatures");
const Game = require("../models/gameModel");
const sharp = require("sharp");
const appError = require("../utills/appError");
const multer = require("multer");
const catchAsync = require("../utills/catchAsync");
const path = require("path");
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new appError("Not an image! Please upload only images.", 400), false);
  }
};
exports.resizeGameImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.photo && (!req.files.images || req.files.images.length === 0)) {
    return next();
  }
  if (req.files.photo) {
    req.body.photo = `game-${req.params.id}-${Date.now()}-cover.jpeg`;
    console.log(req.body);
    await sharp(req.files.photo[0].buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(path.join(__dirname, '../uploads/games/cover', req.body.photo));
  console.log("Cover image saved to:", path.join(__dirname, '../uploads/games/cover', req.body.photo));
    }
  if (req.files.images && req.files.images.length > 0) {
    req.body.desPhotos = [];
    await Promise.all(
      req.files.images.map(async (el, i) => {
        const filename = `game-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(el.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .resize(2000, 2000)
          .toFile(path.join(__dirname, '../uploads/games/description', filename));
        req.body.desPhotos.push(filename);
      }),
    );
  }
  next();
});
const upload = multer({
  fileFilter: multerFilter,
  storage: multerStorage,
});

exports.uploadGamePhotos = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
// custom getGames to support search and genre filtering via query params
exports.getGames = catchAsync(async (req, res, next) => {
  // build base filter object
  const filter = {};

  // support search query: match name, description, or genre (case-insensitive)
  if (req.query.search) {
    const search = req.query.search;
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { genre: { $elemMatch: { $regex: search, $options: "i" } } },
    ];
    // delete search so ApiFeatures doesn't try to use it as a field
    delete req.query.search;
  }

  // support genre filter directly (genre is an array, use $in operator)
  if (req.query.genre) {
    const genres = Array.isArray(req.query.genre) ? req.query.genre : [req.query.genre];
    filter.genre = { $in: genres };
    delete req.query.genre;
  }

  // support filtering by a single category value (category is stored as an array)
  if (req.query.category) {
    filter.category = { $in: [req.query.category] };
    delete req.query.category;
  }

  const features = new ApiFeatures(Game.find(filter), req.query)
    .fields()
    .limit()
    .page()
    .sort();

  const results = await features.query;

  if (!results || results.length === 0) {
    return next(new appError("Could not find any documents", 400));
  }

  res.status(200).json({
    status: "success",
    results: results.length,
    data: results,
  });
});

exports.createGame = handler.createOne(Game);
exports.deleteGames = handler.deletOne(Game);

// populate publisher so frontend can display name/email
exports.getGame = catchAsync(async (req, res, next) => {
  let query = Game.findById(req.params.id).populate("publisher", "name email");
  const result = await query;

  if (!result) {
    return next(new appError("Document not found", 400));
  }

  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.updateGame = handler.updateItem(Game);
