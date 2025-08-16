const express=require('express')
const router=express.Router()
const adminController=require('../controllers/adminControllers')
const auth=require('../middlewares/authAdmin')
router.get('/',auth.isAdminLoggedIn)
router
  .route('/login')
  .get(adminController.showLogin)
  .post(adminController.handleLogin)
router
  .route('/dashboard')
  .get(adminController.showDashboard)
module.exports = router