const showCoupons = async (req, res) => {
  try {
    return res.render('adminPages/coupons', { page: 'coupons' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}

module.exports={
  showCoupons,
}