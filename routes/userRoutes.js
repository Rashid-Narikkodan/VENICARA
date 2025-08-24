const express=require('express')
const router=express.Router()
const {authController,userController} = require('../controllers/user/index')
const auth=require('../middlewares/authUser')
const passport=require('passport')

router.get('/',auth.loggedIn,userController.landingPage)

router.get('/auth/google',auth.loggedIn,passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),authController.handleGoogleAuth)

router
  .route('/login')
  .get(auth.loggedIn,authController.showLogin)
  .post(authController.handleLogin)
router
  .route('/forgot')
  .get(auth.loggedIn,authController.showForgot)
  .post(authController.handleForgot)
router
  .route('/forgotOTP')
  .get(auth.loggedIn,authController.showForgotOTP)
  .post(authController.handleForgotOTP)

router.post('/resendForgotOTP',authController.resendForgotOTP)

router
  .route('/forgot/changePass')
  .get(auth.loggedIn,authController.showChangePass)
  .patch(authController.handleChangePass)
router
  .route('/signup')
  .get(auth.loggedIn,authController.showSignup)
  .post(authController.handleSignup)

router
  .route('/signup/verify-otp')
  .get(auth.loggedIn,authController.showSignupOTP)
  .post(authController.handleSignupOTP)

router.post('/signup/resend-otp',authController.resendOTP)

router.get('/home',auth.requireLogin,auth.isUserBlocked,userController.showHome)

router.get('/logout',authController.handleLogout)
module.exports = router