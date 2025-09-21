const handleError = require("../../helpers/handleError");
const Order = require("../../models/Order");

const showReturnRefund = async (req, res) => {
  try {
    const orders = await Order.find({'return.isRequested':true});
    const productOrders = await Order.find({'products.return.isRequested':true}).sort({ updatedAt: -1 });
    const products = productOrders.map(order => {
      return order.products.filter(product => product.isRequested);
    }).flat();
    console.log(orders)
    console.log(products)

    return res.render("adminPages/returnRefund", { page: "returnRefund", orders});
  } catch (err) {
    handleError(res, "showReturnRefund", err);
  }
};

module.exports = {
  showReturnRefund,
};
