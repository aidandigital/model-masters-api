// Dependencies
const fs = require("fs");
const { ObjectID } = require('mongodb');
const bcrypt = require("bcrypt");
const path = require("path");
require("dotenv").config();
const transporter = require("../transporter");

// Controllers
const { userController, modelController } = require("../controllers/index.js");
const { errorRes } = require("../formattedResponses");

// Custom Validators
const { validateId, validateOptions, validateEmail, validateParagraph, validateText, validateTags, validateNumber, validatePasswordForLogin } = require("../validators");

// Middleware & Cloudinary
const { multerUpload, cloudinaryUpload, clearCloudinaryFolder } = require("../images"); 

module.exports = function (app) {
  app.post("/api/changeUserRole/", async (req, res) => {
    if (req.userPermissions === 6) {
      const cleanId = validateId(req.body._id);
      const cleanType = validateOptions(req.body.type, [
        "promote",
        "demote",
        "setPending",
      ]);
      if (!cleanId || !cleanType) {
        return errorRes(res, "general", "Invalid options");
      }
      try {
        if (cleanType === "setPending") {
          const result = await userController.changeUserPending(cleanId);
          if (result === "approved" || result === "disapproved") {
            res.json({success: true, message: "Successfully disapproved user"})
          } else {
            // User not found
            res.json({
              success: false,
              errType: "general",
              message: "Cannot find user",
            });
          }
        } else {
          const message = await userController.changeUserRole(cleanId, cleanType);
          res.json({
            success: !message.includes("Cannot"), // Guess if error or not based on message. I know, it's not ideal
            errType: message.includes("Cannot") ? "general" : null,
            message: message,
          });
        }
      } catch {
        console.log("Could not change user role or status")
        res.status(500).end();
      }
    } else if (req.userPermissions === 0) {
      errorRes(
        res,
        "notloggedin"
      );
    } else {
      errorRes(
        res,
        "authorization",
        "Your account type does not have access to this resource"
      );
    }
  });

  app.post("/api/updateAccount", async (req, res) => {
    if (req.userPermissions === 0) { // If logged out
      errorRes(res, "notloggedin")
    } else if (req.userPermissions < 2) { // If demoted back to pending
      errorRes(res, "validation", errors = {general: "Your account status has changed, please refresh this page."})
    } else {
      let {name, email, types, bio } = req.body;
      let errors = {};
      let clean = {
        fullName: validateText(name, "name", errors),
        firstName: null,
        email: validateEmail(email, "email", errors),
        bio: validateParagraph(bio, "bio", errors),
        types: validateTags(types, ["Cars", "Tanks", "Trains", "Ships", "Trucks"], "types", errors),
        complete: true,
      };
      if (Object.keys(errors).length !== 0) {
        errorRes(res, "validation", errors)
      } else { // If no validation errors
        try {
          if (clean.email !== req.user.email) { // If the email changed, check it
            const emailAvailable = await userController.checkEmailAvailability(clean.email);
            if (!emailAvailable) {
              errors.email = "This email isn't available"
              return errorRes(res, "validation", errors)
            }
          }
          clean.firstName = clean.fullName.split(" ")[0];
          await userController.updateUser(req.user._id, clean);
          res.json({success: true})
        } catch {
          res.status(500).end();
          console.log("Could not update user in DB");
        }
      }
    }
  });

  app.post("/api/addModel", async (req, res) => {
    if (req.userPermissions === 0) { // If logged out
      errorRes(res, "notloggedin")
    } else if (req.userPermissions < 4) { // If demoted below "member" status
      errorRes(res, "general", errors = {general: "Your account status has changed, please refresh this page."})
    } else {
      // Must use image upload function in this way to enforce max images limit:
      let modelImageUpload = multerUpload.array("images", 8);
      modelImageUpload(req, res, async (imageErr) => {
        const user_id = req.user._id;

        let {name, type, about, completionMonth, completionYear, facts } = req.body;
        let errors = {};

        if (req.files < 1) {
          errors.images = "Please select at least 1 image"
        }
        // If error uploading override minimum images message
        if (imageErr) {
          console.log(imageErr)
          if (imageErr === "invalid file type (user error)") {
            errorRes(res, "validation", {images: "Invalid file type"})
          } else {
            res.status(500).end()
          }
        } else {
          // Ensure no image upload error before validating other fields, otherwise there will be no req.body
          // At this point images have entered the file system
          const maxYear = new Date().getFullYear();

          clean = {
            name: validateText(name, "name", errors, 30),
            type: validateOptions(type, ["Car", "Tank", "Truck", "Ship", "Train", "Other"], "type", errors),
            about: validateParagraph(about, "about", errors),
            completionMonth: 
            validateOptions(
              completionMonth,
              ["January","February","March","April","May","June","July","August","September","October","November","December"],
              "completionMonth", 
              errors
            ),
            completionYear: validateNumber(completionYear, 1940, maxYear, "completionYear", errors),
            images: null,
            facts: validateParagraph(facts, "facts", errors, required = false).split("\n"),
            user: user_id,
            _id: null,
          }

          if (Object.keys(errors).length !== 0) {
            errorRes(res, "validation", errors)

            // If validation error(s), delete images from "uploaded" file:
            imageNames.forEach((image) => {
              fs.unlink(path.join(__dirname, `../uploadedImgs/${image}`), () => {})
            })
          } else {
            try {
              const modelId = await new ObjectID();
              clean._id = modelId;
              livePaths = [];

              for (const file of req.files) {
                const livePath = await cloudinaryUpload(file.path, modelId, `user_id=${user_id}|model_type=${clean.type}`);
                livePaths.push(livePath);
              }

              clean.images = livePaths;

              let createdModel_id = await modelController.addModel(clean, user_id);
  
              if (createdModel_id) {
                res.json({success: true, model_id: modelId})
              } else {
                throw "couldn't add model to DB";
              }
            } catch(err) {
              console.log(err)
                console.log("Error adding model")
                res.status(500).end();
            }
          }
        }
      })
    }
  });

  app.post("/api/deleteModel", async (req, res) => {
    if (req.userPermissions === 0) { // If logged out
      errorRes(res, "notloggedin")
    } else if (req.userPermissions < 4) { // If demoted below "member" status
      errorRes(res, "general", errors = {general: "Your account status has changed, please refresh this page."})
    } else {

      let { model_id, reason, password } = req.body;
      const cleanPassword = validatePasswordForLogin(password);
      const cleanId = validateId(model_id);

      function incorrectPassword() {
        errorRes(res, "general", errors = {password: "Incorrect password"})
      }

      try {
        let model = await modelController.getModelById(cleanId)
        if (!model) {
          // If model not found, return DNE
          errorRes(res, "general", errors = {model_id: "This model doesn't exist"})
        } else if (!cleanPassword || ( String(model.user._id) !== String(req.user._id) && req.userPermissions !== 6 )) {
          // If no clean password or user isn't the owner of the model (and not admin):
          incorrectPassword();
        } else {
          // Now we know this user is the owner of the model or they are an admin
          // Check if they got their password correct
          bcrypt.compare(cleanPassword, req.user.password, async (err, authorized) => {
            if (err) throw err;
            if (authorized) {
              await modelController.deleteModelById(cleanId);
              await userController.removeModelIdFromUser(model.user._id, cleanId)
              res.json({success: true}) 
              clearCloudinaryFolder(cleanId);
            } else {
              incorrectPassword()
            }
          });
        }
      } catch {
        res.status(500).end();
      }
    }
  });

  app.post("/api/reportIssue", (req, res) => {
    if (req.userPermissions === 0) { // If logged out
      errorRes(res, "notloggedin")
    } else if (req.userPermissions === 1) { // If user is pending
      errorRes(res, "general", errors = {general: "Your account status has changed, please refresh this page."})
    } else {
      let { type, url, description } = req.body;
      let errors = {};
      let clean = {
        type: validateOptions(type, ["error", "model", "user"], "type", errors),
        url: validateText(url, "url", errors, 100),
        description: validateParagraph(description, "description", errors)
      }

      if (Object.keys(errors).length !== 0) {
        errorRes(res, "validation", errors)
      } else {
        const date = new Date()
        var mailOptions = {
          from: process.env.GMAIL_USER,
          to: process.env.RECEIVER_EMAIL,
          subject: 'An Issue was Reported for Model Masters',
          text: `
          Reporter: ${req.user.fullName} (ID: ${req.user._id}, IP: ${req.userIP})
          Issue: The user reported a "${clean.type}"
          URL of Issue (OPEN WITH CAUTION): ${clean.url} 
          Description: ${clean.description}

          Reported on ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}
          `
        };
        
        transporter.sendMail(mailOptions, function(err, info){
          if (err) {
            console.log("Failed to email report");
            res.status(500).end()
          } else {
            res.json({success: true})
          }
        });
      }
    }
  })
};