function refCode(name) {
  const prefix = name.substring(0, 3).toUpperCase();  // First 3 letters of name
  const random = Math.random().toString(36).substring(2, 6).toUpperCase(); 
  return prefix + random;
}

// Example: "RAS9XK2"
module.exports = refCode