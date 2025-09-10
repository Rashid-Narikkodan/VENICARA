const handleError = require("../../helpers/handleError");
const Coupon = require("../../models/Coupon");
const showCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    let filter = { isDeleted: false };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const totalCoupons = await Coupon.countDocuments(filter);

    const coupons = await Coupon.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const totalPages = Math.ceil(totalCoupons / limit);

    return res.render("adminPages/coupons", {
      page: "coupons",
      coupons,
      currentPage: page,
      totalPages,
      limit,
      search,
      count: (page - 1) * limit,
    });
  } catch (err) {
    handleError(res, "showCoupons", err);
  }
};

const showCouponsAdd= async (req,res)=>{
  try {
    let {
      name,
      code,
      minPrice,
      discount,
      limit,
      expireAt
    }=req.body
    code=code.toUpperCase()
    const coupon=await Coupon.findOne({code})
    if(coupon){
      req.flash('error','Coupon is already exists')
      return res.redirect('/admin/coupons')
    }
    if(discount>=100){
      req.flash('error','Discount should be less than 100')
      return res.redirect('/admin/coupons')
    }
    
    const [year, month, day] = expireAt.split('-');
    console.log(year)
const now = new Date();
const date = new Date(
  parseInt(year),
  parseInt(month) - 1,
  parseInt(day),
  now.getHours(),
  now.getMinutes(),
  now.getSeconds(),
  now.getMilliseconds()
);

    const newCoupon=new Coupon({
      name,
      code,
      minPrice:parseInt(minPrice),
      discount:parseInt(discount),
      limit:parseInt(limit),
      used:0,
      expireAt:date
    })
    await newCoupon.save()
    req.flash('success','New coupon created')
    return res.redirect('/admin/coupons')
  } catch (error) {
    handleError(res,'showCouponAdd',error)
  }
}

module.exports = {
  showCoupons,
  showCouponsAdd,
};
