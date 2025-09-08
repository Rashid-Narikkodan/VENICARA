const Order = require("../../models/Order");
const handleError = require("../../helpers/handleError");

const showOrders = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) return res.redirect("/login");

    const orders = await Order.find({ userId })
      .populate("products.productId")
      .sort({ createdAt: -1 });

    res.render("userPages/orders", { orders });
  } catch (error) {
    handleError(res, "showOrders", error);
  }
};

const cancelProduct = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { index } = req.query;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ status: false, message: "Order not found" });

    const product = order.products[index];
    if (!product) return res.status(400).json({ status: false, message: "Invalid product index" });

    product.status = "cancelled";
    order.totalAmount -= product.subtotal;

    // if all products are cancelled → cancel whole order
    if (order.products.every(p => p.status === "cancelled")) {
      order.status = "cancelled";
    }

    await order.save();
    res.status(200).json({ status: true, message: "Product cancelled successfully" });
  } catch (error) {
    handleError(res, "cancelProduct", error);
  }
};

const returnProduct = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { index } = req.query;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ status: false, message: "Order not found" });

    const product = order.products[index];
    if (!product) return res.status(400).json({ status: false, message: "Invalid product index" });

    product.isRequested = true;
    await order.save();

    res.status(200).json({ status: true, message: "Return request submitted for product" });
  } catch (error) {
    handleError(res, "returnProduct", error);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ status: false, message: "Order not found" });

    order.status = "cancelled";
    order.products.forEach(p => (p.status = "cancelled"));

    await order.save();
    res.status(200).json({ status: true, message: "Order cancelled successfully" });
  } catch (error) {
    handleError(res, "cancelOrder", error);
  }
};

const returnOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ status: false, message: "Order not found" });

    order.isRequested = true;
    await order.save();

    res.status(200).json({ status: true, message: "Return request submitted for order" });
  } catch (error) {
    handleError(res, "returnOrder", error);
  }
};

module.exports = {
  showOrders,
  cancelOrder,
  returnOrder,
  cancelProduct,
  returnProduct,
};
