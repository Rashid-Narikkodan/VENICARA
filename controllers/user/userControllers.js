const User = require('../../models/User');
const sendEmail = require('../../helpers/sendMail');
const generateOTP = require('../../helpers/generateOTP');
const bcrypt=require('bcrypt')
const processImages=require('../../helpers/imgProcess')

const showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('userPages/profile', { user });
  } catch (err) {
    console.error('error from showProfile :-', err.message);
    res.status(500).send('error from showProfile :- ' + err.message);
  }
};
const showEditProfile=async(req,res)=>{
    try {
    const user = await User.findById(req.session.user.id);
    res.render('userPages/profileEdit', { user });
  } catch (err) {
    console.error('error from showProfile :-', err.message);
    res.status(500).send('error from showProfile :- ' + err.message);
  }
}
const editProfile = async (req, res) => {
  try {
    const { name, email, phone, gender } = req.body;
    const user = await User.findOne({
      $and: [
        { _id: { $ne: req.session.user.id } },
        { email: email },
      ]
    });

    if (user) {
      req.flash('error', 'Email already exists');
      return res.redirect('/profile');
    }
    let photoUrl;
    if(req.file){
      photoUrl=await processImages(req.file,'public/upload/profiles')
    }
    
    const updateData = { name, email, mobile: phone, gender, photoUrl };
    if(email!=req.user.email){
      delete updateData['email']
    }
    await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    if(email!=req.user.email){
      const otp=generateOTP()
      await User.findByIdAndUpdate(req.user._id,{otp,otpExpiry:new Date(Date.now()+1000*60*5)},{new: true})
      sendEmail(email, otp)
      req.flash('success',`new OTP send to your email :- ${email}`)
      return res.render('userPages/newEmailOTP',{email})
    }    
    req.flash('success', 'Profile updated successfully');
    return res.redirect('/profile');
  } catch (err) {
    console.error('error from editProfile :-', err.message);
    req.flash('error', 'Failed to update profile');
    return res.redirect('/profile');
  }
};

const handleNewEmailOTP=async(req,res)=>{
  try{
        const { otp ,email} = req.body
        const user = await User.findOne({ _id: req.user._id })
     if (user.otp == otp && user.otpExpiry > Date.now()) {
      user.isVerified = true
      user.otp = null
      user.otpExpiry = null
      user.email = email
      await user.save()
      req.flash('success','new email updated')
      return res.redirect('/profile')
    } else {
      req.flash('error', 'invalid or expired OTP')
      return res.redirect('/profile/edit')
    }
  }catch(error){

  }
}

const showProfileVerify = (req, res) => {
  try {
    return res.render('userPages/profileVerifyOTP');
  } catch (err) {
    console.error('error from showProfileVerify :-', err.message);
    return res.status(500).send('error from showProfileVerify :- ' + err.message);
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
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    sendEmail(email, otp, user.name);
    return res.redirect('/profile/OTP');
  } catch (err) {
    console.error('error from handleProfileVerify :-', err.message);
    res.status(500).send('error from handleProfileVerify :- ' + err.message);
  }
};

const showProfileOTP = async (req, res) => {
  try {
    return res.render("userPages/profileOTP");
  } catch (err) {
    console.error('error from showProfileOTP :-', err.message);
    res.status(500).send('error from showProfileOTP :- ' + err.message);
  }
};

const handleProfileOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log("OTP submitted:", otp);
    const user=await User.findOne({_id:req.session.user.id})
    if(user.otp!=otp){
      req.flash('error','OTP do not match')
      res.redirect('/profile/OTP')
    }
    if(user.otpExpiry<Date.now()){
      req.flash('error','OTP expired')
      res.redirect('/profile/OTP')
    }
    req.flash('success','OTP verified')
    res.redirect("/profile/changePassword");
  } catch (err) {
    console.error('error from handleProfileOTP :-', err.message);
    res.status(500).send('error from handleProfileOTP :- ' + err.message);
  }
};

const resendProfileOTP = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.user.id })
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    sendEmail(user.email, otp, user.name)
    return res.json({ success: true })
  } catch (er) {
    res.status(500).send(er.message)
  }
}

const showProfileChangePass = async (req, res) => {
  try {
    res.render("userPages/ProfileChangePass");
  } catch (err) {
    console.error('error from showProfileChangePass :-', err.message);
    res.status(500).send('error from showProfileChangePass :- ' + err.message);
  }
};

const handleProfileChangePass = async (req, res) => {
  try {
    const {password, confirmPassword } = req.body;
    if(password!=confirmPassword){
      req.flash('error','Confirm password did not match')
      res.redirect('/profile/changePassword')
    }
    const passwordHash=await bcrypt.hash(password,10)
    await User.findByIdAndUpdate(req.session.user.id,{password:passwordHash})
    req.flash('success','Password updated')
    return res.redirect("/profile");
  } catch (err) {
    console.error('error from handleProfileChangePass :-', err.message);
    res.status(500).send('error from handleProfileChangePass :- ' + err.message);
  }
};

const showDeleteAc=(req,res)=>{
  try{
    res.render('userPages/deleteAc')

  }catch(er){
    console.error('error from showDelete :-', err.message);
    res.status(500).send('error from showDelete :- ' + err.message);
  }
}
const handleDeleteAc=async(req,res)=>{
    try{
      await User.findByIdAndUpdate(req.session.user.id, {isDeleted:true})
    }catch(er){
    console.error('error from handleDelete :-', err.message);
    res.status(500).send('error from handleDelete :- ' + err.message);
  }
}
module.exports = {
  showProfile,
  showEditProfile,
  editProfile,
  handleNewEmailOTP,
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
