const router = require("express").Router();

const auth=require('../../middlewares/authUser')

router.use("/auth",require("./authRoutes"));
router.use("/", require("./homeRoutes"));  // home, shop, search, etc.

router.use("/profile",auth.requireLogin,auth.isUserBlocked, require("./profileRoutes"));
router.use("/address",auth.requireLogin,auth.isUserBlocked, require("./addressRoutes"));
router.use("/cart",auth.requireLogin,auth.isUserBlocked, require("./cartRoutes"));
router.use("/checkout",auth.requireLogin,auth.isUserBlocked, require("./checkoutRoutes"));
router.use("/wishlist",auth.requireLogin,auth.isUserBlocked, require("./wishlistRoutes"));
router.use("/orders",auth.requireLogin,auth.isUserBlocked, require("./orderRoutes"));
router.use("/referEarn",auth.requireLogin,auth.isUserBlocked, require("./referRoutes"));
router.use("/wallet",auth.requireLogin,auth.isUserBlocked, require("./walletRoutes"));
router.use("/delete",auth.requireLogin,auth.isUserBlocked, require("./deleteRoutes"));

module.exports = router;
