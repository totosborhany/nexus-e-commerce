const catchAsync = require("../utills/catchAsync");
const AppError = require("../utills/appError");
const ApiFeatures = require("../utills/apiFeatures");

exports.getAll = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // build query
    const features = new ApiFeatures(model.find(), req.query)
      .fields()
      .limit()
      .page()
      .sort();
    if (popOptions) features.query = features.query.populate(popOptions);

    // execute query
    const results = await features.query;

    if (!results || results.length === 0) {
      return next(new AppError("Could not find any documents", 400));
    }

    res.status(200).json({
      status: "success",
      results: results.length,
      data: results,
    });
  });

exports.getOne = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const result = await query;

    if (!result) {
      return next(new AppError("Document not found", 400));
    }

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    console.log("heres jhonny", model);
    if (model.modelName === "Review") {
      const reqUser = req.body.user;
      const reqGame = req.body.game;
      const exist = await model.find({ user: reqUser, game: reqGame });
      console.log(exist);
      if (exist.length > 0) {
        return next(
          new AppError("sorry you can only have one review for a game", 400),
        );
      }
    }
    const result = await model.create(req.body);
    res.status(201).json({
      status: "success",
      message: ` ${model.modelName.toLowerCase()} successfully created`,
      data: {
        result,
      },
    });
  });

exports.deletOne = (model) =>
  catchAsync(async (req, res, next) => {
    const result = await model.findByIdAndDelete(req.params.id, {
      translateAliases: true,
    });

    res.status(204).json({
      status: "success",
      message: `${model.modelName} is successfully deleted`,
    });
  });
exports.updateItem = (model) =>
  catchAsync(async (req, res, next) => {
    const result = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({
      status: "success",
      message: `${model.modelName} has been successfully updated`,
      data: {
        result,
      },
    });
  });
