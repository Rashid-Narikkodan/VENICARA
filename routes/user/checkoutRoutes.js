const express = require("express");
const router = express.Router();

const {
  checkoutController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router
  .route("/address")
  .get(auth.requireLogin,checkoutController.showAddress);

router
  .route("/address/new")
  .get(auth.requireLogin,checkoutController.showAddAddress)
  .post(auth.requireLogin,checkoutController.handleAddAddress);

router
  .route("/address/edit/:id")
  .get(auth.requireLogin,checkoutController.showEditAddress)
  .put(auth.requireLogin,checkoutController.handleEditAddress);

router.post("/address/selectAddress",auth.requireLogin, checkoutController.handleSelectAddress);

router.get("/paymentMethod",auth.requireLogin, checkoutController.showPaymentMethods);
router.post("/api/razorpay/success",auth.requireLogin, checkoutController.handleRazorpaySuccess);

router.patch('/api/coupon/apply',checkoutController.applyCoupon)
router.patch('/api/coupon/cancel',checkoutController.cancelCoupon)

router.post("/api/placeOrder",auth.requireLogin, checkoutController.handlePlaceOrder);

router.get("/placeOrder/:id",auth.requireLogin, checkoutController.showPlaceOrder);


module.exports = router