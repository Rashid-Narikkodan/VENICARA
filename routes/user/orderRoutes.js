const express = require("express");
const router = express.Router();

const {
  orderController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router
  .route("/")
  .get(auth.requireLogin, orderController.showOrders);
  router.patch('/cancel/:id',orderController.cancelOrder)
  router.patch('/return/:id',orderController.returnOrder)
  router.patch('/product/cancel/:id',orderController.cancelProduct)
  router.patch('/product/return/:id',orderController.returnProduct)
  
module.exports = router