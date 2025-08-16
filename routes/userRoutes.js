const express=require('express')
const router=express.Router()
const userController = require('../controllers/userControllers')

router.get('/',userController.landingPage)
router.get('/home',userController.homePage)

module.exports = router