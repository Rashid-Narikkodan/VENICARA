const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  userController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");
const upload = require("../../middlewares/multer");

router.get("/", auth.requireLogin, userController.showProfile);

router
  .route("/delete")
  .get(userController.showDeleteAc)
  .patch(userController.handleDeleteAc);

router.patch(
  "/edit",
  upload.single("userProfile"),
  userController.editProfile
);

router
  .route("/verify")
  .get(userController.showProfileVerify)
  .post(userController.handleProfileVerify);

router
  .route("/OTP")
  .get(userController.showProfileOTP)
  .post(userController.handleProfileOTP);

router.post("/resendProfileOTP", userController.resendProfileOTP);

router
  .route("/changePassword")
  .get(userController.showProfileChangePass)
  .patch(userController.handleProfileChangePass);


module.exports = router