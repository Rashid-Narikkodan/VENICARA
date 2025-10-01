const bcrypt = require('bcrypt');
const Admin = require('../../models/Admin');
const handleError = require('../../helpers/handleError');

const handleEntry = (req, res) => {
  try {
    return res.redirect('/admin/login');
  } catch (err) {
    handleError(res, "handleEntry", err);
  }
};

// SHOW LOGIN
const showLogin = (req, res) => {
  try {
    return res.render('adminPages/login');
  } catch (err) {
    handleError(res, "showLogin", err);
  }
};

// HANDLE LOGIN
const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      req.flash('error', 'Email and password are required');
      return res.redirect('/admin/login');
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/admin/login');
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/admin/login');
    }

    if (!admin.isActive) {
      req.flash('error', 'Account is not active.');
      return res.redirect('/admin/login');
    }

    req.session.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    };

    req.flash('success', 'Logged in successfully');
    return res.redirect('/admin/dashboard');
  } catch (err) {
    handleError(res, "handleLogin", err);
  }
};

const handleLogout = (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) {
        console.error("Logout error:", err);
        return res.redirect("/admin/dashboard");
      }
      res.clearCookie("admin.sid");
      return res.redirect("/admin/login");
    });
  } catch (err) {
    handleError(res, "handleLogout", err);
  }
};

module.exports = {
  handleEntry,
  showLogin,
  handleLogin,
  handleLogout,
};
