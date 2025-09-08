const {nanoid} = require('nanoid')
const Order=require('../models/Order')
async function generateOrderId(){
    const orderId=`ORD-${nanoid(6).toUpperCase()}`
    const isExist = await Order.findOne({orderId})
    if(isExist) return generateOrderId()
    else return orderId
}
module.exports = generateOrderId