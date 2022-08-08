// DEPENDENCIES
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require("cookie-parser");
// const helmet = require("helmet");
const cors = require("cors");
const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
require("dotenv").config();

const app = express();

// ENV VARS
const PORT = process.env.PORT || 3001;
const DB_STRING = process.env.DB_STRING;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;
const TLS_CERT = process.env.TLS_CERT;
const TLS_KEY = process.env.TLS_KEY;

// MIDDLEWARE
app.use(cors({
  origin: CLIENT_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));
// app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(SESSION_SECRET));
app.use(mongoSanitize());
app.enable('trust proxy');
app.use(
  session({
    store: MongoStore.create({ mongoUrl: DB_STRING }),
    name: "user",
    secret: SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    proxy: true,
    cookie: {
      // domain: CLIENT_URL,
      // ^ DO NOT set a domain attribute, this will not work for netlify
      httpOnly: true, // Cannot be accessed by frontend JS, only via HTTP
      maxAge: 1000 * 60 * 60 * 24 * 30
    },
  })
);
require("./passport-config")(passport); // Must come before initialize() and session()
app.use(passport.initialize());
app.use(passport.session());
// Add IP Address to Request:
app.use((req, res, next) => {
  req.userIP =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  // Additional ip related security protocols could go here
  next();
});
// User Permissions Scale, add to Request:
app.use((req, res, next) => {
  let permissions = 0;
  if (req.user) {
    if (req.user.pending) {
      permissions = 1;
    } else if (!req.user.complete) {
      permissions = 2;
    } else {
      switch (req.user.role) {
        case "fan":
          permissions = 3;
          break;
        case "member":
          permissions = 4;
          break;
        case "master":
          permissions = 5;
          break;
        case "admin":
          permissions = 6;
          break;
      }
    }
  }
  req.userPermissions = permissions;
  next();
});

// DB CONNECT
mongoose.connect(
  DB_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  function (err) {
    if (!err) {
      console.log("DB connected");
    } else {
      console.log(err);
    }
  }
);

// ROUTES
require("./routes/authenticationRoutes")(app);
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

if (process.env.NODE_ENV === "production") {
  const originalPublicKey = process.env.TLS_CERT.replace(/\\n/g, "\n");
  const originalPrivateKey = process.env.TLS_KEY.replace(/\\n/g, "\n");

  https.createServer({
    cert: originalPublicKey,
    key: originalPrivateKey,
  }, app).listen(PORT, () => console.log("Listening on PORT " + PORT)); 

} else {
  app.listen(PORT, () => console.log("Listening on PORT " + PORT));
}