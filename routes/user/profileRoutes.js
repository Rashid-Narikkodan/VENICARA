const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  userController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");
const upload = require("../../middlewares/multer");

router.get("/", userController.showProfile);

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
router.patch('/api/deleteProfile',userController.deleteProfile)

router.post('/edit/otp',userController.handleNewEmailOTP)
router.post('/resendOTP',userController.resendNewEmailOTP)
router
  .route("/changePassword")
  .get(auth.requireLogin,userController.showProfileChangePass)
  .patch(auth.requireLogin,userController.handleProfileChangePass);
module.exports = router