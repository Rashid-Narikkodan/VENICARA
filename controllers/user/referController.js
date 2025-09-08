const handleError = require('../../helpers/handleError');

const showReferEarn = async (req, res) => {
  try {
    res.render('userPages/refer');
  } catch (err) {
    handleError(res, "showReferEarn", err);
  }
};

module.exports = {
  showReferEarn,
};
