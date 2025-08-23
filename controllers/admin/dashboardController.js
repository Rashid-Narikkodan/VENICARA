const showDashboard=(req,res)=>{
  try{
    return res.render('adminPages/dashboard',{page:'dashboard'})
  }catch(er){
    res.status(500).send(er.message)
  }
}
module.exports={
  showDashboard,
}