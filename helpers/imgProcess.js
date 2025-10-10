const sharp = require('sharp');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

// Helper function to upload a buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const cld_upload_stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id
          });
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
};

// Main function for processing & uploading images
const processAndUploadImages = async (files, folder = 'products') => {
  // Single file (profile image)
  if (!Array.isArray(files)) {
    folder = 'profiles';
    const file = files;

    const buffer = await sharp(file.buffer)
      .resize(600, 600, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    const result = await uploadToCloudinary(buffer, folder);
    return result; // { url, public_id }
  }

  // Multiple files (product images)
  const results = [];
  for (const file of files) {
    const buffer = await sharp(file.buffer)
      .resize(600, 600, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    const result = await uploadToCloudinary(buffer, folder);
    results.push(result); // push { url, public_id }
  }
  return results;
};

module.exports = processAndUploadImages;
