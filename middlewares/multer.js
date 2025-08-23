const multer=require('multer')
const path=require('path')

const storage=multer.memoryStorage();

const fileFilter=(req,file,callback)=>{
  if(!file.mimetype.startsWith('image/')){
    return callback(new Error('Only images are allowed'),false);
  }
  callback(null,true)
}

const upload=multer({storage,fileFilter,limit:{fileSize:5*1024*1024}})

module.exports = upload