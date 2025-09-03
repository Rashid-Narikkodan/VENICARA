const express = require("express");
const router = express.Router();

const {
  checkoutController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router
  .route("/address")
  .get(checkoutController.showAddress);

router
  .route("/address/new")
  .get(checkoutController.showAddAddress)
  .post(checkoutController.handleAddAddress);

router
  .route("/address/edit/:id")
  .get(checkoutController.showEditAddress)
  .put(checkoutController.handleEditAddress);

router.post("/address/selectAddress", checkoutController.handleSelectAddress);

router.get("/paymentMethod", checkoutController.showPaymentMethods);

router.post("/api/placeOrder", checkoutController.handlePlaceOrder);

router.get("/placeOrder/:id", checkoutController.showPlaceOrder);


module.exports = router