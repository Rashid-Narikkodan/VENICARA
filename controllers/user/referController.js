const handleError = require('../../helpers/handleError');
const User = require('../../models/User');
const Referrals=require('../../models/Referrals');
const Wallet = require('../../models/Wallet');
const WalletTransaction = require('../../models/WalletTransaction');

const showReferEarn = async (req, res) => {
  try {
    const user=await User.findById(req.session.user.id)
    const rewards=await Referrals.find({referrerUserId:req.session.user.id})
    res.render('userPages/refer',{referralCode:user.referralCode,rewards});
  } catch (err) {
    handleError(res, "showReferEarn", err);
  }
};

const earnReward= async (req,res)=>{
  try{
    const {id}=req.body
    const {id:userId}=req.session.user
    const reward=await Referrals.findById(id)
    if(reward.status=='claimed'){
      res.json({status:false,message:"Already claimed reward"})
    }
    const wallet=await Wallet.findOneAndUpdate({userId},{$inc:{balance:reward.amount}})
    await WalletTransaction.findOneAndUpdate({userId},{status:'success',lastBalance:wallet.balance})
    reward.status = 'claimed'
    await reward.save()
    console.log(reward)
    res.json({status:true,message:'Claimed'})
  }catch(error){
    res.json({status:false,message:error.message})
  }
}

module.exports = {
  showReferEarn,
  earnReward,
};
