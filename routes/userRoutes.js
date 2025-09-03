const express = require("express");
const router = express.Router();

const {

  referController,
  walletController,
} = require("../controllers/user/index");



router.get("/referEarn", referController.showReferEarn);
router.get("/wallet", walletController.showWallet);


module.exports = router;
