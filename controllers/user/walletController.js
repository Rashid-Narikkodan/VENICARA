const handleError = require('../../helpers/handleError');

const showWallet = async (req, res) => {
  try {
    res.render('userPages/wallet');
  } catch (err) {
    handleError(res, "showWallet", err);
  }
};

module.exports = {
  showWallet,
};
