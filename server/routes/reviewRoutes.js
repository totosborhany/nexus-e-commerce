const app = require("express");
const authContoller = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const router = app.Router({ mergeParams: true });
router
  .route("/")
  .get(reviewController.getReviews)
  .post(
    authContoller.protected,
    reviewController.getGameAndUser,
    reviewController.createReview,
  );
router
  .route("/:id")
  .get(authContoller.protected, reviewController.getReview)
  .delete(
    authContoller.protected,
    authContoller.authorizedTo("admin", "user"),
    reviewController.deletReview,
  );
module.exports = router;
