require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../models/userSchema.js')
const generateOTP = require('../helpers/generateOTP.js')
const sendEmail = require('../helpers/sendMail.js')
const generateRefCode = require('../helpers/referralCode.js')

// ============================
// Landing Page
// ============================
const landingPage = async (req, res) => {
  try {
    return res.render('userPages/landing')
  } catch (err) {
    console.log(err.message)
    res.status(500).send(err.message)
  }
}

// ============================
// Login
// ============================
const showLogin = (req, res) => {
  try {
    res.render('userPages/login')
  } catch (err) {
    res.status(500).send('internal error in showLogin: ' + err.message)
  }
}

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    // Validation
    if (!email || !password) {
      req.flash('error', 'Email and Password is required')
      return res.redirect('/login')
    }

    if (!user) {
      req.flash('error', 'Incorrect Email or Password')
      return res.redirect('/login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      req.flash('error', 'Incorrect Email or Password')
      return res.redirect('/login')
    }

    if (!user.isVerified) {
      req.flash('error', 'Verify before login (OTP)')
      return res.redirect('/login')
    }

    // Initialize session
    req.session.user = {
      id: user._id,
      isVerified: user.isVerified
    }
    return res.redirect('/home')
  } catch (err) {
    res.send('from handleLogin: ' + err.message)
  }
}

const handleGoogleAuth=(req,res)=>{
  try{
    req.session.user={
      id:req.user._id,
      isVerified:true
    }
    req.flash('success','Logged in successfully with Google')
    res.redirect('/home')
  }catch(er){
    res.status(500).send('Internal server issue in handleGoogleAuth - '+er.message)
  }
}

const showForgot = (req, res) => {
  try {
    return res.render('userPages/forgot')
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const handleForgot = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      req.flash('error', 'User not existing')
      return res.redirect('/forgot')
    }
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
    user.otp = otp
    user.otpExpiry = otpExpiry
    user.save()
    sendEmail(email, otp, user.name)
    req.session.userId = user._id
    return res.redirect('/forgotOTP')
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const showForgotOTP = (req, res) => {
  try {
    return res.render('userPages/forgotOTP')
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const handleForgotOTP = async (req, res) => {
  try {
    const { otp } = req.body
    const user = await User.findOne({ _id: req.session.userId })
    if (user.otp == otp && user.otpExpiry > Date.now()) {
      user.isVerified = true
      user.otp = null
      user.otpExpiry = null
      await user.save()
      return res.redirect('/forgot/changePass')

    } else {
      req.flash('error', 'invalid or expired OTP')
      return res.redirect('/forgotOTP')
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const resendForgotOTP = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userId })
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    sendEmail(user.email, otp, user.name)
    return res.json({ success: true })
  } catch (er) {
    res.status(500).send(err.message)
  }
}

const showChangePass = (req, res) => {
  try {
    return res.render('userPages/changePass')
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const handleChangePass = async (req, res) => {
  try {

    const user = await User.findOne({ _id: req.session.userId })
    const { password, confirmPassword } = req.body
    if (!user) {
      req.flash('error', 'user not found')
      return res.redirect('/forgot/changePass')
    }
    if (password !== confirmPassword) {
      req.flash('error', 'Confirm password is nt matching')
      return res.redirect('/forgot/changePass')
    }
    const hashed = await bcrypt.hash(password, 10)
    user.password = hashed
    user.save()
    req.flash('success', 'new password updated')
    req.session.destroy((err) => {
      if (err) throw new Error(err)
      res.clearCookie('connect.sid')
      return res.redirect('/login')
    })
  } catch (err) {
    res.status(500).send(err.message)
  }
}



// ============================
// Signup
// ============================
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
        req.flash('error', 'User already exists')
        return res.redirect('/signup')
      } else {
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
          req.flash('error', 'invalid credentials')
          return res.redirect('/signup')
        }

        user.otp = generateOTP()
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
        await user.save()

        req.session.userId = user._id
        sendEmail(email, user.otp, name)

        req.flash('success', `OTP sent to your email: ${email}`)
        return res.redirect('/signup/verify-otp')
      }
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Confirm password does not match')
      return res.redirect('/signup')
    }

    if (refCode !== '') {
      const code = await User.findOne({ referralCode: refCode })
      if (!code) {
        req.flash('error', 'invalid referral code')
        return res.redirect('/signup')
      }
    }

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
    const hashedPass = await bcrypt.hash(password, 10)
    const referralCode = generateRefCode(name)

    const newUser = new User({
      name,
      email,
      password: hashedPass,
      referralCode,
      otp,
      otpExpiry
    })

    await newUser.save()

    req.session.userId = newUser._id
    sendEmail(email, otp, name)

    req.flash('success', `OTP sent to your email: ${email}`)
    return res.redirect('/signup/verify-otp')
  } catch (err) {
    res.status(500).send('internal server error - ' + err.message)
  }
}

// ============================
// OTP Verification
// ============================
const showSignupOTP = async (req, res) => {
  try {
    res.render('userPages/verify-otp')
  } catch (err) {
    res.status(500).send('internal server error: ' + err.message)
  }
}

const handleSignupOTP = async (req, res) => {
  try {
    const { otp } = req.body
    const user = await User.findOne({ _id: req.session.userId })

    if (!user) {
      req.flash('error', 'user not found')
      return res.redirect('/signup')
    }

    if (user.otp == otp && user.otpExpiry > Date.now()) {
      user.isVerified = true
      user.otp = null
      user.otpExpiry = null
      await user.save()

      req.session.destroy((er) => {   // destroy session after flash is saved
      if (err) console.log(err)
          res.clearCookie('connect.sid')
          res.redirect('/login')
        })

    } else {
      req.flash('error', 'invalid or expired OTP')
      return res.redirect('/signup/verify-otp')
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const resendOTP = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userId })

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    sendEmail(user.email, otp, user.name)
    return res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false })
  }
}

// ============================
// Home
// ============================
const showHome = (req, res) => {
  try {
    return res.render('userPages/home')
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const handleLogout=('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(err => {
      if (err) {
        console.log(err);
        return res.status(500).redirect('/');
      }
      res.clearCookie('connect.sid');
      res.redirect('/'); 
    });
  });
});

// ============================
// Module Exports
// ============================
module.exports = {
  landingPage,

  showLogin,
  handleLogin,
  handleGoogleAuth,

  showForgot,
  handleForgot,
  showForgotOTP,
  handleForgotOTP,
  resendForgotOTP,
  showChangePass,
  handleChangePass,

  showSignup,
  handleSignup,
  showSignupOTP,
  handleSignupOTP,
  resendOTP,

  showHome,
  handleLogout,
}
