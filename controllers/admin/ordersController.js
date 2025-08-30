const showOrders = async (req, res) => {
    try {
        return res.render("adminPages/orders", { page: "orders" });
    } catch (er) {
        res.status(500).send(er.message);
    }
};

module.exports = {
    showOrders,
};
