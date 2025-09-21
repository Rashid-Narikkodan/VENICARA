const router = require("express").Router();

const auth=require('../../middlewares/authUser')

router.use("/auth",require("./authRoutes"));
router.use("/", require("./homeRoutes"));  // home, shop, search, etc.

router.use("/profile",auth.requireLogin, require("./profileRoutes"));
router.use("/address",auth.requireLogin, require("./addressRoutes"));
router.use("/cart",auth.requireLogin, require("./cartRoutes"));
router.use("/checkout",auth.requireLogin, require("./checkoutRoutes"));
router.use("/wishlist",auth.requireLogin, require("./wishlistRoutes"));
router.use("/orders",auth.requireLogin, require("./orderRoutes"));
router.use("/referEarn",auth.requireLogin, require("./referRoutes"));
router.use("/wallet",auth.requireLogin, require("./walletRoutes"));
router.use("/delete",auth.requireLogin, require("./deleteRoutes"));

module.exports = router;
