const session=require('express-session')
const MongoStore = require('connect-mongo')
function sessionConfig(app){
  app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({
      mongoUrl:process.env.MONGO_URI,
      dbName:'VENICARA',
      collectionName:'sessions',
    }),
    cookies:{
      httpOnly:true,
      secure:false,
      maxAge:1000*60*60*24
    }
  }))
}
module.exports = sessionConfig