const express = require("express");
const router = express.Router();
const {
  authController,
  userController,
  productController,
  homeController,
  addressController,

} = require("../controllers/user/index");
const auth = require("../middlewares/authUser");
const passport = require("passport");
const upload=require('../middlewares/multer');

// user Authrntication
router.get(
  "/auth/google",
  auth.loggedIn,
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.handleGoogleAuth
);
router
  .route("/login")
  .get(auth.loggedIn, authController.showLogin)
  .post(authController.handleLogin);
router
  .route("/forgot")
  .get(auth.loggedIn, authController.showForgot)
  .post(authController.handleForgot);
router
  .route("/forgotOTP")
  .get(auth.loggedIn, authController.showForgotOTP)
  .post(authController.handleForgotOTP);
router.post("/resendForgotOTP", authController.resendForgotOTP);
router
  .route("/forgot/changePass")
  .get(auth.loggedIn, authController.showChangePass)
  .patch(authController.handleChangePass);
router
  .route("/signup")
  .get(auth.loggedIn, authController.showSignup)
  .post(authController.handleSignup);
router
  .route("/signup/verify-otp")
  .get(auth.loggedIn, authController.showSignupOTP)
  .post(authController.handleSignupOTP);
router.post("/signup/resend-otp", authController.resendOTP);
router.post("/logout", authController.handleLogout);

//user Landing,Home,Shop pages
router.get("/", auth.loggedIn, homeController.landingPage);
router.get(
  "/home",
  auth.requireLogin,
  auth.isUserBlocked,
  homeController.showHome
);
router.get("/shop", homeController.showShop);
//product pages
router.get("/search", productController.searchProducts);
router.get("/products/:id", productController.showProductDetails);
//user pages
router.get("/profile", auth.requireLogin, userController.showProfile);
router.patch("/profile/edit",upload.single('userProfile'), userController.editProfile);
router.get('/profile/verify',userController.showProfileVerify)
router.post('/profile/verify',userController.handleProfileVerify)
router.get('/profile/OTP',userController.showProfileOTP)
router.post('/profile/OTP',userController.handleProfileOTP)
router.post('/resendProfileOTP',userController.resendProfileOTP)
router.get('/profile/changePassword',userController.showProfileChangePass)
router.patch('/profile/changePassword',userController.handleProfileChangePass)
router.get('/profile/address',addressController.showAddress)
router.get('/address/new',addressController.showNewAddress)
router.post('/address/new',addressController.handleNewAddress)
router.get('/address/edit/:id',addressController.showEditAddress)
router.put('/address/edit/:id',addressController.handleEditAddress)
router.delete('/address/delete/:id',addressController.deleteAddress)
router.get('/address/setDefault/:id',addressController.setDefaultAddress)
// router.post('/address/:id/setDefault',addressController.setDefaultAddress)

module.exports = router;
