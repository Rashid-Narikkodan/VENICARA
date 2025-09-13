const handleError = require('../../helpers/handleError');
const User = require('../../models/User');

const show = async (req, res) => {
  try {
    res.render('userPages/delete');
  } catch (err) {
    handleError(res, "showReferEarn", err);
  }
};

module.exports = {
  show,
};
