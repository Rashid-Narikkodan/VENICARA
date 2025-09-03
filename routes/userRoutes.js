const express = require("express");
const router = express.Router();
// const passport = require("passport");

const {
  authController,
  userController,
  productController,
  homeController,
  addressController,
  cartController,
  referController,
  walletController,
  checkoutController,
} = require("../controllers/user/index");

const auth = require("../middlewares/authUser");
const upload = require("../middlewares/multer");

/* ------------------ AUTH ------------------ */

// Google OAuth
// router.get(
//   "/auth/google",
//   auth.loggedIn,
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   authController.handleGoogleAuth
// );

// // Login
// router
//   .route("/login")
//   .get(auth.loggedIn, authController.showLogin)
//   .post(authController.handleLogin);

// // Forgot Password + OTP
// router
//   .route("/forgot")
//   .get(auth.loggedIn, authController.showForgot)
//   .post(authController.handleForgot);

// router
//   .route("/forgotOTP")
//   .get(auth.loggedIn, authController.showForgotOTP)
//   .post(authController.handleForgotOTP);

// router.post("/resendForgotOTP", authController.resendForgotOTP);

// router
//   .route("/forgot/changePass")
//   .get(auth.loggedIn, authController.showChangePass)
//   .patch(authController.handleChangePass);

// // Signup + OTP
// router
//   .route("/signup")
//   .get(auth.loggedIn, authController.showSignup)
//   .post(authController.handleSignup);

// router
//   .route("/signup/verify-otp")
//   .get(auth.loggedIn, authController.showSignupOTP)
//   .post(authController.handleSignupOTP);

// router.post("/signup/resend-otp", authController.resendOTP);

// // Logout
// router.post("/logout", authController.handleLogout);

/* ------------------ PAGES ------------------ */

// Landing & Home
router.get("/", auth.loggedIn, homeController.landingPage);
router.get(
  "/home",
  auth.requireLogin,
  auth.isUserBlocked,
  homeController.showHome
);

// Shop & Product
router.get("/shop", homeController.showShop);
router.get("/search", productController.searchProducts);
router.get("/products/:id", productController.showProductDetails);

/* ------------------ PROFILE ------------------ */

router.get("/profile", auth.requireLogin, userController.showProfile);

router
  .route("/profile/delete")
  .get(userController.showDeleteAc)
  .patch(userController.handleDeleteAc);

router.patch(
  "/profile/edit",
  upload.single("userProfile"),
  userController.editProfile
);

router
  .route("/profile/verify")
  .get(userController.showProfileVerify)
  .post(userController.handleProfileVerify);

router
  .route("/profile/OTP")
  .get(userController.showProfileOTP)
  .post(userController.handleProfileOTP);

router.post("/resendProfileOTP", userController.resendProfileOTP);

router
  .route("/profile/changePassword")
  .get(userController.showProfileChangePass)
  .patch(userController.handleProfileChangePass);

router.get("/profile/referEarn", referController.showReferEarn);
router.get("/profile/wallet", walletController.showWallet);

/* ------------------ ADDRESS ------------------ */

router.get("/profile/address", addressController.showAddress);

router
  .route("/address/new")
  .get(addressController.showNewAddress)
  .post(addressController.handleNewAddress);

router
  .route("/address/edit/:id")
  .get(addressController.showEditAddress)
  .put(addressController.handleEditAddress);

router.delete("/address/delete/:id", addressController.deleteAddress);
router.get("/address/default/:id", addressController.setDefaultAddress);

/* ------------------ CART ------------------ */

router
  .route("/cart")
  .get(cartController.showCart);

router
  .route("/cart/addToCart/:id")
  .post(cartController.addToCart);

router
  .route("/cart/remove/:id")
  .delete(cartController.removeFromCart);

router.post("/cart/applyCoupon", cartController.applyCoupon);

router
  .route("/cart/increase/:cartId")
  .patch(cartController.increaseQuantity);

router
  .route("/cart/decrease/:cartId")
  .patch(cartController.decreaseQuantity);

/* ------------------ CHECKOUT ------------------ */

router
  .route("/checkout/address")
  .get(checkoutController.showAddress);

router
  .route("/checkout/address/new")
  .get(checkoutController.showAddAddress)
  .post(checkoutController.handleAddAddress);

router
  .route("/checkout/address/edit/:id")
  .get(checkoutController.showEditAddress)
  .put(checkoutController.handleEditAddress);

router.post("/checkout/address/selectAddress", checkoutController.handleSelectAddress);

router.get("/checkout/paymentMethod", checkoutController.showPaymentMethods);

router.post("/api/placeOrder", checkoutController.handlePlaceOrder);

router.get("/checkout/placeOrder/:id", checkoutController.showPlaceOrder);

module.exports = router;
