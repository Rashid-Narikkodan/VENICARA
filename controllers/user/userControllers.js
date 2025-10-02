const User = require('../../models/User');
const sendEmail = require('../../helpers/sendMail');
const generateOTP = require('../../helpers/generateOTP');
const bcrypt = require('bcrypt');
const processImages = require('../../helpers/imgProcess');
const handleError = require('../../helpers/handleError');

const showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('userPages/profile', { user });
  } catch (err) {
    handleError(res, "showProfile", err);
  }
};

const showEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('userPages/profileEdit', { user });
  } catch (err) {
    handleError(res, "showEditProfile", err);
  }
};

const editProfile = async (req, res) => {
  try {
    const { name, email, phone, gender } = req.body;
    const existingUser = await User.findOne({
      $and: [{ _id: { $ne: req.session.user.id } }, { email }]
    });

    if (existingUser) {
      req.flash('error', 'Email already exists');
      return res.redirect('/profile');
    }

    let photoUrl;
    if (req.file) {
      photoUrl = await processImages(req.file, 'public/upload/profiles');
    }

    const updateData = { name, email, mobile: phone, gender, photoUrl };
    if (email !== req.session.user.email) delete updateData.email;

    await User.findByIdAndUpdate(req.session.user.id, updateData, { new: true });

    if (email !== req.session.user.email) {
      const otp = generateOTP();
      await User.findByIdAndUpdate(req.session.user.id, {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
      });
      sendEmail(email, otp);
      req.flash('success', `New OTP sent to your email: ${email}`);
      return res.render('userPages/newEmailOTP', { email });
    }

    req.flash('success', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'Failed to update profile'+err);
    res.redirect('/profile');
  }
};

const handleNewEmailOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await User.findById(req.session.user.id);

    if (user.otp === otp && user.otpExpiry > Date.now()) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      user.email = email;
      await user.save();
      req.flash('success', 'New email updated');
      return res.redirect('/profile');
    }

    req.flash('error', 'Invalid or expired OTP');
    res.redirect('/profile/edit');
  } catch (err) {
    handleError(res, "handleNewEmailOTP", err);
  }
};

const resendNewEmailOTP = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    sendEmail(req.body.email, otp, user.name);
    res.json({ success: true });
  } catch (err) {
    handleError(res, "resendNewEmailOTP", err);
  }
};

const showProfileVerify = (req, res) => {
  try {
    res.render('userPages/profileVerifyOTP');
  } catch (err) {
    handleError(res, "showProfileVerify", err);
  }
};

const handleProfileVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'User not existing');
      return res.redirect('/profile/verify');
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    sendEmail(email, otp, user.name);
    res.redirect('/profile/OTP');
  } catch (err) {
    handleError(res, "handleProfileVerify", err);
  }
};

const showProfileOTP = (req, res) => {
  try {
    res.render("userPages/profileOTP");
  } catch (err) {
    handleError(res, "showProfileOTP", err);
  }
};

const handleProfileOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.session.user.id);

    if (user.otp !== otp) {
      req.flash('error', 'OTP does not match');
      return res.redirect('/profile/OTP');
    }
    if (user.otpExpiry < Date.now()) {
      req.flash('error', 'OTP expired');
      return res.redirect('/profile/OTP');
    }

    req.flash('success', 'OTP verified');
    res.redirect("/profile/changePassword");
  } catch (err) {
    handleError(res, "handleProfileOTP", err);
  }
};

const resendProfileOTP = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    sendEmail(user.email, otp, user.name);
    res.json({ success: true });
  } catch (err) {
    handleError(res, "resendProfileOTP", err);
  }
};

const showProfileChangePass = (req, res) => {
  try {
    res.render("userPages/ProfileChangePass");
  } catch (err) {
    handleError(res, "showProfileChangePass", err);
  }
};

const handleProfileChangePass = async (req, res) => {
  try {
    const { oldPassword, password, confirmPassword } = req.body;

    const user = await User.findById(req.session.user.id)

     const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) {
          req.flash('error', 'Incorrect old password')
          return res.redirect('/profile/changePassword')
        }

    if (password !== confirmPassword) {
      req.flash('error', 'Confirm password did not match');
      return res.redirect('/profile/changePassword');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(req.session.user.id, { password: passwordHash });

    req.flash('success', 'Password updated');
    res.redirect("/profile");
  } catch (err) {
    handleError(res, "handleProfileChangePass", err);
  }
};

const showDeleteAc = (req, res) => {
  try {
    res.render('userPages/deleteAc');
  } catch (err) {
    handleError(res, "showDeleteAc", err);
  }
};

const handleDeleteAc = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.session.user.id, { isDeleted: true });
    req.flash('success', 'Account deleted');
    res.redirect('/');
  } catch (err) {
    handleError(res, "handleDeleteAc", err);
  }
};

module.exports = {
  showProfile,
  showEditProfile,
  editProfile,
  handleNewEmailOTP,
  resendNewEmailOTP,
  showProfileVerify,
  handleProfileVerify,
  showProfileOTP,
  handleProfileOTP,
  resendProfileOTP,
  showProfileChangePass,
  handleProfileChangePass,
  showDeleteAc,
  handleDeleteAc,
};
