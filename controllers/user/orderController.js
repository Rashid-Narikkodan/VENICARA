const Order = require("../../models/Order")

const showOrders = async (req, res) => {
  try {
    const userId = req.session.user.id;
    if (!userId) return res.redirect('/login');

    const orders = await Order.find({ userId })
    .populate('products.productId')
    .sort({ createdAt: -1 });
    

    res.render('userPages/orders', { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong :-'+err.message);
  }
};

module.exports={
    showOrders
}