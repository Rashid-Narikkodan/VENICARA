const mongoose=require('mongoose')
const {Schema} = mongoose

const userSchema=new Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  },
  password:{
    type:String,
    required:false
  },
  userId:{
    type:String,
    unique:true
  },
  mobile:{
    type:String,
    required:false,
    default:null
  },
  photoUrl:{
    type:String,
    default:''
  },
  googleId:{
    type:String,
    unique:true,
    sparse:true
  },
  gender:{
    type:String,
    enum:['male','female','other']
  },
  isBlocked:{
    type:Boolean,
    default:false
  },
  referralCode:{
    type:String,
    unique:true,
    index:true,
  },
  referredBy:{
    type:String,
    default:null
  },
  otp:{
    type:String,
  },
  otpExpiry:{
    type:Date,
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  isDeleted:{
    type:Boolean,
    default:false
  }
},{timestamps:true})

module.exports = mongoose.model('User',userSchema)