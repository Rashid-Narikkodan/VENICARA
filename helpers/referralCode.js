const User = require("../models/User"); 

async function generateRefCode(name) {
  const prefix = name.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = prefix + random;

  const exists = await User.findOne({ referralCode: code });
  if (exists) {
    return generateRefCode(name);
  }

  return code;
}

module.exports = generateRefCode;
