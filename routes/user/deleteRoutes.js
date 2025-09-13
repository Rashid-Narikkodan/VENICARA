const express = require("express");
const router = express.Router();
const {
  deleteController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router.get('/',deleteController.show)

module.exports = router