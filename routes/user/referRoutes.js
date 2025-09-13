const express = require("express");
const router = express.Router();
const {
  referController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router.get("/", referController.showReferEarn);
router.patch("/api/reward", referController.earnReward);

module.exports = router