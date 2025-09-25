// utils/errorHandler.js (you can put this in utils folder)
const handleError = (res, controllerName, error) => {
  console.error(`Error in ${controllerName}:`, error);
  res.status(500).render('userPages/500',{message:`Error from ${controllerName}: ${error.message}`});
};

module.exports = handleError;
