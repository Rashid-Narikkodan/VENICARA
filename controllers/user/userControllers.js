const User = require("../../models/User");
const sendEmail = require("../../helpers/sendMail");
const generateOTP = require("../../helpers/generateOTP");
const bcrypt = require("bcrypt");
const processImages = require("../../helpers/imgProcess");
const handleError = require("../../helpers/handleError");
const cloudinary = require("../../config/cloudinary");

const showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render("userPages/profile", { user });
  } catch (err) {
    handleError(res, "showProfile", err);
  }
};

const showEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render("userPages/profileEdit", { user });
  } catch (err) {
    handleError(res, "showEditProfile", err);
  }
};

const editProfile = async (req, res) => {
  try {
    const { name, email, phone, gender } = req.body;
    const existingUser = await User.findOne({
      $and: [{ _id: { $ne: req.session.user.id } }, { email }],
    });

    if (existingUser) {
      req.flash("error", "Email already exists");
      return res.redirect("/profile");
    }
    
    const user = await User.findById(req.session.user.id);
    let photoUrl = user.photoUrl;
    let public_id = user.public_id;
    if (req.file) {
      const result = await processImages(req.file, "profiles");
      photoUrl = result.url
      public_id = result.public_id
    }


    const updateData = {
      name,
      email,
      mobile: phone,
      gender,
      photoUrl,
      public_id,
    };
    if (email !== user.email) delete updateData.email;

    await User.findByIdAndUpdate(req.session.user.id, updateData, {
      new: true,
    });
    if (email !== user.email) {
      const otp = generateOTP();
      await User.findByIdAndUpdate(req.session.user.id, {
        otp,
        otpExpiry: new Date(Date.now() + 50 * 1000),
      });
      sendEmail(email, otp);
      req.flash("success", `New OTP sent to your email: ${email}`);
      return res.render("userPages/newEmailOTP", { email });
    }

    req.flash("success", "Profile updated successfully");
    res.redirect("/profile");
  } catch (err) {
    console.log(err)
    req.flash("error", "Failed to update profile" + err);
    res.redirect("/profile");
  }
};

const deleteProfile= async (req,res)=>{
  try{
    const {public_id} = req.body
    const user = await User.findById(req.session.user.id)
    user.photoUrl = ''
    user.public_id = ''
    user.save()
    if(public_id) await cloudinary.uploader.destroy(public_id);
    res.status(200).json({status:true,message:'Profile picture removed'})
  }catch(error){
    res.status(500).json({status:false,message:'server error'})
  }
}

const handleNewEmailOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await User.findById(req.session.user.id);

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.render("userPages/newEmailOTP", {
        email,
        messages: { error: ["Invalid or expired OTP"] },
      });
    }
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.email = email;
    await user.save();
    req.flash("success", "New email updated");
    return res.redirect("/profile");
  } catch (err) {
    handleError(res, "handleNewEmailOTP", err);
  }
};

const resendNewEmailOTP = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 50 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    sendEmail(req.body.email, otp, user.name);
    res.json({ success: true });
  } catch (err) {
    handleError(res, "resendNewEmailOTP", err);
  }
};

const showProfileChangePass = (req, res) => {
  try {
    res.render("userPages/profileChangePass");
  } catch (err) {
    handleError(res, "showProfileChangePass", err);
  }
};

const handleProfileChangePass = async (req, res) => {
  try {
    const { oldPassword, password, confirmPassword } = req.body;

    const user = await User.findById(req.session.user.id);

    if (!user.password) {
      req.flash("error", "Google Authenticated accounts can't change password");
      return res.redirect("/profile/changePassword");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      req.flash("error", "Incorrect old password");
      return res.redirect("/profile/changePassword");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Confirm password did not match");
      return res.redirect("/profile/changePassword");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(req.session.user.id, {
      password: passwordHash,
    });

    req.flash("success", "Password updated");
    res.redirect("/profile");
  } catch (err) {
    handleError(res, "handleProfileChangePass", err);
  }
};

const showDeleteAc = (req, res) => {
  try {
    res.render("userPages/deleteAc");
  } catch (err) {
    handleError(res, "showDeleteAc", err);
  }
};

const handleDeleteAc = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.session.user.id, { isDeleted: true });
    req.flash("success", "Account deleted");
    res.redirect("/");
  } catch (err) {
    handleError(res, "handleDeleteAc", err);
  }
};

module.exports = {
  showProfile,
  showEditProfile,
  editProfile,
  deleteProfile,
  handleNewEmailOTP,
  resendNewEmailOTP,
  showProfileChangePass,
  handleProfileChangePass,
  showDeleteAc,
  handleDeleteAc,
};
