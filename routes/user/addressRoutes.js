const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  addressController
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");
const upload = require("../../middlewares/multer");

router.get("/", addressController.showAddress);

router
  .route("/new")
  .get(addressController.showNewAddress)
  .post(addressController.handleNewAddress);

router
  .route("/edit/:id")
  .get(addressController.showEditAddress)
  .put(addressController.handleEditAddress);

router.delete("/delete/:id", addressController.deleteAddress);
router.get("/default/:id", addressController.setDefaultAddress);

module.exports = router