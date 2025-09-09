const Order = require("../../models/Order");
const Product = require("../../models/Product");
const handleError = require("../../helpers/handleError");
const generateInvoice = require('../../helpers/generateInvoice')
const User = require('../../models/User')

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

    // restore stock
    await Product.findOneAndUpdate(
      { _id: product.productId, "variants._id": product.variantId },
      { $inc: { "variants.$.stock": product.quantity } }
    );

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
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ status: false, message: "Order not found" });

    const product = order.products[index];
    if (!product) return res.status(400).json({ status: false, message: "Invalid product index" });

    product.isRequested = true;
    product.reqReason = reason;

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

    // restore stock for all products
    for (const product of order.products) {
      await Product.findOneAndUpdate(
        { _id: product.productId, "variants._id": product.variantId },
        { $inc: { "variants.$.stock": product.quantity } }
      );
      product.status = "cancelled";
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({ status: true, message: "Order cancelled successfully" });
  } catch (error) {
    handleError(res, "cancelOrder", error);
  }
};

const returnOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ status: false, message: "Order not found" });

    order.isRequested = true;
    order.reqReason = reason;

    await order.save();

    res.status(200).json({ status: true, message: "Return request submitted for order" });
  } catch (error) {
    handleError(res, "returnOrder", error);
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.session.user?.id;
    console.log(orderId)
    if (!userId) {
      req.flash("error", "Login required");
      return res.redirect("/login");
    }

    const order = await Order.findOne({ _id: orderId, userId })
      .populate("userId", "name email")
      .populate("shippingAddress")
      .lean();

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }

    generateInvoice(order, res); // 🔥 helper used here

  }catch(error){
    handleError(res,'downloadInvoice',error)
  }
}

const orderDetails=async(req,res)=>{
  try{
    const {id}=req.params
    const {index} = req.query
    
    // Fetch order
    const order = await Order.findById(id).populate('shippingAddress');
    if (!order) {
      return res.status(404).send('Order not found');
    }
    const product=order.products[index]
    res.render('userPages/orderDetails', {
      order,
      product,
      payment:order.payment,
      shippedAddress:order.shippingAddress
    });
  }catch(error){
    handleError(res,'orderDetails',error)
  }
}
module.exports = {
  showOrders,
  cancelOrder,
  returnOrder,
  cancelProduct,
  returnProduct,
  downloadInvoice,
  orderDetails,
};
