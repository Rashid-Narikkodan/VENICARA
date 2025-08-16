require("dotenv").config()
const express=require("express")
const app=express()
const db=require('./config/db')
const path=require('path')
const userRoutes=require('./routes/userRoutes')
const adminRoutes=require('./routes/adminRoutes')
const sessionConfig=require('./middlewares/session')

//settings
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.locals.title=process.env.TITLE
//session
sessionConfig(app)

//built in middlwares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))

//routers
app.use('/',userRoutes)
app.use('/admin',adminRoutes)

app.use((req,res,next)=>{
  res.status(404).render('userPages/pageNotFound')
})
//app.listen to start server based mongoDB connected or not
db().then(()=>{
  app.listen(process.env.PORT,()=>{
    console.log(`server running on http://localhost:${process.env.PORT}`);
  })
})
