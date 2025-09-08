const handleError = require('../../helpers/handleError');

const showDashboard = (req, res) => {
  try {
    return res.render('adminPages/dashboard', { page: 'dashboard' });
  } catch (err) {
    handleError(res, "showDashboard", err);
  }
};

module.exports = {
  showDashboard,
};
