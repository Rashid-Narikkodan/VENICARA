const express = require("express");
const router = express.Router();

const {
  orderController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router
  .route("/")
  .get(auth.requireLogin, orderController.showOrders);


module.exports = router