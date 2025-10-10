const cloudinary = require("cloudinary").v2;

cloudinary.config(); // automatically reads CLOUDINARY_URL from process.env
module.exports = cloudinary;
