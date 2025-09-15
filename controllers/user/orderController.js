const Order = require("../../models/Order");
const Product = require("../../models/Product");
const handleError = require("../../helpers/handleError");
const generateInvoice = require('../../helpers/generateInvoice')
const User = require('../../models/User')
const Wallet=require('../../models/Wallet')
const WalletTransaction=require('../../models/WalletTransaction')

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
    const userId = req.session.user.id;

    const order = await Order.findById(orderId);
    if (!order) 
      return res.status(404).json({ status: false, message: "Order not found" });

    const product = order.products[index];
    if (!product) 
      return res.status(400).json({ status: false, message: "Invalid product index" });

    if (product.status === "cancelled" || product.status === "returned") {
      return res.status(400).json({ status: false, message: "Product already cancelled/returned" });
    }

    await Product.findOneAndUpdate(
      { _id: product.productId, "variants._id": product.variantId },
      { $inc: { "variants.$.stock": product.quantity } }
    );

    product.status = "cancelled";

    order.totalAmount = order.products
      .filter(p => p.status !== "cancelled" && p.status !== "returned")
      .reduce((sum, p) => sum + p.subtotal, 0);

    if (order.products.every(p => p.status === "cancelled")) {
      order.status = "cancelled";
    }
    if (order.products.every(p => p.status === "returned")) {
      order.status = "returned";
    }

    if (["WALLET", "RAZORPAY"].includes(order.payment.method)) {
      const wallet = await Wallet.findOne({ userId });
      wallet.balance += product.subtotal;
      await wallet.save();

      await WalletTransaction.create({
        userId,
        type: "credit",
        amount: product.subtotal*100,
        status: "success",
        lastBalance: wallet.balance,
      });
    }

    await order.save();

    res.status(200).json({ status: true, message: "Product cancelled successfully" });
  } catch (error) {
    console.error(error);
    handleError(res, "cancelProduct", error);
  }
};


const returnProductRequest = async (req, res) => {
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
    handleError(res, "returnProductRequest", error);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId);
    const userId=req.session.user.id
    if (!order) return res.status(404).json({ status: false, message: "Order not found" });

    let totalToWallet=0;
    for(let prod of order.products){
      if(prod.status != 'cancelled'&&prod.status != 'returned'){
        totalToWallet+=prod.subtotal
      }
    }
    if(totalToWallet>0){
      if (["WALLET", "RAZORPAY"].includes(order.payment.method)) {
      const wallet = await Wallet.findOne({ userId });
      wallet.balance += totalToWallet;
      await wallet.save();

      await WalletTransaction.create({
        userId,
        type: "credit",
        amount: totalToWallet*100,
        status: "success",
        lastBalance: wallet.balance,
      });
    }
    }
    // restore stock for all products
    for (const product of order.products) {
      await Product.findOneAndUpdate(
        { _id: product.productId, "variants._id": product.variantId },
        { $inc: { "variants.$.stock": product.quantity } }
      );
      if(product.status!=='delivered'&&product.status!=='returned'){
      product.status = "cancelled";
      await product.save()
    }
    }

    order.status = "cancelled";
    await order.save();

    

    res.status(200).json({ status: true, message: "Order cancelled successfully" });
  } catch (error) {
    handleError(res, "cancelOrder", error);
  }
};

const returnOrderRequest = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ status: false, message: "Order not found" });

    order.isRequested = true;
    order.reqReason = reason;
    order.save()

    res.status(200).json({ status: true, message: "Return request submitted for order" });
  } catch (error) {
    handleError(res, "returnOrderRequest", error);
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.session.user?.id;

    if (!userId) {
      req.flash("error", "Login required");
      return res.redirect("/login");
    }

    // Fetch order and populate required fields
    const order = await Order.findOne({ _id: orderId, userId })
      .populate("userId", "name email")           // Get user details
      .populate("shippingAddress")                // Get full shipping address
      .lean();

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }

    const discountAmount = order.products.reduce((acc, p) => acc + (p.discountAmount || 0), 0);

    // Ensure all necessary fields exist for the PDF
    const populatedOrder = {
      ...order,
      orderId:order.orderId || order._id,
      userId: {
        name: order.userId?.name || "N/A",
        email: order.userId?.email || "N/A"
      },
      shippingAddress: {
        fullName: order.shippingAddress?.fullName || "N/A",
        street: order.shippingAddress?.street || "N/A",
        city: order.shippingAddress?.city || "N/A",
        state: order.shippingAddress?.state || "N/A",
        pin: order.shippingAddress?.pin || "N/A",
        mobile: order.shippingAddress?.mobile || "N/A"
      },
      products: order.products?.map(p => ({
        productName: p.productName || "N/A",
        volume: p.volume || "-",
        quantity: p.quantity || 0,
        discountPrice: p.finalDiscount || 0,
        subtotal: p.subtotal || 0,
        createdAt: order.createdAt || new Date(),
        finalDiscount: p.finalDiscount || 0,
        discountAmount: p.discountAmount || 0.
        
      })),
      totalAmount: order.totalAmount || 0,
      payment: {
        method: order.payment?.method || "N/A"
      },
      status: order.status || "N/A"
    };

    // Generate the invoice PDF
    generateInvoice(populatedOrder, res);

  } catch (error) {
    handleError(res, "downloadInvoice", error);
  }
};

module.exports = downloadInvoice;

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
  returnOrderRequest,
  cancelProduct,
  returnProductRequest,
  downloadInvoice,
  orderDetails,
};
