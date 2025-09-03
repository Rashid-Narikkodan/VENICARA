const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  cartController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");
const upload = require("../../middlewares/multer");


router
  .route("/")
  .get(cartController.showCart);

router
  .route("/addToCart/:id")
  .post(cartController.addToCart);

router
  .route("/remove/:id")
  .delete(cartController.removeFromCart);

router.post("/applyCoupon", cartController.applyCoupon);

router
  .route("/increase/:cartId")
  .patch(cartController.increaseQuantity);

router
  .route("/decrease/:cartId")
  .patch(cartController.decreaseQuantity);


module.exports = router