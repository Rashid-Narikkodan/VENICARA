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
      data:productsSoldData
    } = await getChartData(filter,'products.quantity')

    const {
      labels:revenueLabels,
      data:revenueChartData
    } = await getChartData(filter,'finalAmount')

  
   
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
        revenueLabels,
        revenueChartData,
      }
    });

  } catch(err) {
    handleError(res, "showDashboard", err);
  }
};

module.exports = { showDashboard };
