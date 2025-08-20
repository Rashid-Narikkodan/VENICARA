const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'You must be logged in to access this page')
    return res.redirect('/')
  }
  next()
}
const loggedIn=(req,res,next)=>{
  if(req.session.user){
    return res.redirect('/home')
  }
  next()
}

module.exports ={
  requireLogin,
  loggedIn
}