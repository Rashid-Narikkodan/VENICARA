const express = require('express')
const router = express.Router()

const {footerController}=require('../../controllers/user/index')
router.get('/privacy-policy',footerController.privacyPolicy)
router.get('/return-policy',footerController.returnPolicy)
router.get('/terms-conditions',footerController.termsConditions)
router.get('/cookie-policy',footerController.cookiePolicy)

module.exports = router