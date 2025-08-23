
const User=require('../../models/User')

const showCustomers=async(req,res)=>{
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const totalUsers = await User.countDocuments();

    const users = await User.find({isDeleted:false})
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({createdAt:-1})
      .lean();

    const totalPages = Math.ceil(totalUsers / limit);

    return res.render('adminPages/customers', {
      page: 'customers',
      users,
      currentPage: page,
      totalPages,
      limit,
      count: '0'
    });
  } catch (err) {
    res.status(500).send('Error in users list page: ' + err.message);
  }
}

const blockCustomer=async(req,res)=>{
  try {
    const id=req.params.id
    const user=await User.findById(id)
    if(!user){
      req.flash('error','user not found')
      return res.redirect('/admin/customers')
    }
    user.isBlocked=!user.isBlocked
    await user.save()
    req.flash('success','status updated successfully')
    return res.redirect(`/admin/customers`)
  } catch (er) {
    res.status(500).send(er.message)
  }
}

const deleteCustomer=async(req,res)=>{
  try {
    const user=await User.findById(req.params.id)
    user.isDeleted=true
    await user.save()
    req.flash('success','One user removed successfully')
    return res.redirect('/admin/customers')
  } catch (er) {
    res.status(500).send('delete customer '+er.message)
  }
}
module.exports = {
  showCustomers,
  blockCustomer,
  deleteCustomer,
}