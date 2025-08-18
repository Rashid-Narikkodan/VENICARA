const express=require('express')
const router=express.Router()
const userController = require('../controllers/userControllers')

router.get('/',userController.landingPage)
router
  .route('/login')
  .get(userController.showLogin)
  .post(userController.handleLogin)
router
  .route('/signup')
  .get(userController.showSignup)
  .post(userController.handleSignup)

router
  .route('/signup/verify-otp')
  .get(userController.showSignupOTP)
  .post(userController.handleSignupOTP)
router.post('/resend-otp',userController.resendOTP)
module.exports = router