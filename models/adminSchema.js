const mongoose=require('mongoose')
const {Schema}=mongoose
const adminSchema=new Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  role:{
    type:String,
    enum:['admin',"superAdmin"],
    default: 'admin'
  },
  isActive:{
    type:Boolean,
    default:false
  }
},{timestamps:true})
module.exports = mongoose.model('Admin',adminSchema)