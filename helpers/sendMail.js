const transporter=require('../config/mailer')
const sendEmail=async(to,otp,name)=>{
  await transporter.sendMail({
  from: `"VENICARA" <${process.env.EMAIL_USER}>`,
  to,
  subject: "Your OTP for Signup",
  text: `Hello ${name},\n\nYour OTP is ${otp}. It is valid for 5 minutes.\nDo not share it with anyone.`,
  html: `<p>Hello <b>${name}</b>,</p><p>Your OTP is <b>${otp}</b>. It is valid for <b>5 minutes</b>.</p>`
})
console.log(to+' '+otp+' '+name)
}
module.exports = sendEmail