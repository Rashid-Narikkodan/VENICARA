const User = require('../models/User');


const requireLogin = async (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'You must be logged in to access this page')
    return res.redirect('/')
  }
  next()
}
const isUserBlocked=async(req, res, next)=>{
  const user=await User.findById(req.session.user?.id);
  if (!user||user.isBlocked) {
     req.logout((err) => {
    if (err) {
      console.log("Error destroying session:", err);
      return res.status(500).send("Logout failed :- "+err);
    }
    res.clearCookie("connect.sid");
    req.flash('error','This account has been Blocked')
    res.redirect("/"); 
  })
  } else {
    next();
  }
}
const loggedIn=(req,res,next)=>{
  if(req.session.user){
    return res.redirect('/home')
  }
  next()
}

module.exports ={
  requireLogin,
  loggedIn,
  isUserBlocked,
}