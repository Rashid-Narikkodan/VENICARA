const handleError = require("../../helpers/handleError");

const showReturnRefund = async (req, res) => {
  try {
    return res.render("adminPages/returnRefund", { page: "returnRefund" });
  } catch (err) {
    handleError(res, "showReturnRefund", err);
  }
};

module.exports = {
  showReturnRefund,
};
