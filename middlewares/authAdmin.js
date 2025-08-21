const requireLogin = (req, res, next) => {
  if (!req.session.admin) {
    req.flash('error', 'You must be logged in to access this page')
    return res.redirect('/admin/login')
  }
  next()
}
const isLoggedIn=(req,res,next)=>{
  if(req.session.admin){
    return res.redirect('/admin/dashboard')
  }
  next()
}
module.exports ={
  requireLogin,
  isLoggedIn
}
