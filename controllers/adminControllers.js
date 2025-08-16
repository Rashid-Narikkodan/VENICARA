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
    if(!email||!password) return res.status(400).json({message:'Email and Password required'})
    //find admin by email
    const admin=await Admin.findOne({email})
    if(!admin) return res.status(401).json({message:"Invalid credentials"})
    const isMatch=await bcrypt.compare(password,admin.password)
    if(!isMatch) return res.status(401).json({message:"Invalid credentials"})
    if(!admin.isActive) return res.status(403).json({ message: "Account is not active." })
    //session create
     req.session.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    }

    return res.redirect('/admin/dashboard')
  }catch(err){
    res.status(500).send(err)
  }
}

const showDashboard=(req,res)=>{
  try{
    return res.render('adminPages/dashboard')
  }catch(er){
    res.status(500).send(er.message)
  }
}
module.exports = {
  showLogin,
  handleLogin,
  showDashboard
}