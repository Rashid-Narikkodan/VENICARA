const handleError = require("../../helpers/handleError");
const Referrals=require('../../models/Referrals')

const showReferrals = async (req, res) => {
  try {
    const referrals = await Referrals.find({}).lean()
    const pipeline=[
  {
    $group: {
      _id: null,
      referrers: { $addToSet: "$referrerUserId" },
      referred: { $addToSet: "$referredUserId" },
    }
  },
  {
    $project: {
      _id: 0,
      totalReferrerUsers: { $size: "$referrers" },
      totalReferredUsers: { $size: "$referred" }
    }
  }
]
    const total=await Referrals.aggregate(pipeline)
    const {totalReferredUsers,totalReferrerUsers}=total[0] 
  let totalPaid = 0;
  let totalPending = 0;
  for(let reward of referrals){
    if(reward.status == 'claimed'){
      totalPaid+=reward.amount
    }else{
      totalPending+=reward.amount
    }
  }
    const data={
      referredCount:totalReferredUsers,
      referrerCount:totalReferrerUsers,
      totalPaid,
      totalPending,
    }

    console.log(data)

    return res.render("adminPages/referrals", { page: "referrals", referrals,data });
  } catch (err) {
    handleError(res, "showReferrals", err);
  }
};
const handleStatus= async (req,res)=>{
  try{
    const {userId}=req.body
    await Referrals.findOneAndUpdate({userId},{status:'claim'})
    res.json({status:true,message:'Claim'})
  }catch(error){
    res.json({status:false,message:error.message})
  }
}

module.exports = {
  showReferrals,
  handleStatus,
};
