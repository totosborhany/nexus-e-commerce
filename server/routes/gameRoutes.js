const app = require("express");
const router = app.Router();
const gameController = require("../controllers/gameController");
const userRouter = require("./userRoutes");
const reviewRouter = require("./reviewRoutes");
const authContoller = require("../controllers/authController");
router.use("/:gameId/reviews", reviewRouter);
router
  .route("/")
  .get(gameController.getGames)
  .post(
    authContoller.protected,
    authContoller.authorizedTo("admin", "publisher"),
    gameController.uploadGamePhotos,
    gameController.resizeGameImages,
    gameController.createGame,
  );
router
  .route("/:id")
  .delete(
    authContoller.protected,
    authContoller.authorizedTo("admin", "publisher"),
    gameController.deleteGames,
  )
  .get(gameController.getGame)
  .patch(
    authContoller.protected,
    authContoller.authorizedTo("admin", "publisher"),
    gameController.uploadGamePhotos,
    gameController.resizeGameImages,
    gameController.updateGame,
  );

module.exports = router;
