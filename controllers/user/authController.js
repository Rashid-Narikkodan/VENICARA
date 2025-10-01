const bcrypt = require('bcrypt')
const User = require('../../models/User.js')
const generateOTP = require('../../helpers/generateOTP.js')
const sendEmail = require('../../helpers/sendMail.js')
const generateRefCode = require('../../helpers/referralCode.js')
const { nanoid } = require('nanoid')
const handleError = require('../../helpers/handleError.js')
const Referrals = require('../../models/Referrals.js')
const Wallet = require('../../models/Wallet.js')
const WalletTransaction = require('../../models/WalletTransaction.js')



const showLogin = (req, res) => {
  try {
    res.render('userPages/login')
  } catch (err) {
    handleError(res, 'showLogin', err)
  }
}

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    // Validation
    if (!email || !password) {
      req.flash('error', 'Email and Password is required')
      return res.redirect('/auth/login')
    }
    if (!user) {
      req.flash('error', 'Incorrect Email or Password')
      return res.redirect('/auth/login')
    }
    if (user.isBlocked) {
      req.flash('error', 'Access denied')
      return res.redirect('/auth/login')
    }
    if (user.isDeleted) {
      req.flash('error', 'User not exist')
      return res.redirect('/auth/login')
    }
    if (!user.password) {
      req.flash('error', 'Incorrect Email or Password')
      return res.redirect('/auth/login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      req.flash('error', 'Incorrect Email or Password')
      return res.redirect('/auth/login')
    }

    if (!user.isVerified) {
      req.flash('error', 'Verify before login (OTP)')
      return res.redirect('/auth/login')
    }

    // Initialize session
    req.session.user = {
      id: user._id,
      email:user.email,
      isVerified: user.isVerified,
      isDeleted: user.isDeleted,
      isBlocked: user.isBlocked,
      referralCode: user.referralCode,
    }
    req.flash('success', 'Logged in successfully')
    return res.redirect('/home')
  } catch (err) {
    handleError(res, 'handleLogin', err)
  }
}

// Google OAuth
const handleGoogleAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (user.isBlocked) {
      req.flash('error', 'This account is blocked')
      return res.redirect('/auth/login')
    }
    if (user.isDeleted) {
      user.isDeleted = false
      user.isBlocked = false
    }
    if (!user.referralCode) {
      user.referralCode = await generateRefCode(user.name)
      await user.save()
    }
    if (!user.userId) {
      user.userId = `USR-${nanoid(6).toUpperCase()}`
      await user.save()
    }
    req.session.user = {
      id: req.user._id,
      email:req.user.emaail,
      isVerified: user.isVerified,
      isDeleted: user.isDeleted,
      isBlocked: user.isBlocked,
      referralCode: user.referralCode,
    }

    
    const wallet=await Wallet.find({userId:req.user._id})
    if(!wallet) await Wallet.create({userId:req.user._id})

    req.flash('success', 'Logged in successfully with Google')
    return res.redirect('/home')
  } catch (err) {
    handleError(res, 'handleGoogleAuth', err)
  }
}

const showForgot = (req, res) => {
  try {
    return res.render('userPages/forgot')
  } catch (err) {
    handleError(res, 'showForgot', err)
  }
}

const handleForgot = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      req.flash('error', 'User not existing')
      return res.redirect('/auth/forgot')
    }
    if (user.isDeleted) {
      req.flash('error', 'User not exist')
      return res.redirect('/auth/forgot')
    }
    if (user.isBlocked) {
      req.flash('error', 'This account is blocked')
      return res.redirect('/auth/forgot')
    }
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
    user.otp = otp
    user.otpExpiry = otpExpiry
    user.save()
    sendEmail(email, otp, user.name)
    req.session.userId = user._id
    return res.redirect('/auth/forgot/otp')
  } catch (err) {
    handleError(res, 'handleForgot', err)
  }
}

const showForgotOTP = (req, res) => {
  try {
    return res.render('userPages/forgotOTP')
  } catch (err) {
    handleError(res, 'showForgotOTP', err)
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
      return res.redirect('/auth/forgot/change-password')
    } else {
      req.flash('error', 'invalid or expired OTP')
      return res.redirect('/auth/forgot/otp')
    }
  } catch (err) {
    handleError(res, 'handleForgotOTP', err)
  }
}

const resendForgotOTP = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.useId })
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    sendEmail(user.email, otp, user.name)
    return res.json({ success: true })
  } catch (err) {
    handleError(res, 'resendForgotOTP', err)
  }
}

const showChangePass = (req, res) => {
  try {
    return res.render('userPages/changePass')
  } catch (err) {
    handleError(res, 'showChangePass', err)
  }
}

