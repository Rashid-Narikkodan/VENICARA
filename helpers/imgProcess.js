const sharp=require('sharp')
const path=require('path')
const fs=require('fs')

const processImages= async (files,folder='public/upload/products') => {
  const imagePaths=[]
  if(!fs.existsSync(folder)) fs.mkdirSync(folder,{recursive:true});
  for(const file of files){
    const filename=`product-${Date.now()}-${file.originalname}`
    const filepath=path.join(folder,filename)
    await sharp(file.buffer).resize(600,600,{fit:'cover'}).webp({quality:80}).toFile(filepath)
    imagePaths.push(`/upload/products/${filename}`)
  }
  return imagePaths
}
module.exports = processImages