const Order = require("../../models/Order");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const WalletTransaction = require("../../models/WalletTransaction");
const Product = require("../../models/Product");  // ✅ Need this for stock update
const handleError = require("../../helpers/handleError");

// SHOW ALL ORDERS (with pagination + search)
const showOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim() || "";
    const sortOption = req.query.sort?.trim() || "";

    const filter = {};

    // Search by orderId or email
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ orderId: { $regex: escaped, $options: "i" } }];

      const users = await User.find(
        { email: { $regex: escaped, $options: "i" } },
        { _id: 1 }
      ).lean();

      if (users.length) {
        filter.$or.push({ userId: { $in: users.map((u) => u._id) } });
      }
    }

    if (status) {
      filter.status = status;
    }

    let sortQuery = { createdAt: -1 };
    switch (sortOption) {
      case "date_asc":
        sortQuery = { createdAt: 1 };
        break;
      case "date_desc":
        sortQuery = { createdAt: -1 };
        break;
      case "amount_asc":
        sortQuery = { totalAmount: 1 };
        break;
      case "amount_desc":
        sortQuery = { totalAmount: -1 };
        break;
    }

    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("userId", "email")
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalOrders / limit);

    return res.render("adminPages/orders", {
      page: "orders",
      orders,
      currentPage: page,
      totalPages,
      limit,
      search,
      status,
      sort: sortOption,
      count: (page - 1) * limit,
    });
  } catch (error) {
    handleError(res, "showOrders", error);
  }
};

// SHOW ORDER DETAILS
const showOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId")
      .populate("shippingAddress")
      .lean();

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    return res.render("adminPages/orderDetails", {
      page: "orders",
      order,
      count: 0,
    });
  } catch (error) {
    handleError(res, "showOrderDetails", error);
  }
};

// HANDLE INDIVIDUAL PRODUCT STATUS
const handleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { index } = req.query;
    const { status } = req.body;
    const userId=req.session.user.id

    const order = await Order.findById(id);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    const product = order.products[index];
    if (!product) {
      req.flash("error", "Invalid product index");
      return res.redirect(`/admin/order/${id}`);
    }

    if (status === "returned") {
      product.isRequested = false;

      await Product.findOneAndUpdate(
        { _id: product.productId, "variants._id": product.variantId },
        { $inc: { "variants.$.stock": product.quantity } }
      );
      if(["WALLET","RAZORPAY"].includes(order.payment.method)){
        const wallet=await Wallet.findone({userId})
        wallet.balance+=product.subtotal
        await wallet.save()
        await WalletTransaction.create({
          userId,
          type:'credit',
          status:'success',
          amount:100*subtotal,
          lastBalance:wallet.balance
        })
      }
    }

    product.status = status;
    await order.save();


    return res.redirect(`/admin/order/${id}`);
  } catch (error) {
    handleError(res, "handleProductStatus", error);
  }
};

//  WHANDLEHOLE ORDER STATUS
const handleOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.session.user.id;

    const order = await Order.findById(id);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    order.status = status;

    if (status === "returned"||status==='cancelled') {
      order.isRequested = false;
      order.products.forEach(async(p) => {
        await Product.findOneAndUpdate(
          { _id: p.productId, "variants._id": p.variantId },
          { $inc: { "variants.$.stock": p.quantity } }
        );
    });
    }
    
    
    if (status === "returned") {
      for(let prod of order.products){
        if(prod.status === 'returned'){
          
        }
      }
      if(["WALLET","RAZORPAY"].includes(order.payment.method)){
        const wallet=await Wallet.findone({userId})
        wallet.balance+=totalToWallet
        await wallet.save()
        await WalletTransaction.create({
          userId,
          type:'credit',
          status:'success',
          amount:100*totalToWallet,
          lastBalance:wallet.balance
        })
      }
    }

    //change per product status
    order.products.forEach((p) => {
      if (p.status !== "cancelled"&&p.status != 'returned') {
        p.status = status;
      }
    });

    await order.save();

    return res.redirect(`/admin/order/${id}`);
  } catch (error) {
    handleError(res, "handleOrderStatus", error);
  }
};


module.exports = {
  showOrders,
  showOrderDetails,
  handleProductStatus,
  handleOrderStatus,
};
