const session = require('express-session');
const MongoStore = require('connect-mongo');

const adminSession = session({
  name: 'admin.sid', // unique cookie
  secret: process.env.ADMIN_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'adminSessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 30 min
    httpOnly: true,
    sameSite: 'strict',
    secure: false
  }
});

const userSession = session({
  name: 'user.sid', // unique cookie
  secret: process.env.USER_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'userSessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 2 hrs
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  }
});

function sessionConfig(app) {
  // Admin session → ONLY for /admin routes
  app.use('/admin', adminSession);

  // User session → apply everywhere EXCEPT /admin
  app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
      return next(); // skip user session
    }
    userSession(req, res, next);
  });
}

module.exports = sessionConfig;
