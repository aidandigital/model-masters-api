// Dependencies
const bcrypt = require("bcrypt");
const passport = require("passport");
const transporter = require("../transporter");
require("dotenv").config();

const GUEST_ID = process.env.GUEST_ID;

// Controllers
const { userController } = require("../controllers/index.js");

// Custom Helpers
const {
  validateText,
  validateOptions,
  validateEmail,
  validatePassword,
  validatePasswordForLogin
} = require("../validators");
const { errorRes } = require("../formattedResponses");

module.exports = function (app) {
  app.get("/api/checkLoggedInAlready", (req, res) => {
    if (req.user) {
      res.json({
        loggedInAlready: true,
      });
    } else {
      res.json({
        loggedInAlready: false,
      });
    }
  });

  app.post("/api/login", (req, res) => {
    if (req.user) {
      // No logging in if logged in already
      errorRes(
        res,
        "authorization",
        "You are already logged in with an account."
      );
      return;
    } else {
      passport.authenticate("local-log-in", (err, user, info) => {
        try {
          if (err) throw err;
          if (!user) {
            errorRes(res, "authorization", "Invalid email or password");
          } else {
            req.login(user, function (err) {
              if (err) throw err;
              res.json({
                success: true,
              });
              userController.addUserIP(user._id, req.userIP);
            });
          }
        } catch {
          res.status(500).end();
        }
      })(req, res);
    }
  });

  app.post("/api/register", async (req, res) => {
    if (req.user) {
      // No signing up if logged in already
      return errorRes(
        res,
        "authorization",
        "You are already logged in. Log out first to make a new account"
      );
    } else {
      const { name, email, password } = req.body; // Raw data
      let errors = {};
      // Ensure fields are filled out correctly and contain only appropriate characters:
      let clean = {
        fullName: validateText(name, "name", errors),
        firstName: null,
        email: validateEmail(email, "email", errors),
        password: validatePassword(password, "password", errors),
        ips: [req.userIP],
      };
      if (Object.keys(errors).length !== 0) {
        // If there are validation errors send them back:
        errorRes(res, "validation", errors);
      } else {
        // Check email availability if no validation errors:
        try {
          emailAvailable = await userController.checkEmailAvailability(
            clean.email
          );
          if (emailAvailable) {
            // If email available create password hash:
            const hashedPassword = await new Promise((resolve, reject) => {
              bcrypt.hash(clean.password, 12, (err, hash) => {
                if (err) reject(err);
                resolve(hash);
              });
            });
            clean.password = hashedPassword; // Replace plaintext password with hash in clean data object
            // Add user to db:
            clean.firstName = clean.fullName.split(" ")[0];
            const newUser = await userController.addUser(clean);
            if (newUser._id) {
              // Make sure was created correctly and then sign in:
              // !! Maybe want to clean this up
              req.login(newUser, function (err) {
                if (err) throw err;
                res.json({
                  success: true,
                });

                // Email myself that a new user registered
                const date = new Date()
                var mailOptions = {
                  from: process.env.GMAIL_USER,
                  to: process.env.GMAIL_RECEIVER,
                  subject: 'A new user registered for Model Masters',
                  text: `User registered on ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                };
        
                transporter.sendMail(mailOptions, function(err, info) {});
              });
            } else {
              res.status(500).end();
            }
          } else {
            // If email is not available:
            errorRes(res, "validation", {
              email: "This email is not available",
            });
          }
        } catch {
          console.log("Error registering user")
          res.status(500).end();
        }
      }
    }
  });

  app.get("/api/logout", async (req, res) => {
    try {
      if (req.userPermissions > 0) {
        req.logout();
      }
      res.end();
    } catch { 
      res.status(500).end();
      console.log("Couldn't log out user")
    }
  });

  app.post("/api/loginAsGuest", (req, res) => {
    if (req.user) {
      // No signing up if logged in already
      return errorRes(
        res,
        "authorization",
        "You are already logged in. Log out first to make a new account"
      );
    } else {
      const guest = {
        _id: GUEST_ID
      };
      req.login(guest, function (err) {
        if (err) {
          console.log("Couldn't log in user as guest")
          return res.status(500).end();
        }
        res.json({
          success: true,
        });
      })
    }
  });

  app.post("/api/updatePassword", async (req, res) => {
    if (req.userPermissions === 0) { // If logged out
      errorRes(res, "notloggedin")
    } else if (req.userPermissions < 2) { // If demoted below "complete" status
      errorRes(res, "general", errors = {general: "Your account status has changed, please refresh this page."})
    } else {
      let { oldPassword, newPassword } = req.body;
      let errors = {};
      const clean = {
        oldPassword: validatePasswordForLogin(oldPassword),
        newPassword: validatePassword(newPassword, "newPassword", errors),
      }

      if (!oldPassword) { // show message if password wasn't typed (not included in the sanitation method above)
        errors.oldPassword = "This field is required";
      }

      if (Object.keys(errors).length !== 0) {
        // If there are validation errors send them back:
        errorRes(res, "validation", errors);
      } else {
        try {
          bcrypt.compare(clean.oldPassword, req.user.password, async (err, authorized) => {
            if (err) throw err;
            if (authorized) {
              // hash password
              const hashedNewPassword = await new Promise((resolve, reject) => {
                bcrypt.hash(clean.newPassword, 12, (err, hash) => {
                  if (err) reject(err);
                  resolve(hash);
                });
              });
              // update account to new password
              await userController.updateUser(req.user._id, {password: hashedNewPassword})
              res.json({success: true});
            } else {
              errorRes(res, "validation", errors = {oldPassword: "Incorrect password"})
            }
          });
        } catch {
          res.status(500).end();
        }
      }
    }
  });
};