const session = require('express-session')
const MongoStore = require('connect-mongo')

function sessionConfig(app) {
  app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: 'VENICARA',
      collectionName: 'sessions'
    }),
    cookie: {
      httpOnly: true, //prevent frontEnd from manipulating cookies
      secure: false,          // true if using HTTPS in production
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  }))
}

module.exports = sessionConfig
