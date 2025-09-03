const showReferEarn=async(req,res)=>{
    try{
        res.render('userPages/refer')
    }catch(er){
        res.status(500).send('from showRefer :-'+er.message)
    }
}
module.exports={
    showReferEarn
}