const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
  user: {   type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  games: [
    {type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  ],
});
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;