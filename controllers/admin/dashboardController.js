const handleError = require('../../helpers/handleError');
const getChartData = require('../../helpers/getChartData')
const getDashboardData = require("../../helpers/getDashboardData")

const showDashboard = async (req, res) => {
  try {
    const filter = req.query.filter || "daily";

    const {
      totalSales,
      totalOrders,
      productsSold,
      newCustomers,
      topProducts
    }=  await getDashboardData(filter)
    
    const {
      labels:productsSoldLabels,
      data,
    } = await getChartData(filter,'products.quantity')
    

    const productsSoldData = []
    const productsReturnedData = []
    const productsCancelledData = []
    
    for(let elem of data){
      productsSoldData.push(elem.soldCount)
      productsReturnedData.push(elem.returnCount)
      productsCancelledData.push(elem.cancelCount)
    }

    
    const {
      labels:revenueLabels,
      data:revenue
    } = await getChartData(filter,'finalAmount')

  
    const refundChartData = []
    const revenueChartData = []
    
    for(let elem of revenue){
      revenueChartData.push(elem.revenueCount)
      refundChartData.push(elem.refundCount)
    }
   
    return res.render('adminPages/dashboard', {
      page: 'dashboard',
      filter,
      dashboardData: {
        totalSales,
        totalOrders,
        productsSold,
        newCustomers,
        topProducts,
        productsSoldLabels,
        productsSoldData,
        productsReturnedData,
        productsCancelledData,
        revenueLabels,
        revenueChartData,
        refundChartData,
      }
    });

  } catch(err) {
    handleError(res, "showDashboard", err);
  }
};

module.exports = { showDashboard };
