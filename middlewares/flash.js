// middlewares/flashMessages.js
module.exports = (req, res, next) => {
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info')
  };
  next();
};
