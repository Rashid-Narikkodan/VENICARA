const Category = require('../models/Category')
const getDiscountPercent = require('./discPercent')

module.exports = async function finalDiscountPercent(bp, dp, id) {
    const category = await Category.findById(id)
    const catDiscount = parseFloat(category.discount)
    const productDiscount = parseFloat(getDiscountPercent(bp, dp))
    const finalDiscount = Math.max(catDiscount, productDiscount)
    return finalDiscount.toFixed(2)
}
