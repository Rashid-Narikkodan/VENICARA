const showSalesReport = async (req, res) => {
  try {
    return res.render('adminPages/salesReport', { page: 'salesReport' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}
module.exports={
  showSalesReport,
}