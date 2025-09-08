const nodemailer=require('nodemailer')
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS  // app password, not Gmail password
  }
});
module.exports = transporter