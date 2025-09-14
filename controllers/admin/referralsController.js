const handleError = require("../../helpers/handleError");
const Referrals=require('../../models/Referrals')
const User=require('../../models/User')

const showReferrals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    // Total referrals for pagination
    const totalReferrals = await Referrals.countDocuments();

    // Fetch referrals with pagination
    const referrals = await Referrals.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Populate referrer and referred names
    for (let r of referrals) {
      const referrer = await User.findById(r.referrerUserId).lean();
      const referred = await User.findById(r.referredUserId).lean();
      r.referrer = referrer?.name || "N/A";
      r.referred = referred?.name || "N/A";
    }

    // Global totals
    const pipeline = [
      {
        $group: {
          _id: null,
          referrers: { $addToSet: "$referrerUserId" },
          referred: { $addToSet: "$referredUserId" },
        },
      },
      {
        $project: {
          _id: 0,
          totalReferrerUsers: { $size: "$referrers" },
          totalReferredUsers: { $size: "$referred" },
        },
      },
    ];

    const total = await Referrals.aggregate(pipeline);
    const { totalReferredUsers, totalReferrerUsers } = total[0] || {};

    let totalPaid = 0;
    let totalPending = 0;
    for (let reward of referrals) {
      if (reward.status === "claimed") totalPaid += reward.amount;
      else totalPending += reward.amount;
    }

    const data = {
      referredCount: totalReferredUsers,
      referrerCount: totalReferrerUsers,
      totalPaid,
      totalPending,
    };

    const totalPages = Math.ceil(totalReferrals / limit);

    return res.render("adminPages/referrals", {
      page: "referrals",
      referrals, // table rows
      currentPage: page,
      totalPages,
      limit,
      count: (page - 1) * limit,
      data,      // global stats
    });
  } catch (err) {
    handleError(res, "showReferrals", err);
  }
};

const approveReward= async (req,res)=>{
  try{
    const {id}=req.params
    await Referrals.findOneAndUpdate({_id:id},{status:'claim'})
    res.json({success:true,message:'Claim'})
  }catch(error){
    res.json({status:false,message:error.message})
  }
}

module.exports = {
  showReferrals,
  approveReward,
};




