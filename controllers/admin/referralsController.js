const showReferrals = async (req, res) => {
  try {
    return res.render('adminPages/referrals', { page: 'referrals' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}
module.exports={
  showReferrals,
}