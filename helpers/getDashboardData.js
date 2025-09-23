    const Order = require('../models/Order');
    const Customer = require('../models/User');

    async function getDashboardData(filter){

        const now = new Date();
        let startDate, endDate;

    switch (filter) {
      case "daily":
        startDate = new Date(now.setHours(0,0,0,0));
        endDate = new Date(now.setHours(23,59,59,999));
        break;
      case "weekly":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 6); // last 7 days
        endDate = new Date();
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth()+1, 0,23,59,59,999);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23,59,59,999);
        break;
    }

    // Aggregate dashboard stats
    const totalSalesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate },'payment.status':'paid' } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } }
    ]);
    
    //aggregate total sold products count
    const productsSoldAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate },'payment.status':'paid' } },
      { $unwind: "$products" },
      { $group: { _id: null, count: { $sum: "$products.quantity" } } }
    ]);

    const topProducts=await Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate },'payment.status':'paid' } },
        {$unwind:'$products'},
        { $group: { _id: '$products.productId', totalSold: { $sum: "$products.quantity" } } },
        {$lookup:{from:'products',localField:'_id',foreignField:'_id',as:'products'}},
        {$unwind:'$products'},
        {$project:{_id:0,productId:'$products._id',name:'$products.name',totalSold:1,img:'$products.images'}},
        {$sort:{totalSold:-1}}
    ])

    //dashbord datas
    const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate, $lte: endDate },'payment.status':'paid' });
    const totalSales = totalSalesAgg[0]?.total || 0;
    const productsSold = productsSoldAgg[0]?.count || 0;
    const newCustomers = await Customer.countDocuments({ createdAt: { $gte: startDate, $lte: endDate },'payment.status':'paid' });
    
    return {
        totalOrders,
        totalSales,
        productsSold,
        newCustomers,
        topProducts
        }

    }

    module.exports = getDashboardData