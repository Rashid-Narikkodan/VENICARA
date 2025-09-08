const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/cart", require("./cartRoutes"));
router.use("/checkout", require("./checkoutRoutes"));
router.use("/orders", require("./orderRoutes"));

module.exports = router;
