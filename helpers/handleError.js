// utils/errorHandler.js (you can put this in utils folder)
const handleError = (res, controllerName, error) => {
  console.error(`Error in ${controllerName}:`, error);
  res.status(500).send(`Error from ${controllerName}: ${error.message}`);
};

module.exports = handleError;
