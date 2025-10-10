const express = require("express");
const router = express.Router();

const { orderController } = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");

router.route("/").get(auth.requireLogin, orderController.showOrders);
router.patch("/cancel/:id", orderController.cancelOrder);
router.patch("/return/:id", orderController.returnOrderRequest);
router.patch("/product/cancel/:id", orderController.cancelProduct);
router.patch("/product/return/:id", orderController.returnProductRequest);
router.get("/:orderId/invoice", orderController.downloadInvoice);
router.get("/details/:id", orderController.orderDetails);
router.post("/review/:id/add", orderController.addReview);
router.post("/api/retryPayment", orderController.retryPayment);
router.patch("/api/retryPaymentSuccess", orderController.retryPaymentSuccess);
module.exports = router;
