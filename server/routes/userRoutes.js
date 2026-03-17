const app = require("express");
const router = app.Router({ mergeParams: true });
const authoController = require("../controllers/authController");
const userController = require("../controllers/userController");
router.post(
  "/likes/:gameId",
  authoController.protected,
  userController.likeGame,
);
router.delete(
  "/likes/:gameId",
  authoController.protected,
  userController.removeLike,
);
router.route("/likes").get(authoController.protected, userController.getLikes);

router.route("/login").post(authoController.login);
router.get("/logout", authoController.logout);
router.post("/signup", authoController.signup);
router.post("/forgot-password", authoController.forgetPassword);
router.patch("/reset-password", authoController.resetPassword);
router.use(authoController.protected);
router.patch(
  "/update-me",
  authoController.protected,
  userController.uploadUserPhoto,
  userController.resizePhoto,
  authoController.updateMe,
);
router.delete("/delete-me", authoController.protected, userController.deleteMe);
router.patch(
  "/update-password",
  authoController.protected,
  authoController.updatePassword,
);
router.route("/me").get(authoController.protected, userController.getMe);
router.route("/reviews").get(authoController.protected,userController.getUserReviews);
router.route("/bookings").get(authoController.protected,userController.getUserBookings);
router.route("/")
  .get(
    authoController.protected,
    authoController.authorizedTo("admin"),
    userController.getUsers,
  );
  // .delete(
  //   authoController.protected,
  //   authoController.authorizedTo("admin"),
  //   userController.deleteUser,
  // );

router
  .route("/:id")
  .delete(
    authoController.protected,
    authoController.authorizedTo("admin"),
    userController.deleteUserById,
  );

module.exports = router;
