const express = require("express");
const router = express.Router();
const {
  wishlistController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router.get("/", wishlistController.show);
router.post("/add/:id", wishlistController.add);
router.post("/api/add/:id", wishlistController.addToCart);
router.post("/api/add/toWish/:id", wishlistController.addToWishlist);
router.delete("/api/remove/:id", wishlistController.remove);

module.exports = router