const handleChangePass = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userId })
    const { password, confirmPassword } = req.body
    if (!user) {
      req.flash('error', 'user not found')
      return res.redirect('/auth/forgot/changePass')
    }
    if (password !== confirmPassword) {
      req.flash('error', 'Confirm password is nt matching')
      return res.redirect('/auth/forgot/changePass')
    }
    const hashed = await bcrypt.hash(password, 10)
    user.password = hashed
    user.save()
    req.flash('success', 'new password updated')
    return res.redirect('/auth/login')
  } catch (err) {
    handleError(res, 'handleChangePass', err)
  }
}
const showSignup = (req, res) => {
  try {
    res.render('userPages/signup')
  } catch (err) {
    handleError(res, 'showSignup', err)
  }
}

const handleSignup = async (req, res) => {
  const { name, email, password, confirmPassword, refCode } = req.body

  try {
    const user = await User.findOne({ email })
    if (user) {
      if (user.isDeleted) {
        user.isDeleted = false
        user.isVerified = false
          if (password == confirmPassword) {
            user.password = await bcrypt.hash(password, 10)
          } else {
            req.flash('error', 'Confirm password does not match')
            return res.redirect('/auth/signup')
          }
          await user.save()
        if (user.isBlocked) {
          req.flash('error', 'Access denied')
          return res.redirect('/auth/signup')
        }
      }
      if (user.isVerified) {
        req.flash('error', 'User already exists')
        return res.redirect('/auth/signup')
      } else {
        user.otp = generateOTP()
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
        await user.save()
        req.session.userId = user._id
        sendEmail(email, user.otp, name)
        req.flash('success', `OTP sent to your email: ${email}`)
        return res.redirect('/auth/signup/verify-otp')
      }
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Confirm password does not match')
      return res.redirect('/auth/signup')
    }

    let refUser='';
    if (refCode !== '') {
      refUser = await User.findOne({ referralCode: refCode })
      if (!refUser) {
        req.flash('error', 'invalid referral code')
        return res.redirect('/auth/signup')
      }
    }

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
    const hashedPass = await bcrypt.hash(password, 10)
    const referralCode =await generateRefCode(name)
    const userId = `USR-${nanoid(6).toUpperCase()}`
    const newUser = new User({
      name,
      email,
      userId,
      password: hashedPass,
      referralCode,
      referredBy: refUser._id || null,
      otp,
      otpExpiry
    })

    await newUser.save()

    req.session.userId = newUser._id
    sendEmail(email, otp, name)

    const wallet=await Wallet.find({userId:newUser._id})
    if(!wallet) await Wallet.create({userId:newUser._id})

      if (refCode !== '') {
      const user = await User.findOne({ referralCode: refCode })
      await Referrals.create({
        referrerUserId:user._id,
        referredUserId:newUser._id,
        referralCodeUsed:refCode,
        amount:200,
        status:'pending',
      })
    }

    req.flash('success', `OTP sent to your email: ${email}`)
    return res.redirect('/auth/signup/verify-otp')
  } catch (err) {
    handleError(res, 'handleSignup', err)
  }
}

const showSignupOTP = async (req, res) => {
  try {
    res.render('userPages/verify-otp')
  } catch (err) {
    handleError(res, 'showSignupOTP', err)
  }
}

const handleSignupOTP = async (req, res) => {
  try {
    const { otp } = req.body
    const user = await User.findOne({ _id: req.session.userId })

    if (!user) {
      req.flash('error', 'user not found')
      return res.redirect('/auth/signup')
    }

    if (user.otp == otp && user.otpExpiry > Date.now()) {
      user.isVerified = true
      user.otp = null
      user.otpExpiry = null
      await user.save()

      req.flash('success', 'new User Registered successfully')
      res.redirect('/auth/login')
    } else {
      req.flash('error', 'invalid or expired OTP')
      return res.redirect('/auth/signup/verify-otp')
    }
  } catch (err) {
    handleError(res, 'handleSignupOTP', err)
  }
}
                              
const resendOTP = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userId })

    const otp = await generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    sendEmail(user.email, otp, user.name)
    return res.json({ success: true })
  } catch (err) {
    handleError(res, 'resendOTP', err)
  }
}

const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return handleError(res, 'handleLogout', err);
    }

    res.clearCookie('user.sid', {
      path: '/',                // match your cookie path
      httpOnly: true,           // same as set in session config
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'           // or 'strict' if admin
    });

    return res.redirect('/');
  });
};


module.exports = {
  showLogin,
  handleLogin,
  handleGoogleAuth,//entry by create

  showForgot,
  handleForgot,
  showForgotOTP,
  handleForgotOTP,
  resendForgotOTP,
  showChangePass,
  handleChangePass,

  showSignup,
  handleSignup,//entry by create
  showSignupOTP,
  handleSignupOTP,
  resendOTP,
  handleLogout,//exit
}
