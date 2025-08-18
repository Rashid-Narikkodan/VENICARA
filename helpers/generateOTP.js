module.exports = function generateOTP(){
  console.log('generating otp')
  return Math.floor(100000 + Math.random() * 900000).toString();
}
