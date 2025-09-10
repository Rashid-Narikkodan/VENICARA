const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  isActive:{type:Boolean,default:true},
  isDeleted:{type:Boolean,default:false},
  discount:{type:Number}
},{timestamps:true});

module.exports = mongoose.model('Category', categorySchema);