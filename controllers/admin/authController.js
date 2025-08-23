const bcrypt=require('bcrypt')
const Admin=require('../../models/Admin')


const handleEntry=(req,res)=>{
  try{
    return res.redirect('/admin/login')
  }catch(er){
    res.status(500).send('internal error in entry handle'+er.message)
  }
}

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
     req.session.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    }
    console.log(req.session.admi)
    req.flash('success','logged in successfully')
    res.redirect('/admin/dashboard')
  }catch(err){
    res.status(500).send(err)
  }
}

const handleLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/admin/dashboard"); // fallback if error
    }
    res.clearCookie("connect.sid"); // clears session cookie
    res.redirect("/admin/login");
  });
};

module.exports={
  handleEntry,
  showLogin,
  handleLogin,
  handleLogout
}