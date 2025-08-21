const express=require('express')
const router=express.Router()
const adminController=require('../controllers/adminControllers')
const auth=require('../middlewares/authAdmin')
const upload = require('../middlewares/upload');
router.get('/',auth.isLoggedIn,adminController.handleEntry)
router
  .route('/login')
  .get(auth.isLoggedIn,adminController.showLogin)
  .post(adminController.handleLogin)
router
  .route('/dashboard')
  .get(auth.requireLogin,adminController.showDashboard)
router
  .route('/customers')
  .get(auth.requireLogin,adminController.showCustomers)

router
  .route('/orders')
  .get(auth.requireLogin, adminController.showOrders)

router
  .route('/products')
  .get(auth.requireLogin, adminController.showProducts)
  
router.route('/products/add')
  .get(adminController.showAddProduct)
  .post(upload.array('images',10),adminController.addProduct)
  
router.patch('/products/:id',adminController.deleteProduct)

router.route('/products/edit/:id')
  .get(adminController.showEditProduct)
  .put(upload.array("images", 10),adminController.editProduct)
router
  .route('/salesReport')
  .get(auth.requireLogin, adminController.showSalesReport)

router
  .route('/coupons')
  .get(auth.requireLogin, adminController.showCoupons)

router
  .route('/categories')
  .get(auth.requireLogin, adminController.showCategory)
router.route('/category/add')
  .get(adminController.addCategory)

router
  .route('/returnRefund')
  .get(auth.requireLogin, adminController.showReturnRefund)

router
  .route('/banners')
  .get(auth.requireLogin, adminController.showBanners)

router
  .route('/referrals')
  .get(auth.requireLogin, adminController.showReferrals)


router.get('/logout',adminController.handleLogout)
module.exports = router