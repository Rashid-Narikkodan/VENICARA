const handleError = require('../../helpers/handleError');

const showCoupons = async (req, res) => {
  try {
    return res.render('adminPages/coupons', { page: 'coupons' });
  } catch (err) {
    handleError(res, "showCoupons", err);
  }
};

module.exports = {
  showCoupons,
};
