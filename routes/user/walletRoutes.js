const express = require("express");
const router = express.Router();
const {
  walletController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router.get("/", walletController.showWallet);
router.post("/add", walletController.addToWallet);
router.post("/verify-payment", walletController.verifyPayment);
router.get("/history", walletController.showTransactionHistory);

module.exports = router