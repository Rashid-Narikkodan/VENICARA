const router = require("express").Router();
const auth = require("../../middlewares/authAdmin");

router.use("/auth", auth.isLoggedIn, require("./authRoutes"));
router.use(auth.requireLogin);
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/products", require("./productsRoutes"));
router.use("/salesReport", require("./salesReportRoutes"));
router.use("/customers", require("./customersRoutes"));
router.use("/coupons", require("./couponRoutes"));
router.use("/categories", require("./categroiesRoutes"));
router.use("/referrals", require("./referralsRoutes"));

module.exports = router;
