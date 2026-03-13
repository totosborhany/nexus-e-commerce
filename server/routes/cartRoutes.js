const app =require('express');
const router =app.Router();
const cartController = require("../controllers/cartController");
const authController = require("../controllers/authController");

router.get("/",authController.protected,cartController.getCart);
router.route("/:gameId").post(authController.protected,cartController.addToCart).delete(authController.protected,cartController.removeFromCart);
module.exports = router;
