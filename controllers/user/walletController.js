const showWallet=async(req,res)=>{
    try{
        res.render('userPages/wallet')
    }catch(er){
        res.status(500).send('from showRefer :-'+er.message)
    }
}
module.exports={
    showWallet,
}