const User=require('../../models/User')
const showProfile=async(req,res)=>{
  try{
    const user=await User.findById(req.session.user.id)
    res.render('userPages/profile',{user})
  }catch(err){
    console.log(err)
    res.status(500).send('from showProfile :- '+err.message)   
  }
}
module.exports = {
  showProfile,
}
