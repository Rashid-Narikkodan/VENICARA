const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/profile", require("./profileRoutes"));
router.use("/address", require("./addressRoutes"));
router.use("/cart", require("./cartRoutes"));
router.use("/checkout", require("./checkoutRoutes"));
router.use("/", require("./homeRoutes"));  // home, shop, search, etc.

module.exports = router;
