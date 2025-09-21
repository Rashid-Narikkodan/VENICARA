const handleError = require('../../helpers/handleError');
const User = require('../../models/User');

const show = async (req, res) => {
  try {
    res.render('userPages/delete');
  } catch (err) {
    handleError(res, "showReferEarn", err);
  }
};
const deleteAc= async (req,res)=>{
  try{
    await User.findByIdAndUpdate(req.session.user.id,{isDeleted:true})
     req.session.destroy((err) => {
    if (err) {
      return handleError(res, 'handleLogout', err)
    }
    res.clearCookie("connect.sid")
    res.redirect("/")
  })
  }catch(error){
    handleError(res,'deleteAc',error)
  }
}

module.exports = {
  show,
  deleteAc,
};
