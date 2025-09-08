const handleError = require("../../helpers/handleError");

const showReferrals = async (req, res) => {
  try {
    return res.render("adminPages/referrals", { page: "referrals" });
  } catch (err) {
    handleError(res, "showReferrals", err);
  }
};

module.exports = {
  showReferrals,
};
