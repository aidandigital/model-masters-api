// DEPENDENCIES
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require("cookie-parser");
const passportLocal = require("passport-local").Strategy;
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const DB_STRING = process.env.DB_STRING;
const SESSION_SECRET = process.env.SESSION_SECRET;

// MIDDLEWARE
app.set('trust proxy', 1)
app.use(cors({
  origin: process.env.CLIENT_URL,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
// app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(SESSION_SECRET));
app.use(mongoSanitize());
app.use(
  session({
    store: MongoStore.create({ mongoUrl: DB_STRING }),
    name: "sqpowfnodkwsd",
    secret: "dsklsdsklds",
    saveUninitialized: true,
    resave: false,
    cookie: {
      domain: 'model-masters.netlify.app',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      sameSite: "none",
      secure: true, // Required when sameSite is set to "none"
      // httpOnly: true,
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

// Needs to come last so http requests not going to the backend will return the frontend
/*
app.get('/*', function (req, res) {
  console.log("sending frontend")
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});
*/

/*
app.post("/api/test", function (req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      console.log(err)
    } else {
      res.end("File is uploaded")
      console.log(req.file)
      console.log(req.files)
    }
  })
});
*/

app.listen(PORT, () => console.log("Listening on PORT " + PORT));
