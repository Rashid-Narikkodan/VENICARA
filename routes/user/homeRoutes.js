const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  authController,
  userController,
  productController,
  homeController,
  addressController,
  cartController,
  referController,
  walletController,
  checkoutController,
} = require("../controllers/user/index");

const auth = require("../middlewares/authUser");
const upload = require("../middlewares/multer");

router.get("/", auth.loggedIn, homeController.landingPage);
router.get(
  "/home",
  auth.requireLogin,
  auth.isUserBlocked,
  homeController.showHome
);
router.get("/shop", homeController.showShop);
router.get("/search", productController.searchProducts);
router.get("/products/:id", productController.showProductDetails);

module.exports = router