const express = require("express");
const router = express.Router();

const {
  addressController
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router.get("/",auth.requireLogin, addressController.showAddress);

router
  .route("/new")
  .get(auth.requireLogin, addressController.showNewAddress)
  .post(addressController.handleNewAddress);

router
  .route("/edit/:id")
  .get(auth.requireLogin,addressController.showEditAddress)
  .put(addressController.handleEditAddress);

router.delete("/delete/:id",auth.requireLogin, addressController.deleteAddress);
router.get("/default/:id",auth.requireLogin, addressController.setDefaultAddress);

module.exports = router