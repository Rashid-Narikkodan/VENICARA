const express = require("express");
const router = express.Router();
const {
  wishlistController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router.get("/", wishlistController.show);
router.post("/api/add/:id", wishlistController.addToWishlist);
router.post("/api/addToCart/:id", wishlistController.addToCart);
router.delete("/api/remove/:id", wishlistController.remove);

module.exports = router