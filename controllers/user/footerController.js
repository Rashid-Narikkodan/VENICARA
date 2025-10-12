const handleError = require('../../helpers/handleError')

const privacyPolicy=(req,res)=>{
    try{
        res.render('userPages/privacyPolicy.ejs')
    }catch(error){
        handleError(res,'privacyPolicy',error)
    }
}
const returnPolicy=(req,res)=>{
    try{
        res.render('userPages/returnPolicy.ejs')
    }catch(error){
        handleError(res,'returnPolicy',error)
    }
}
const termsConditions=(req,res)=>{
    try{
        res.render('userPages/termsConditions.ejs')
    }catch(error){
        handleError(res,'termsConditions',error)
    }
}
const cookiePolicy=(req,res)=>{
    try{
        res.render('userPages/cookiePolicy.ejs')
    }catch(error){
        handleError(res,'cookiePolicy',error)
    }
}

module.exports = {
    privacyPolicy,
    returnPolicy,
    termsConditions,
    cookiePolicy,
}