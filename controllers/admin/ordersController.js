const Order = require('../../models/Order');

// Reusable error handler
const handleError = require('../../helpers/handleError')

// SHOW ALL ORDERS (with pagination + search)
const showOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const search = req.query.search?.trim() || "";

    const filter = {};
    if (search) {
      // safer regex escape
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter["userId.email"] = { $regex: escaped, $options: "i" };
    }

    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("userId", "email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const totalPages = Math.ceil(totalOrders / limit);

    return res.render("adminPages/orders", {
      page: "orders",
      orders,
      currentPage: page,
      totalPages,
      limit,
      search,
      count: totalOrders, // use real count
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

    const order = await Order.findById(id);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    if (!order.products[index]) {
      req.flash("error", "Invalid product index");
      return res.redirect(`/admin/order/${id}`);
    }

    if (status === "returned") {
      order.products[index].isRequested = false;
    }

    order.products[index].status = status;
    await order.save();

    return res.redirect(`/admin/order/${id}`);
  } catch (error) {
    handleError(res, "handleProductStatus", error);
  }
};

// HANDLE WHOLE ORDER STATUS
const handleOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    order.status = status;

    if (status === "cancelled") {
      order.products.forEach((p) => (p.status = "cancelled"));
    }

    if (status === "delivered") {
      order.products.forEach((p) => {
        if (p.status !== "cancelled" && p.status !== "returned") {
          p.status = "delivered";
        }
      });
    }

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
