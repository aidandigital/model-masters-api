// Dependencies
const bcrypt = require("bcryptjs"); // Use bcryptjs instead of bcrypt because the latter has issues running on AWS Lambda
require("dotenv").config();
const transporter = require("../transporter");
const { S3Client, PutObjectCommand, ListObjectsCommand, CopyObjectCommand, DeleteObjectsCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const uuid = require("uuid");

// Controllers
const { userController, modelController } = require("../controllers/index.js");
const { errorRes, successRes } = require("../formattedResponses");

// Custom Validators
const { validateId, validateOptions, validateEmail, validateParagraph, validateText, validateTags, validateNumber, validatePasswordForLogin } = require("../validators");

// AWS S3 Client:
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_TEMP_FOLDER = process.env.S3_TEMP_FOLDER;
const S3_LIVE_FOLDER = process.env.S3_LIVE_FOLDER;
const MAX_IMAGES = parseInt(process.env.MAX_IMAGES, 10)
const S3_MAX_CONTENT_LENGTH_MB = parseInt(process.env.S3_MAX_IMAGE_SIZE, 10);

const s3Client = new S3Client({
  region: AWS_REGION,
});

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
            res.json({success: true, message: "Success"})
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

  app.post("/api/editAccount", async (req, res) => {
    if (req.userPermissions === 0) { // If logged out:
      errorRes(res, "notloggedin");

    } else if (req.user.guest) { // If using a guest account:
      errorRes(res, "authorization", "You cannot edit a guest account");

    } else if (req.userPermissions < 2 || req.user.guest) { // If demoted back to pending:
      errorRes(res, "validation", errors = {general: "Your account status has changed, please refresh this page"});

    } else {
      let {name, email, types, bio } = req.body;
      let errors = {};
      let clean = {
        fullName: validateText(name, "name", errors),
        firstName: null,
        email: validateEmail(email, "email", errors),
        bio: validateParagraph(bio, "bio", errors, false),
        types: validateTags(types, ["Cars", "Tanks", "Trains", "Ships", "Trucks"], "types", errors),
        complete: true,
      };

      if (Object.keys(errors).length !== 0) {
        errorRes(res, "validation", errors);

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
          successRes(res);

        } catch(err) {
          res.status(500).end();
          console.log("Could not update user in DB: ", err);
        }
      }
    }
  });

  app.get("/api/imageUploadURL", async (req, res) => {
    if (req.userPermissions === 0) { // If logged out.
      errorRes(res, "notloggedin");

    } else if (req.userPermissions < 4) { // If demoted below "member" status.
      errorRes(res, "general", "Your account status has changed, please refresh this page");

    } else {
      const user_id = req.user._id;
      const { imageFolderId, extension, contentLength, isTemp } = req.query;
      
      if (!imageFolderId) return errorRes(res, "validation", "You must provide a valid image folder ID");

      // Enforce a S3_MAX_CONTENT_LENGTH_MB MB limit on the image size:
      if (contentLength > S3_MAX_CONTENT_LENGTH_MB * 1024 * 1024) {
        return errorRes(res, "validation", "Image size exceeds " + MAX_IMAGES + " MB limit, please upload a smaller image");
      }
    
      const prefix = `${S3_TEMP_FOLDER}/${user_id}/${imageFolderId}`;
    
      try {
        // List the current files in the S3 folder:
        const listParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Prefix: prefix,
        };

        const listCommand = new ListObjectsCommand(listParams);
        const list = await s3Client.send(listCommand);

        const existingCount = list.Contents ? list.Contents.length : 0;

        // If there are MAX_IMAGES + 1 or more files (since the initial empty object counts as 1 file in the returned list), return a 403 response:
        if (existingCount >= MAX_IMAGES + 1) {
          return errorRes(res, "validation", "You may not upload more than " + MAX_IMAGES + " images");
        }

        // Allowed file extensions (all files sent from the client will be JPEG's):
        const filetypes = /jpeg|jpg/;

        // Check if the extension matches one of the allowed types:
        if (!filetypes.test(extension.toLowerCase())) {
          console.log("User attempted to upload a file with an invalid extension: ", extension);
          return errorRes(res, "validation", "Only JPEG images are allowed to be uploaded");
        }

        // Generate the key for the file:
        const filenameBody = uuid.v4();
        const key = `${prefix}/${filenameBody}.jpeg`; // Use a UUID for unique file names.

        // Create the parameters for the signed URL:
        const signedUrlParams = {
          Bucket: S3_BUCKET_NAME,
          Key: key,
          ContentType: `image/jpeg`,
          ContentLength: parseInt(contentLength, 10), // AWS S3 will reject the upload if the actual content length does not match approximately this value.
        };

        // Generate the signed URL:
        const imageUploadURL = await getSignedUrl(s3Client, new PutObjectCommand(signedUrlParams), { expiresIn: 60 }); // Expires in 60 seconds.
      
        const data = {
          imageUploadURL: imageUploadURL,
          key: key,
          filename: `${filenameBody}.jpeg`,
        };

        successRes(res, data);
    
      } catch (err) {
        console.log("Error generating upload URL: ", err);
        res.status(500).end();
      }
    }
  });

  app.get("/api/imageDeletionURL", async (req, res) => {
    if (req.userPermissions === 0) { // If logged out.
      errorRes(res, "notloggedin");

    } else if (req.userPermissions < 4) { // If demoted below "member" status.
      errorRes(res, "general", "Your account status has changed, please refresh this page");

    } else {
      const user_id = req.user._id;
      const { imageFolderId, filename } = req.query;
      
      if (!imageFolderId) return errorRes(res, "validation", "You must provide a valid image folder ID");
    
      const prefix = `${S3_TEMP_FOLDER}/${user_id}/${imageFolderId}`;

      try {
        const listParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Prefix: prefix,
        };

        const listCommand = new ListObjectsCommand(listParams);
        const list = await s3Client.send(listCommand);

        const key = `${prefix}/${filename}`;
        
        if (!list.Contents || !list.Contents.some(item => item.Key == key)) {
          return errorRes(res, "validation", "The image you are trying to delete does not exist");
        }

        // Create the parameters for the signed URL:
        const signedUrlParams = {
          Bucket: S3_BUCKET_NAME,
          Key: key,
        };

        // Generate the signed URL for deletion:
        const imageDeletionURL = await getSignedUrl(s3Client, new DeleteObjectCommand(signedUrlParams), { expiresIn: 60 }); // Expires in 60 seconds.

        const data = {
          imageDeletionURL: imageDeletionURL,
          key: key,
        };

        successRes(res, data);

      } catch (err) {
        console.log("Error generating deletion URL: ", err);
        res.status(500).end();
      }
    }
  });

  app.post("/api/addModel", async (req, res) => {
    if (req.userPermissions === 0) { // If logged out.
      errorRes(res, "notloggedin");

    } else if (req.userPermissions < 4) { // If demoted below "member" status.
      errorRes(res, "general", errors = {general: "Your account status has changed, please refresh"});

    } else {
      const user_id = req.user._id;
      let {name, type, about, completionMonth, completionYear, facts, imageFolderId, thumbnailKey } = req.body;
      let errors = {};

      if (!imageFolderId) return errorRes(res, "general", {general: "You must provide a valid image folder ID"});

      const maxYear = new Date().getFullYear();

      let clean = {
        name: validateText(name, "name", errors),
        type: validateOptions(type, ["Car", "Tank", "Truck", "Ship", "Train", "Other"], "type", errors),
        about: validateParagraph(about, "about", errors),
        completionMonth:
        validateOptions(
          completionMonth,
          ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          "completionMonth",
          errors
        ),
        completionYear: validateNumber(completionYear, 1940, maxYear, "completionYear", errors),
        imageKeys: null,
        thumbnailKey: null,
        facts: validateParagraph(facts, "facts", errors, required = false) ? validateParagraph(facts, "facts", errors, required = false).split("\n").filter(fact => fact.trim() !== "") : null,
        user: user_id,
        imageFolderId: null, // Will be validated later by the fact that the folder must be found in S3.
      }

      // Validate the images:
      const tempPrefix = `${S3_TEMP_FOLDER}/${user_id}/${imageFolderId}`;

      try {
        const listParams = {
          Bucket: S3_BUCKET_NAME,
          Prefix: tempPrefix,
        };

        const listCommand = new ListObjectsCommand(listParams);
        const list = await s3Client.send(listCommand);
        
        // The images themselves, the maximum content length, and the maximum number of images were already validated when they were uploaded.
        // Now we must just check if the folder the client is providing is valid and contains at least one image.
        // By doing so, we are also ensuring that the imageFolderId is valid, since the folder can only be created by the server:
        if (!list.Contents || list.Contents.map(item => item.Key).filter(key => key.endsWith('.jpeg') || key.endsWith('.jpg')).length === 0) {
          errors.images = "Please upload at least one image";
        } else if (!thumbnailKey || !list.Contents.some(item => item.Key === thumbnailKey)) {
          errors.images = "Please select a thumbnail";
        }

        if (Object.keys(errors).length !== 0) {
          errorRes(res, "validation", errors);

        } else {
          // Create a list of the keys of the images in the temporary folder:
          const imageKeys = list.Contents.map(item => item.Key).filter(key => key.endsWith('.jpeg') || key.endsWith('.jpg'));
          // ^ This filters out any non-image files, such as the initial empty object that was created to represent the folder.

          // Move the images from the temporary folder to the live folder:
          const livePrefix = `${S3_LIVE_FOLDER}/${user_id}/${imageFolderId}`;
          let liveKeys = [];

          for (const tempKey of imageKeys) {
            const liveKey = tempKey.replace(tempPrefix, livePrefix);
            liveKeys.push(liveKey);

            const copyParams = {
              Bucket: S3_BUCKET_NAME,
              CopySource: `${S3_BUCKET_NAME}/${encodeURIComponent(tempKey)}`, // URL encode the source key.
              Key: liveKey,
            };

            const copyCommand = new CopyObjectCommand(copyParams);
            await s3Client.send(copyCommand);
          }

          // Delete the entire temporary folder:
          const deleteParams = {
            Bucket: S3_BUCKET_NAME,
            Delete: {
              Objects: list.Contents.map(obj => ({ Key: obj.Key })),
            },
          };

          await s3Client.send(new DeleteObjectsCommand(deleteParams));

          clean.imageFolderId = imageFolderId; // Set the image folder ID to the one provided by the client now that we know it is valid.
          clean.imageKeys = liveKeys;
          clean.thumbnailKey = thumbnailKey.replace(tempPrefix, livePrefix);

          const newModel = await modelController.addModel(clean, user_id);

          successRes(res, {
            model_id: newModel._id,
          });
        }

      } catch(err) {
        console.log("Error adding model to DB: ", err);
        res.status(500).end();
      }
    }
  });

  app.post("/api/editModel", async (req, res) => {
    if (req.userPermissions === 0) { // If logged out.
      errorRes(res, "notloggedin");

    } else if (req.userPermissions < 4) { // If demoted below "member" status.
      errorRes(res, "general", errors = {general: "Your account status has changed, please refresh"});

    } else {
      const user_id = req.user._id;
      let {name, type, about, completionMonth, completionYear, facts, imageFolderId, model_id, thumbnailKey } = req.body;
      let errors = {};

      if (!imageFolderId) return errorRes(res, "general", {general: "You must provide a valid image folder ID"});
      const cleanId = validateId(model_id);

      const model = await modelController.getModelById(cleanId);

      if (!model) {
        return errorRes(res, "general", {general: "The model you are trying to edit doesn't exist"});

      } else if (String(model.user._id) !== String(user_id)) {
        // If the user is not the owner of the model and is not an admin:
        return errorRes(res, "authorization", "You are not authorized to edit this model");
      }

      const maxYear = new Date().getFullYear();

      let clean = {
        name: validateText(name, "name", errors),
        type: validateOptions(type, ["Car", "Tank", "Truck", "Ship", "Train", "Other"], "type", errors),
        about: validateParagraph(about, "about", errors),
        completionMonth:
        validateOptions(
          completionMonth,
          ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          "completionMonth",
          errors
        ),
        completionYear: validateNumber(completionYear, 1940, maxYear, "completionYear", errors),
        imageKeys: null,
        thumbnailKey: null,
        facts: validateParagraph(facts, "facts", errors, required = false) ? validateParagraph(facts, "facts", errors, required = false).split("\n").filter(fact => fact.trim() !== "") : null,
        user: user_id,
        imageFolderId: null, // Will be validated later by the fact that the folder must be found in S3.
      }

      // Validate the images:
      const tempPrefix = `${S3_TEMP_FOLDER}/${user_id}/${imageFolderId}`;

      try {
        const listParams = {
          Bucket: S3_BUCKET_NAME,
          Prefix: tempPrefix,
        };

        const listCommand = new ListObjectsCommand(listParams);
        const list = await s3Client.send(listCommand);
        
        // The images themselves, the maximum content length, and the maximum number of images were already validated when they were uploaded.
        // Now we must just check if the folder the client is providing is valid and contains at least one image.
        // By doing so, we are also ensuring that the imageFolderId is valid, since the folder can only be created by the server:
        if (!list.Contents || list.Contents.map(item => item.Key).filter(key => key.endsWith('.jpeg') || key.endsWith('.jpg')).length === 0) {
          errors.images = "Please upload at least one image";
        } else if (!thumbnailKey || !list.Contents.some(item => item.Key === thumbnailKey)) {
          errors.images = "Please select a thumbnail";
        }

        if (Object.keys(errors).length !== 0) {
          errorRes(res, "validation", errors);

        } else {
          // Create a list of the keys of the images in the temporary folder:
          const imageKeys = list.Contents.map(item => item.Key).filter(key => key.endsWith('.jpeg') || key.endsWith('.jpg'));
          // ^ This filters out any non-image files, such as the initial empty object that was created to represent the folder.

          // Move the images from the temporary folder to the live folder:
          const livePrefix = `${S3_LIVE_FOLDER}/${user_id}/${imageFolderId}`;
          let liveKeys = [];

          for (const tempKey of imageKeys) {
            const liveKey = tempKey.replace(tempPrefix, livePrefix);
            liveKeys.push(liveKey);

            const copyParams = {
              Bucket: S3_BUCKET_NAME,
              CopySource: `${S3_BUCKET_NAME}/${encodeURIComponent(tempKey)}`, // URL encode the source key.
              Key: liveKey,
            };

            const copyCommand = new CopyObjectCommand(copyParams);
            await s3Client.send(copyCommand);
          }

          // Delete the entire temporary folder:
          const deleteParams = {
            Bucket: S3_BUCKET_NAME,
            Delete: {
              Objects: list.Contents.map(obj => ({ Key: obj.Key })),
            },
          };

          await s3Client.send(new DeleteObjectsCommand(deleteParams));

          clean.imageFolderId = imageFolderId; // Set the image folder ID to the one provided by the client now that we know it is valid.
          clean.imageKeys = liveKeys;
          clean.thumbnailKey = thumbnailKey.replace(tempPrefix, livePrefix);

          await modelController.updateModel(model_id, clean);

          successRes(res);
        }

      } catch(err) {
        console.log("Error adding model to DB: ", err);
        res.status(500).end();
      }
    }
  });

  app.post("/api/deleteModel", async (req, res) => {
    if (req.userPermissions === 0) { // If logged out:
      errorRes(res, "notloggedin");

    } else if (req.userPermissions < 4) { // If demoted below "member" status:
      errorRes(res, "general", errors = {general: "Your account status has changed, please refresh this page"});

    } else {
      const { model_id, password } = req.body;
      const user_id = req.user._id;
      const cleanPassword = validatePasswordForLogin(password);
      const cleanId = validateId(model_id);

      function incorrectPassword() {
        errorRes(res, "general", errors = {password: "Incorrect password"})
      }

      try {
        let model = await modelController.getModelById(cleanId);

        if (!model) {
          // If model not found, return DNE
          errorRes(res, "general", errors = {general: "The model you are trying to delete doesn't exist"});

        } else if (!cleanPassword || ( String(model.user._id) !== String(user_id) )) {
          // If no clean password or user isn't the owner of the model (and not admin):
          incorrectPassword();

        } else {
          // Now we know that this user is the owner of the model or they are an admin.
          // Check if they got their password correct:
          bcrypt.compare(cleanPassword, req.user.password, async (err, authorized) => {
            if (err) throw err;
            if (authorized) {
              await modelController.deleteModelById(cleanId);
              await userController.removeModelIdFromUser(model.user._id, cleanId)

              // Delete the images from S3:
              const prefix = `${S3_LIVE_FOLDER}/${model.user._id}/${cleanId}`;

              const deleteParams = {
                Bucket: S3_BUCKET_NAME,
                Prefix: prefix,
              };

              const deleteCommand = new ListObjectsCommand(deleteParams);
              await s3Client.send(deleteCommand);

              successRes(res);

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
      errorRes(res, "general", errors = {general: "Your account status has changed, please refresh this page"})
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
          to: process.env.GMAIL_RECEIVER,
          subject: 'An Issue was Reported for Model Masters',
          text: `
          Reporter: ${req.user.fullName} (ID: ${req.user._id}
          Issue: The user reported a "${clean.type}"
          URL of Issue (OPEN WITH CAUTION): ${clean.url} 
          Description: ${clean.description}

          Reported on ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}
          `
        };
        
        transporter.sendMail(mailOptions, function(err, info){
          if (err) {
            console.log("Failed to email report: ", err);
            res.status(500).end()

          } else {
            successRes(res);
          }
        });
      }
    }
  });
  
  app.post("/api/requestVerification", (req, res) => {
    if (req.userPermissions === 0) { // If logged out
      errorRes(res, "notloggedin")
    } else if (req.userPermissions < 3 || req.user.guest) { // // If demoted below "fan" status
      errorRes(res, "general", errors = {general: "Your account status has changed, please refresh this page"})
    } else {
      const date = new Date()
      var mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_RECEIVER,
        subject: 'A User requested Verification for Model Masters',
        text: `
        Requester: ${req.user.fullName} (ID: ${req.user._id}

        Requested on ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}
        `
      };
      
      transporter.sendMail(mailOptions, function(err, info){
        if (err) {     
          console.log("Failed to email verification request: ", err);
          res.status(500).end()
        } else {

          successRes(res);
        }
      });
    }
  });
};