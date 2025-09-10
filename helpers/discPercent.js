function getDiscountPercent(basePrice, discountPrice) {
  return Math.round((basePrice - discountPrice) / basePrice * 100);
}
module.exports = getDiscountPercent