const User = require('../../models/User');
const handleError = require('../../helpers/handleError');

const showCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    let filter = { isDeleted: false };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const totalPages = Math.ceil(totalUsers / limit);

    return res.render('adminPages/customers', {
      page: 'customers',
      users,
      currentPage: page,
      totalPages,
      limit,
      search,
      count: '0'
    });
  } catch (err) {
    handleError(res, "showCustomers", err);
  }
};

const blockCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/customers');
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    req.flash('success', 'Status updated successfully');
    return res.redirect('/admin/customers');
  } catch (err) {
    handleError(res, "blockCustomer", err);
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/customers');
    }
    user.isDeleted = true;
    await user.save();
    req.flash('success', 'One user removed successfully');
    return res.redirect('/admin/customers');
  } catch (err) {
    handleError(res, "deleteCustomer", err);
  }
};

module.exports = {
  showCustomers,
  blockCustomer,
  deleteCustomer,
};
