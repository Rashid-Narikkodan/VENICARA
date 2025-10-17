const express = require("express");
const router = express.Router();

const {
  productController,
  homeController,
} = require("../../controllers/user/index");
const auth = require("../../middlewares/authUser");

router.get(
  "/home",
  auth.isUserBlocked,
  homeController.showHome
);
router.get("/shop", homeController.showShop);
router.get("/search", productController.searchProducts);
router.get("/products/:id", productController.showProductDetails);
router.get("/", auth.loggedIn, homeController.landingPage);
router.get("/api/cart/count", auth.requireLogin, homeController.cartCount);

module.exports = router