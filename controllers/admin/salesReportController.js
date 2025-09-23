const handleError = require("../../helpers/handleError");
const Order = require("../../models/Order");
const generatePDF = require("../../helpers/salesPDF");
const generateSalesReportExcel = require("../../helpers/salesExcel");

const showSalesReport = async (req, res) => {
  try {
    let filter = req.query.filter || "daily";
    let startDate, endDate;
    const now = new Date();

    //decide filteration
    switch (filter) {
      case "daily":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "weekly":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(),now.getMonth() + 1,0,23,59,59,999);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case "custom":
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    const delivered = {
      updatedAt: { $gte: startDate, $lte: endDate },
      status: "delivered",
      'payment.status': "paid"
    };
    const cancelled = {
      updatedAt: { $gte: startDate, $lte: endDate },
      status: "cancelled",
    };
    const returned = {
      updatedAt: { $gte: startDate, $lte: endDate },
      'return.status': "approved",
    };
    const refunded = {
      updatedAt: { $gte: startDate, $lte: endDate },
      "payment.status": "refunded" ,
    };
    const productCancelled = {
      updatedAt: { $gte: startDate, $lte: endDate },
      products: { $elemMatch: { status: "cancelled" } },
    };
    const productReturned = {
      updatedAt: { $gte: startDate, $lte: endDate },
      products: { $elemMatch: { status: "returned" } },
    };

    // Fetch orders within the date range and confirmed status
    const orders = await Order.find(delivered).populate('userId','name').sort({ createdAt: -1 })

    // Fetch essential data for the report
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount,0);
    
    const totalProductSold = orders.reduce((sum, order) => {
      const productCount = order.products.reduce((productSum, product) => productSum + product.quantity,0);
      return sum + productCount;
    }, 0);

    const totalDiscountPerProduct = orders.reduce((sum, order) => {
      const productDiscount = order.products.reduce((discSum, product) =>discSum+(product.basePrice-product.finalAmount)*product.quantity,0);
        return sum + productDiscount;
      }, 0);


    const totalDiscountPerOrder= orders.reduce((sum, order) => {
      const productDiscount = order.products.reduce((discSum, product) =>discSum+(product.basePrice-product.finalAmount)*product.quantity,0);
      const orderDiscount = (order.totalOrderPrice - order.finalAmount)+productDiscount;
        return sum + orderDiscount;
      }, 0);    
    const totalRefund = await Order.find(refunded).then((refundOrders)=>refundOrders.reduce((sum, order) => sum + order.refundAmount, 0));
    const AverageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const countUser = await Order.distinct("userId",delivered);
    const totalCustomers = countUser.length;
    const totalCancelled = await Order.countDocuments(cancelled);
    const totalReturned = await Order.countDocuments(returned);
    
    const totalProductCancelled = await Order.find(productCancelled).then(orders => 
      orders.reduce((sum, order) => {
        const cancelledCount = order.products
          .filter(p => p.status === "cancelled")
          .reduce((s, p) => s + p.quantity, 0);
        return sum + cancelledCount;
      }, 0)
    );
    
    const totalProductReturned = await Order.find(productReturned).then(orders => 
      orders.reduce((sum, order) => {
        const returnedCount = order.products
          .filter(p => p.status === "returned")
          .reduce((s, p) => s + p.quantity, 0);
        return sum + returnedCount;
      }, 0)
    );

    orders.forEach(order => {
     const productDisc = order.products.reduce((s,product) =>s+(product.basePrice*product.quantity)-product.subtotal, 0);
      order.productDiscount = productDisc;
    });

    const data = {
      totalOrders,
      totalRevenue,
      totalProductSold,
      totalCustomers,
      totalCancelled,
      totalReturned,
      totalDiscountPerProduct,
      totalDiscountPerOrder,
      totalRefund,
      AverageOrderValue,
      totalProductCancelled,
      totalProductReturned
    };
    console.log(data)
    req.session.salesReport = { data, filter, startDate, endDate, orders };

    return res.render("adminPages/salesReport", {
      page: "salesReport",
      filter,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      orders,
      data,
    });
  } catch (err) {
    handleError(res, "showSalesReport", err);
  }
};
const exportSalesPDF = async (req, res) => {
  try {

    const { data, filter, startDate, endDate, orders } = req.session.salesReport;
    // Create a new PDF document
    generatePDF(req, res, data, orders, filter, startDate, endDate);

  } catch (err) {
    handleError(res, "exportSalesPDF", err);
  }
};

const exportSalesExcel = async (req, res) => {
  try {

    const { data, filter, startDate, endDate, orders } = req.session.salesReport;
    generateSalesReportExcel(req, res, data, orders, filter, startDate, endDate);
   
  } catch (err) {
    handleError(res, "exportSalesExcel", err);
  }
};

module.exports = {
  showSalesReport,
  exportSalesPDF,
  exportSalesExcel,
};
