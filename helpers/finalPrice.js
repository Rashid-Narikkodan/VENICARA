const Category = require('../models/Category')
const getDiscountPercent = require('./discPercent')

module.exports = async function finalAmount(bp, discount, id) {
    const category = await Category.findById(id)
    const catDiscount = parseFloat(category.discount)
    const productDiscount = parseFloat(discount) 

    const finalDiscount = Math.max(catDiscount, productDiscount)
    const discountedPrice = bp - (finalDiscount / 100) * bp
    return Math.round(discountedPrice)
}
