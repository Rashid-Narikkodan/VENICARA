const handleError = require("../../helpers/handleError");

const showSalesReport = async (req, res) => {
  try {
    return res.render("adminPages/salesReport", { page: "salesReport" });
  } catch (err) {
    handleError(res, "showSalesReport", err);
  }
};

module.exports = {
  showSalesReport,
};
