const express=require('express')
const router=express.Router()
const userController = require('../controllers/userControllers')
const auth=require('../middlewares/authUser')

router.get('/',auth.loggedIn,userController.landingPage)

router
  .route('/login')
  .get(auth.loggedIn,userController.showLogin)
  .post(userController.handleLogin)
router
  .route('/forgot')
  .get(auth.loggedIn,userController.showForgot)
  .post(userController.handleForgot)
router
  .route('/forgotOTP')
  .get(auth.loggedIn,userController.showForgotOTP)
  .post(userController.handleForgotOTP)

router.post('/resendForgotOTP',userController.resendForgotOTP)

router
  .route('/forgot/changePass')
  .get(auth.loggedIn,userController.showChangePass)
  .patch(userController.handleChangePass)
router
  .route('/signup')
  .get(auth.loggedIn,userController.showSignup)
  .post(userController.handleSignup)

router
  .route('/signup/verify-otp')
  .get(auth.loggedIn,userController.showSignupOTP)
  .post(userController.handleSignupOTP)

router.post('/signup/resend-otp',userController.resendOTP)

router.get('/home',auth.requireLogin,userController.showHome)

module.exports = router