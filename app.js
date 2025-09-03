require("dotenv").config()
require('./config/passport'); // import Passport config
const express = require("express")
const app = express()
const connectDB = require('./config/db')
const path = require('path')
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes')
const userRoute = require('./routes/user')
const sessionConfig = require('./middlewares/session')
const flash = require('connect-flash')
const flashMsg = require('./middlewares/flash')
const method = require('method-override')
const passport = require('passport')
const nocache = require('nocache')

//settings
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.locals.title = process.env.TITLE

//session
sessionConfig(app)

//third party middlwares
app.use(flash())
app.use(flashMsg)
app.use(passport.initialize())
app.use(passport.session())
app.use(method('_method'))
app.use(nocache())

//built in middlwares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

//routers
app.use('/admin', adminRoutes)
app.use('/',userRoute)
app.use('/', userRoutes)
//pagenotfound
app.use((req, res, next) => {
  res.status(404).render('userPages/404', { url: req.originalUrl })
})

//app.listen to start server based mongoDB connected or not
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`server running on http://localhost:${process.env.PORT}`);
  })
})
