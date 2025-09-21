const express = require("express");
const router = express.Router();
const {
  deleteController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router.route('/')
.get(deleteController.show)
.patch(deleteController.deleteAc)

module.exports = router