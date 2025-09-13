const router = require("express").Router();

const auth=require('../../middlewares/authUser')

router.use("/auth", require("./authRoutes"));
router.use("/", require("./homeRoutes"));  // home, shop, search, etc.

router.use(auth.requireLogin)

router.use("/profile", require("./profileRoutes"));
router.use("/address", require("./addressRoutes"));
router.use("/cart", require("./cartRoutes"));
router.use("/checkout", require("./checkoutRoutes"));
router.use("/wishlist", require("./wishlistRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/referEarn", require("./referRoutes"));
router.use("/wallet", require("./walletRoutes"));
router.use("/delete", require("./deleteRoutes"));

module.exports = router;
