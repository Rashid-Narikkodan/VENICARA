require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../models/userSchema.js')
const generateOTP = require('../helpers/generateOTP.js')
const transporter=require('../config/mailer.js')
const { findOne } = require('../models/adminSchema.js')

const landingPage = async (req, res) => {
  try {
    return res.render('userPages/landing')
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message)
  }
}

const showLogin = (req, res) => {
  res.send(login)
}
const handleLogin = (req, res) => {
  res.send('handleLogin')
}



const showSignup = (req, res) => {
  try {
    res.render('userPages/signup')
  } catch (err) {
    res.status(500).send('server side error')
  }
}
const handleSignup = async (req, res) => {
  const { name, email, password, confirmPassword, refCode } = req.body
  try {
    const user = await User.findOne({ email })
    if (user) {
      if (user.isVerified) {
        req.flash('error', 'email already existing')
        return res.redirect('/signup')
      } else {
        user.otp = generateOTP()
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
        await user.save()

        await transporter.sendMail({
  from: `"VENICARA" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Your OTP for Signup",
  text: `Hello ${name},\n\nYour OTP is ${user.otp}. It is valid for 5 minutes.\nDo not share it with anyone.`,
  html: `<p>Hello <b>${name}</b>,</p><p>Your OTP is <b>${user.otp}</b>. It is valid for <b>5 minutes</b>.</p>`
});
        req.flash('success', `OTP send to your email : ${email}`)
        return res.redirect('/signup/verify-otp')
      }
    }
    if (refCode !== '') {
      const code = User.findOne({ refferalCode: refCode })
      if (!code) {
        req.flash('error', 'invalid refferal code')
        return res.redirect('/signup')
      }
    }
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
    const hashedPass = await bcrypt.hash(password, 10)
    const newUser = new User({
      name,
      email,
      password: hashedPass,
      otp,
      otpExpiry
    })
    await newUser.save()
    await transporter.sendMail({
  from: `"MyApp Team" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Your OTP for Signup",
  text: `Hello ${name},\n\nYour OTP is ${otp}. It is valid for 5 minutes.\nDo not share it with anyone.`,
  html: `<p>Hello <b>${name}</b>,</p><p>Your OTP is <b>${otp}</b>. It is valid for <b>5 minutes</b>.</p>`
});

    req.flash('success', `OTP send to your email : ${email}`)
    return res.redirect('/signup/verify-otp')
  } catch (er) {
    res.status(500).send('internal server error - ' + er.message)
  }
}


const showSignupOTP = (req, res) => {
  try {
    res.render('userPages/verify-otp')
  } catch (er) {
    res.status(500).send('internal server error' + er.message)
  }
}
const handleSignupOTP =async(req, res) => {
  try {
    const {otp}=req.body
    const user=await User.findOne({})
    res.send('handleOTP')
  } catch (er) {
    res.status(500).send(er.message)
  }
}
const resendOTP=()=>{

}

const homePage = (req, res) => {
  try {
    return res.render('userPages/home')
  } catch (error) {
    res.status(500).send(error.message)
  }
}


//


module.exports = {
  landingPage,
  showLogin,
  handleLogin,
  showSignup,
  handleSignup,
  showSignupOTP,
  resendOTP,
  handleSignupOTP,
  homePage,
}