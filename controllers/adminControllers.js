const Admin=require('../models/adminSchema')
const bcrypt=require('bcrypt')

//SHOW LOGIN
const showLogin=(req,res)=>{
  try{
    return res.render('adminPages/login')
  }catch(error){
    res.status(500).send(error.message)
  }
}

//HANDLE LOGIN
const handleLogin=async(req,res)=>{
  const {email,password}=req.body;
  console.log(email+password);
  try{
    //validate input
    if(!email||!password) {
      req.flash('error','Email and password is required')
      return res.redirect('/admin/login')
    }
    //find admin by email
    const admin=await Admin.findOne({email})
    if(!admin){
      req.flash('error','invald credentials')
      return res.redirect('/admin/login')
    }
    const isMatch=await bcrypt.compare(password,admin.password)
    if(!isMatch){
         req.flash('error','invald credentials')
      return res.redirect('/admin/login')
    }
    if(!admin.isActive){
      req.flash('error', 'Account is not active.');
      return res.redirect('/admin/login');
    }
    //session create
     req.session.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    }
    req.flash('success','logged in successfully')
    res.redirect('/admin/dashboard')
  }catch(err){
    res.status(500).send(err)
  }
}

const showDashboard=(req,res)=>{
  try{
    return res.render('adminPages/dashboard',{page:'dashboard'})
  }catch(er){
    res.status(500).send(er.message)
  }
}
const showCustomers=async(req,res)=>{
  try{
    return res.render('adminPages/customers',{page:'customers'})
  }catch(er){
    res.status(500).send(er.message)
  }
}
const handleLogout=(req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      res.flash('error','not abled to logout due to server issues')
      return res.redirect('/admin/dashboard')
    }
    res.clearCookie('connect.sid')
    res.redirect('/admin/login')
  })
}
module.exports = {
  showLogin,
  handleLogin,
  showDashboard,
  showCustomers,
  handleLogout
}