const express = require("express");
const router = express.Router();
const {
  authController,
  dashboardController,
  ordersController,
  productsController,
  salesReportController,
  customersController,
  couponsController,
  categoriesController,
  returnRefundController,
  bannersController,
  referralsController,
} = require("../controllers/admin/index");

const auth = require("../middlewares/authAdmin");
const upload = require("../middlewares/multer");
router.get("/", auth.isLoggedIn, authController.handleEntry);
router
  .route("/login")
  .get(auth.isLoggedIn, authController.showLogin)
  .post(authController.handleLogin);
router
  .route("/dashboard")
  .get(auth.requireLogin, dashboardController.showDashboard);
router
  .route("/customers")
  .get(auth.requireLogin, customersController.showCustomers);
router.patch("/customers/status/:id", customersController.blockCustomer);

router.route("/orders").get(auth.requireLogin, ordersController.showOrders);
router.get("/order/:id", ordersController.showOrderDetails);
router.patch(
  "/orders/product/status/:id",
  ordersController.handleProductStatus
);
router.patch("/orders/:id/status", ordersController.handleOrderStatus);
router.patch("/orders/:orderId/return/reject", ordersController.rejectReturn);
router.patch("/orders/:orderId/return/approve", ordersController.approveReturn);

router
  .route("/products")
  .get(auth.requireLogin, productsController.showProducts);
router
  .route("/products/add")
  .get(auth.requireLogin, productsController.showAddProduct)
  .post(upload.array("images", 10), productsController.addProduct);
router.patch("/products/:id", productsController.deleteProduct);
router
  .route("/products/edit/:id")
  .get(auth.requireLogin, productsController.showEditProduct)
  .put(upload.array("images", 10), productsController.editProduct);
router.patch("/products/edit/removeImg/:id", productsController.removeImage);
router.patch("/products/status/:id", productsController.toggleProductActive);

router.route("/salesReport").get(salesReportController.showSalesReport);
router.post(
  "/salesReport/export/pdf",
  salesReportController.exportSalesPDF
);
router.post(
  "/salesReport/export/excel",
  salesReportController.exportSalesExcel
);
router.route("/coupons").get(auth.requireLogin, couponsController.showCoupons);
router
  .route("/coupons/add")
  .post(auth.requireLogin, couponsController.addCoupon);
router.patch("/coupons/:id", couponsController.deleteCoupon);

router
  .route("/categories")
  .get(auth.requireLogin, categoriesController.showCategory);
router
  .route("/categories/add")
  .get(auth.requireLogin, categoriesController.showAddCategory)
  .post(categoriesController.addCategory);
router
  .route("/categories/edit/:id")
  .get(auth.requireLogin, categoriesController.showEditCategory)
  .put(categoriesController.editCategory);
router.patch("/categories/active/:id", categoriesController.activeCategory);
router.patch("/categories/:id", categoriesController.deleteCategory);

router
  .route("/returnRefund")
  .get(auth.requireLogin, returnRefundController.showReturnRefund);

router.route("/banners").get(auth.requireLogin, bannersController.showBanners);

router
  .route("/referrals")
  .get(auth.requireLogin, referralsController.showReferrals);
router.patch(
  "/referrals/:id",
  auth.requireLogin,
  referralsController.approveReward
);

router.get("/logout", authController.handleLogout);
module.exports = router;
