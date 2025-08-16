
const pageNotFound = async(req,res)=>{
  try{
    return res.render('pageNotFound')
  }catch(error){
    res.redirect('/pageNotFound')
  }
}
const landingPage= async(req,res)=>{
  try{
    return res.render('userPages/landing')
  }catch(err){
    console.log(err.message);
    res.status(500).send(err.message)
  }
}
const homePage=(req,res)=>{
  try{
    return res.render('userPages/home')
  }catch(error){
    res.status(500).send(error.message)
  }
}

module.exports = {
  landingPage,
  homePage
}