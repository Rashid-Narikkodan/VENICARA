const streamifier=require('streamifier')
const cloudinary = require('../config/cloudinary')
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    let cld_upload_stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
};
module.exports = uploadToCloudinary