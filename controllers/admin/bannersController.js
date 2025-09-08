const handleError = require('../../helpers/handleError');

const showBanners = async (req, res) => {
  try {
    return res.render('adminPages/banners', { page: 'banners' });
  } catch (err) {
    handleError(res, "showBanners", err);
  }
};

module.exports = {
  showBanners,
};
