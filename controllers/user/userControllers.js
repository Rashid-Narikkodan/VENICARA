const Product=require('../../models/Product')
const landingPage = async (req, res) => {
  try {
    const products = await Product
    .find({ isDeleted: false, isAvailable: true })
    return res.render('userPages/landing')
  } catch (err) {
    console.log(err.message)
    res.status(500).send(err.message)
  }
}
const showHome = (req, res) => {
  try {
    return res.render('userPages/home')
  } catch (err) {
    res.status(500).send(err.message)
  }
}
module.exports = {
  landingPage,
  showHome,
}
