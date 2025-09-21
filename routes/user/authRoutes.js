const express = require("express");
const router = express.Router();
const passport = require("passport");

const { authController } = require("../../controllers/user/index");
const auth = require("../../middlewares/authUser");

/* ------------------ GOOGLE OAUTH ------------------ */
router.get(
  "/google",
  auth.loggedIn,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  authController.handleGoogleAuth
);

/* ------------------ LOGIN ------------------ */
router
  .route("/login")
  .get(auth.loggedIn, authController.showLogin)
  .post(auth.loggedIn, authController.handleLogin);

/* ------------------ FORGOT PASSWORD + OTP ------------------ */
router
  .route("/forgot")
  .get(auth.loggedIn, authController.showForgot)
  .post(auth.loggedIn, authController.handleForgot);

router
  .route("/forgot/otp")
  .get(auth.loggedIn, authController.showForgotOTP)
  .post(auth.loggedIn, authController.handleForgotOTP);

router.post(
  "/forgot/resend-otp",
  auth.loggedIn,
  authController.resendForgotOTP
);

router
  .route("/forgot/change-password")
  .get(auth.loggedIn, authController.showChangePass)
  .patch(auth.loggedIn, authController.handleChangePass);

/* ------------------ SIGNUP + OTP ------------------ */
router
  .route("/signup")
  .get(auth.loggedIn, authController.showSignup)
  .post(auth.loggedIn, authController.handleSignup);

router
  .route("/signup/verify-otp")
  .get(auth.loggedIn, authController.showSignupOTP)
  .post(auth.loggedIn, authController.handleSignupOTP);

router.post("/signup/resend-otp", auth.loggedIn, authController.resendOTP);

/* ------------------ LOGOUT ------------------ */
router.post("/logout", authController.handleLogout);

module.exports = router;
