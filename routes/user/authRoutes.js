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
  .post(authController.handleLogin);

/* ------------------ FORGOT PASSWORD + OTP ------------------ */
router
  .route("/forgot")
  .get(auth.loggedIn, authController.showForgot)
  .post(authController.handleForgot);

router
  .route("/forgot/otp")
  .get(auth.loggedIn, authController.showForgotOTP)
  .post(authController.handleForgotOTP);

router.post("/forgot/resend-otp", authController.resendForgotOTP);

router
  .route("/forgot/change-password")
  .get(auth.loggedIn, authController.showChangePass)
  .patch(authController.handleChangePass);

/* ------------------ SIGNUP + OTP ------------------ */
router
  .route("/signup")
  .get(auth.loggedIn, authController.showSignup)
  .post(authController.handleSignup);

router
  .route("/signup/verify-otp")
  .get(auth.loggedIn, authController.showSignupOTP)
  .post(authController.handleSignupOTP);

router.post("/signup/resend-otp", authController.resendOTP);

/* ------------------ LOGOUT ------------------ */
router.post("/logout", authController.handleLogout);

module.exports = router;
