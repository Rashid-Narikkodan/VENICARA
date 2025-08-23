const showBanners = async (req, res) => {
  try {
    return res.render('adminPages/banners', { page: 'banners' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}
module.exports={
  showBanners,
}