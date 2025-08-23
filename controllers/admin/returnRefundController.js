const showReturnRefund = async (req, res) => {
  try {
    return res.render('adminPages/returnRefund', { page: 'returnRefund' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}
module.exports={
  showReturnRefund,
}