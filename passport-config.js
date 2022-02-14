const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const {
  validatePasswordForLogin,
  validateEmailForLogin,
} = require("./validators");
const { userController } = require("./controllers/index.js");

module.exports = function (passport) {
  async function authenticate(email, password, done) {
    const cleanEmail = validateEmailForLogin(email);
    const cleanPassword = validatePasswordForLogin(password);
    if (cleanEmail && cleanPassword) {
      const user = await userController.getUserByEmail(cleanEmail);
      if (user) {
        bcrypt.compare(cleanPassword, user.password, (err, authorized) => {
          if (err) throw err;
          if (authorized) {
            return done(null, user);
          } else {
            return done(null, false, "wrong password!"); // < The messages here will be overriden and won't be sent back to the client, just a mental note for me
          }
        });
      } else {
        return done(null, false, "no user with that email found!");
      }
    } else {
        // If email or password failed validation (returned null), they can't contain special characters and thefor can't match anyones account anyway:
        return done(null, false, "wrong email or password")
    }
  }

  passport.use(
    "local-log-in",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" }, // I am sure to set the usernameField to email!
      authenticate
    )
  );

  passport.serializeUser(function (user, done) {
    return done(null, user._id);
  });

  passport.deserializeUser(async function (_id, done) {
    return done(null, await userController.getUserById(_id));
  });
};
