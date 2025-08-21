const fs = require('fs-extra');
const sharp = require('sharp');
const path = require('path');
const cloudinary = require('../config/cloudinary');

async function uploadImagesToCloudinary(files) {
  const uploadedUrls = [];

  for (const file of files) {
    const processedPath = path.join(__dirname, '../temp', `resized-${file.filename}`);

    // Resize with Sharp
    await sharp(file.path)
      .resize(600, 600, { fit: 'cover' })
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toFile(processedPath);

    // Optional: short delay to let Windows release file lock
    await new Promise(resolve => setTimeout(resolve, 50));

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(processedPath, {
      folder: 'perfumes',
      use_filename: true,
      unique_filename: true
    });
    uploadedUrls.push(result.secure_url);

    // Delete files safely
    await fs.remove(processedPath);
    await fs.remove(file.path);
  }

  return uploadedUrls;
}

module.exports = { uploadImagesToCloudinary };
