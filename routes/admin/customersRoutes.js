const express = require("express");
const router = express.Router();
const {
  authController,
  dashboardController,
  ordersController,
  productsController,
  salesReportController,
  customersController,
  couponsController,
  categoriesController,
  referralsController,
} = require("../controllers/admin/index");

const auth = require("../middlewares/authAdmin");
const upload = require("../middlewares/multer");

module.exports = router;