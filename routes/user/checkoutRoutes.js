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



module.exports = router