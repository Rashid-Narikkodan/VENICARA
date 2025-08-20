require("dotenv").config()
const express=require("express")
const app=express()
const db=require('./config/db')
const path=require('path')
const userRoutes=require('./routes/userRoutes')
const adminRoutes=require('./routes/adminRoutes')
const sessionConfig=require('./middlewares/session')
const flash=require('connect-flash')
const flashMsg=require('./middlewares/flash')
const method=require('method-override')

//settings
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.locals.title=process.env.TITLE

//session
sessionConfig(app)

//methodOverride
app.use(method('_method'))

//flash
app.use(flash())
app.use(flashMsg)

//built in middlwares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))

//routers
app.use('/',userRoutes)
app.use('/admin',adminRoutes)

app.use((req,res,next)=>{
  res.status(404).render('userPages/404',{ url: req.originalUrl })
})
//app.listen to start server based mongoDB connected or not
db().then(()=>{
  app.listen(process.env.PORT,()=>{
    console.log(`server running on http://localhost:${process.env.PORT}`);
  })
})
