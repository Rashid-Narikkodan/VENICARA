const Order = require("../../models/Order");
const Product = require("../../models/Product");
const handleError = require("../../helpers/handleError");
const generateInvoice = require('../../helpers/generateInvoice')
const Coupon=require('../../models/Coupon')
const Wallet=require('../../models/Wallet')
const WalletTransaction=require('../../models/WalletTransaction')
const Review = require('../../models/Review')

const showOrders = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) return res.redirect("/login");

    const orders = await Order.find({ userId })
      .populate("products.productId")
      .sort({ createdAt: -1 });

      for(const order of orders){
        if(order.payment.status=='pending'&&order.payment.method=='RAZORPAY'){
          await Order.findByIdAndDelete(order._id)
        }
      }
      
      res.render("userPages/orders", { orders });
  } catch (error) {
    handleError(res, "showOrders", error);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const userId = req.session.user.id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) return res.status(404).json({ status: false, message: "Order not found" });

    if(["delivered","shipped"].includes(order.status))return res.json({status:false,message:"cannot cancel the order in this stage"})

    for (const product of order.products) {
      if (["cancelled", "returned","delivered","shipped"].includes(product.status)) continue;
      // Restore stock
      await Product.updateOne(
        { _id: product.productId, "variants._id": product.variantId },
        { $inc: { "variants.$.stock": product.quantity } }
      );
      product.status = "cancelled";
    }
  
    // Refund to wallet if prepaid
    if (["WALLET", "RAZORPAY"].includes(order.payment.method)) {
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) wallet = new Wallet({ userId, balance: 0 });

      let refundAmount=order.finalAmount

      if(order.couponApplied){
        const totalRefund = order.refundAmount + order.finalAmount
        const orginalAmount = order.totalOrderPrice - (order.totalOrderPrice*order.couponDiscount/100).toFixed(2)
        if(totalRefund>orginalAmount){
          const extraMoney = totalRefund - orginalAmount
          refundAmount-=extraMoney
          order.couponApplied = null
          order.couponDiscount = 0
        }
      }

      wallet.balance = Math.round((wallet.balance + refundAmount) * 100) / 100;
      await wallet.save();

      await WalletTransaction.create({
        userId,
        orderId,
        type: "credit",
        amount: refundAmount*100,
        status: "success",
        lastBalance: wallet.balance,
        note: "Refund for cancelled order",
      });

      order.payment.status = "refunded"; 
      order.refundAmount += refundAmount;
      order.finalAmount = 0
    }

    order.status = "cancelled";
    await order.save();
    return res.status(200).json({ status: true, message: "Order cancelled successfully" });

  } catch (error) {
    console.error("cancelOrder error:", error);
    return res.status(500).json({ status: false, message: "Something went wrong" });
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


    product.return.isRequested = true;
    product.return.reason = reason;
    

    await order.save();

    res.status(200).json({ status: true, message: "Return request submitted for product" });
  } catch (error) {
    handleError(res, "returnProductRequest", error);
  }
};


const cancelProduct = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { index } = req.query;
    const userId = req.session.user.id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ status: false, message: "Order not found" });
    }

    const product = order.products[index];
    if (!product) {
      return res.status(400).json({ status: false, message: "Invalid product index" });
    }
    if (["cancelled", "returned"].includes(product.status)) {
      return res.status(400).json({ status: false, message: "Product already cancelled/returned" });
    }
    if (["delivered", "shipped"].includes(product.status)) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel at this stage" });
    }

    // Cancel product
    product.status = "cancelled";

    // Restore stock
    await Product.updateOne(
      { _id: product.productId, "variants._id": product.variantId },
      { $inc: { "variants.$.stock": product.quantity } }
    );

    // Wallet refund
    if (["WALLET", "RAZORPAY"].includes(order.payment.method)) {

      let wallet = await Wallet.findOne({ userId });
      if (!wallet) wallet = new Wallet({ userId, balance: 0 });

      let refundAmount = parseFloat((product.subtotal).toFixed(2));

      //refund logic if coupon applied
      if (order.couponApplied) {
        const coupon=await Coupon.findById(order.couponApplied)
        const {minPrice:minPurchase}=coupon;

        const newTotalPrice = order.totalOrderPrice - (order.refundAmount+product.subtotal)
        
        if(newTotalPrice < minPurchase){
          const discount = order.totalOrderPrice * order.couponDiscount / 100;
          refundAmount = parseFloat((product.subtotal - discount).toFixed(2));
          order.couponApplied = null;
          order.couponDiscount = 0;
        }

        order.finalAmount = newTotalPrice - (newTotalPrice*order.couponDiscount/100).toFixed(2)
      
      }else{

        order.finalAmount -= refundAmount;
        
      }

      //update RefundAmount in both
      product.refundAmount = refundAmount;
      order.refundAmount += refundAmount;

      wallet.balance = Math.round((wallet.balance + refundAmount) * 100) / 100;;
      await wallet.save();

      await WalletTransaction.create({
        userId,
        orderId,
        productId: product.productId,
        type: "credit",
        amount: refundAmount*100, 
        status: "success",
        lastBalance: wallet.balance,
      });
    }
    
    // Update order status
    if (order.products.every((p) => p.status === "cancelled")) {
      order.status = "cancelled";
    } else if (order.products.every((p) => p.status === "returned")) {
      order.status = "returned";
      order.payment.status = "refunded";
    }

    await order.save();

    return res.status(200).json({ status: true, message: "Product cancelled successfully" });

  } catch (error) {
    console.error("cancelProduct error:", error);
    return res.status(500).json({ status: false, message: "Something went wrong" });
  }
};


const returnOrderRequest = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ status: false, message: "Order not found" });

    order.return.isRequested = true;
    order.return.reason = reason;
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
const addReview=async (req,res)=>{
 try {
  const {id:productId} = req.params
    const { name, rating, message} = req.body;

    if (!rating || !message || !name || !productId) {
      return res.status(400).json({ status:false, message: 'All fields are required' });
    }

      const existingReview = await Review.findOne({ userId: req.session.user.id, productId: productId });

      if (existingReview) {
        existingReview.rating = rating;
        existingReview.message = message;
        existingReview.name = name;
        await existingReview.save();
      } else {
        await Review.create({ name, rating, message, userId: req.session.user.id, productId });
      }


    res.status(201).json({status:true, message: 'Review added successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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
  addReview
};
