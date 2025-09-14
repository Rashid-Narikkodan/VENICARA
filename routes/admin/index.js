const router = require("express").Router();
const auth = require("../../middlewares/authAdmin");

router.use("/auth",auth.isLoggedIn, require("./authRoutes"));
router.use("/dashboard",auth.requireLogin, require("./dashboardRoutes"));
router.use("/orders",auth.requireLogin, require("./orderRoutes"));
router.use("/products",auth.requireLogin, require("./productsRoutes"));
router.use("/salesReport",auth.requireLogin, require("./salesReportRoutes"));
router.use("/customers",auth.requireLogin, require("./customersRoutes"));
router.use("/coupons",auth.requireLogin, require("./couponRoutes"));
router.use("/categories",auth.requireLogin, require("./categroiesRoutes"));
router.use("/banners",auth.requireLogin, require("./bannersRoutes"));
router.use("/returnRefund",auth.requireLogin, require("./returnRefundRoutes"));
router.use("/referrals",auth.requireLogin, require("./referralsRoutes"));

module.exports = router;
