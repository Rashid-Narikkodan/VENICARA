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
  .get(auth.requireLogin,userController.showDeleteAc)
  .patch(userController.handleDeleteAc);

router.route("/edit")
.get(userController.showEditProfile)
.patch(
  upload.single("userProfile"),
  auth.requireLogin,userController.editProfile
);

router.post('/edit/otp',userController.handleNewEmailOTP)

router
  .route("/verify")
  .get(auth.requireLogin,userController.showProfileVerify)
  .post(userController.handleProfileVerify);

router
  .route("/OTP")
  .get(auth.requireLogin,userController.showProfileOTP)
  .post(auth.requireLogin,userController.handleProfileOTP);

router.post("/resendProfileOTP", userController.resendProfileOTP);

router
  .route("/changePassword")
  .get(auth.requireLogin,userController.showProfileChangePass)
  .patch(auth.requireLogin,userController.handleProfileChangePass);


module.exports = router