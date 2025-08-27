function getDiscountPercent(basePrice, discountPrice) {
  return ((basePrice - discountPrice) / basePrice * 100).toFixed(2);
}
module.exports = getDiscountPercent