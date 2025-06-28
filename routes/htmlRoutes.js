const { ObjectId } = require('mongodb');
const { dataRes, errorRes } = require("../formattedResponses");
const { userController, modelController } = require("../controllers/index.js");
const { validateId } = require("../validators");
const path = require("path")
const fs = require("fs");
const uuid = require("uuid");
const { S3Client, PutObjectCommand, GetObjectCommand, CopyObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// AWS S3 Client:
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_TEMP_FOLDER = process.env.S3_TEMP_FOLDER;
const S3_LIVE_FOLDER = process.env.S3_LIVE_FOLDER;

const s3Client = new S3Client({
  region: AWS_REGION,
});

module.exports = function (app) {
  app.get("/html/users", async (req, res) => {
    let data = null;
    try {
      if (req.userPermissions === 6) {
        data = await userController.getUsers(adminView = true);
      } else if (req.userPermissions > 2) {
        data = await userController.getUsers();
      }
      dataRes(res, req, req.userPermissions > 2, data);
    } catch {
      console.log("Could not get users from DB")
      res.status(500).end();
    }
  });

  app.get("/html/user/:_id", async (req, res) => {
    if (req.userPermissions < 2) {
      return dataRes(res, req, false, null); // Must have a complete account.

    } else {
      let queried_id = validateId(req.params._id);
      
      try {
        let queried_id = validateId(req.params._id);

        if (queried_id) {
          const user = await userController.getUserById(queried_id);
          const models = await userController.getUserModels(queried_id);
          let { _id, fullName, firstName, role, email, types, bio } = user;

          if (!user) { // No user found:
            dataRes(res, req, true, null, false);

          } else if (user.pending || user.guest) { // Queried user is pending or the guest user:
            dataRes(res, req, true, null, false);

          } else {
            let data;

            data = {
              _id: _id,
              name: firstName,
              role: role,
              email: email,
              types: types,
              bio: bio,
              models: models,
            };

            // Generate signed URLs for getting images from S3:
            const modelsWithSignedUrls = await Promise.all(models.map(async (model) => {
              const { _id, name, type, thumbnailKey } = model;

              const command = new GetObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: thumbnailKey,
              });

              const thumbnailUrl = await getSignedUrl(s3Client, command, { expiresIn: 3 * 24 * 60 * 60 }); // URL is valid for 3 days.

              return {
                _id: _id,
                name: name,
                type: type,
                thumbnail: thumbnailUrl,
              };
            }));

            // Add models with signed URLs to data:
            data.models = modelsWithSignedUrls;

            if (req.userPermissions === 6 || String(req.user._id) === String(_id)) { // Must convert to string before comparison because object ID's can be weird.
              data.name = fullName; // Admins and the user themselves can see the full name.
            }

            dataRes(res, req, true, data);
          }
        } else {
          dataRes(res, req, true, null, false);
        }
      } catch(err) {
        console.log("Could not get individual user from DB: ", err);
        res.status(500).end();
      }
    }
  });

  app.get("/html/editAccount", async (req, res) => {
    if (req.userPermissions > 1 && !req.user.guest) { // User cannot be pending or the guest account.
      try {
        let { fullName, bio, email, complete, types, ips } = await userController.getUserById(req.user._id);
        dataRes(res, req, true, {name: fullName, bio, email, complete, types, ips});
      } catch {
        console.log("Could not get individual user from DB (for account editor)")
        res.status(500).end();
      }
    } else {
      dataRes(res, req, false, null);
    }
  });

  app.get("/html/addModel", async (req, res) => {
    if (req.userPermissions > 2) {
      if (req.userPermissions > 3) {
        try {
          // The image folder ID will be an ObjectId which will eventually correspond to the _id of the model:
          const imageFolderId = uuid.v4();
          const bucket = S3_BUCKET_NAME;
          const folderKey = `${S3_TEMP_FOLDER}/${req.user._id}/${imageFolderId}/`;
    
          // Create a folder in S3 by uploading an empty object with a trailing slash:
          const params = {
            Bucket: bucket,
            Key: folderKey,
            Body: '',
            ContentType: 'application/x-directory'
          }

          const command = new PutObjectCommand(params);

          await s3Client.send(command);
    
          dataRes(res, req, true, {
            imageFolderId: imageFolderId,
          });
    
        } catch (err) {
          console.log("Error creating S3 folder: ", err);
          res.status(500).end();
        }

      } else {
        dataRes(res, req, true, {
          imageFolderId: null,
        });
      }

    } else {
      dataRes(res, req, false, null)
    }
  });

  app.get("/html/editModel/:model_id_edit", async (req, res) => {
    if (req.userPermissions > 3) {
      let queried_id = validateId(req.params.model_id_edit);

      if (!queried_id) {
        dataRes(res, req, true, null, false);

      } else {
        try {
          let model = await modelController.getModelById(queried_id);

          if (!model) {
            // Not found:
            return dataRes(res, req, true, null, false);
          }

          if (String(model.user._id) !== String(req.user._id)) { // User must be the owner of the model:
            return dataRes(res, req, false, null);
          }

          let { name, about, type, _id, facts, imageKeys, thumbnailKey, imageFolderId, completionMonth, completionYear } = model;

          // Rearrange imageKeys to include the thumbnail first:
          imageKeys = [thumbnailKey, ...imageKeys.filter(key => key !== thumbnailKey)];

          // Copy the images in the live folder to a temporary folder for editing with a new ID:
          const liveImageFolderId = imageFolderId;
          const tempImageFolderId = uuid.v4();

          const livePrefix = `${S3_LIVE_FOLDER}/${req.user._id}/${liveImageFolderId}`;
          const tempPrefix = `${S3_TEMP_FOLDER}/${req.user._id}/${tempImageFolderId}`;

          const images = []
          
          for (const liveKey of imageKeys) {
            const tempKey = liveKey.replace(livePrefix, tempPrefix);

            const copyParams = {
              Bucket: S3_BUCKET_NAME,
              CopySource: `${S3_BUCKET_NAME}/${encodeURIComponent(liveKey)}`, // URL encode the source key.
              Key: tempKey,
            };

            const copyCommand = new CopyObjectCommand(copyParams);
            await s3Client.send(copyCommand);

            const getCommand = new GetObjectCommand({
              Bucket: S3_BUCKET_NAME,
              Key: liveKey,
            });

            const src = await getSignedUrl(s3Client, getCommand, { expiresIn: 3 * 24 * 60 * 60 }); // URL is valid for 3 days.

            images.push({
              src: src,
              key: tempKey,
              filename: tempKey.split('/').pop(), // Get the filename from the key.
              type: "image/jpeg",
            });
          }

          dataRes(res, req, true, {
            name: name,
            about: about,
            type: type,
            model_id: _id,
            facts: facts.join('\n'),
            images: images,
            imageFolderId: tempImageFolderId,
            thumbnailKey: thumbnailKey.replace(livePrefix, tempPrefix),
            completionMonth: completionMonth,
            completionYear: completionYear,
          });

        } catch(err) {
          console.log("Could not get individual model from DB: ", err);
          res.status(500).end();
        }
      }
    } else {
      dataRes(res, req, false, null)
    }
  });

  app.get("/html/model/:model_id", async (req, res) => {
    let queried_id = validateId(req.params.model_id);

    if (req.userPermissions > 2) {
      if (!queried_id) {
        dataRes(res, req, true, null, false);
      } else {
        try {
          let model = await modelController.getModelById(queried_id);

          if (!model) {
            // Not found:
            return dataRes(res, req, true, null, false);
          }

          let { name, about, type, _id, facts, user, completionMonth, completionYear, imageKeys, thumbnailKey } = model;

          // Rearrange imageKeys to include the thumbnail first:
          imageKeys = [thumbnailKey, ...imageKeys.filter(key => key !== thumbnailKey)];

          // Generate signed URLs for getting images from S3:
          const images = await Promise.all(imageKeys.map(async (key) => {
            const command = new GetObjectCommand({
              Bucket: S3_BUCKET_NAME,
              Key: key,
            });

            return await getSignedUrl(s3Client, command, { expiresIn: 3 * 24 * 60 * 60 }); // URL is valid for 3 days.
          }));

          let data = {
            name: name,
            about: about,
            type: type,
            _id: _id,
            facts: facts,
            user: {
              name: user.firstName,
              role: user.role,
              _id: user._id,
            },
            completionMonth: completionMonth,
            completionYear: completionYear,
            images: images,
          }

          if (user.pending || user.role === "fan") { // Owner pending or demoted to fan: show not found:
            dataRes(res, req, true, null, false);

          } else {
            dataRes(res, req, true, data);
          }
        } catch(err) {
          console.log("Could not ge individual model from DB: ", err);
          res.status(500).end();
        }
      }
    } else {
      dataRes(res, req, false, null)
    }
  });

  app.get("/html/deleteModel/:model_id_delete", (req, res) => {
    const model_id = validateId(req.params.model_id);

    const model = modelController.getModelById(model_id);

    if (!model) {
      // Not found:
      return dataRes(res, req, true, null, false);
    }

    if (req.userPermissions < 4 || model.user._id.toString() !== req.user._id.toString()) {
      dataRes(res, req, false, null);

    } else {
      dataRes(res, req, true, {model_id: model_id});
    }
  });

  app.get("/html/models", async (req, res) => {
    if (req.userPermissions > 2) {
      if (!req.query.includeAbout || req.query.includeAbout !== "true") {
        // If includeAbout is not set or not true, default to false:
        req.query.includeAbout = "false";
      }

      const includeAbout = req.query.includeAbout === "true";

      try {
        const allModels = await modelController.getModels((includeAbout ? 3 : null));

        // Generate signed URLs for getting images from S3:
        const modelsWithSignedUrls = await Promise.all(allModels.map(async (model) => {
          const { _id, name, type, thumbnailKey, user } = model;

          const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: thumbnailKey,
          });

          const thumbnailUrl = await getSignedUrl(s3Client, command, { expiresIn: 3 * 24 * 60 * 60 }); // URL is valid for 3 days.

          return {
            _id: _id,
            name: name,
            type: type,
            thumbnail: thumbnailUrl,
            user: user,
          };
        }));

        fs.readFile(path.join(__dirname, "../about.txt"), 'utf8', function(err, fileData) {
          if (err) return res.status(500).end();

          dataRes(res, req, true, {about: fileData, models: modelsWithSignedUrls});
        });

      } catch(err) {
        res.status(500).end();
        console.log("Could not get all models from DB: ", err);
      }

    } else {
      dataRes(res, req, false, null);
    }
  });

  app.get("/html/justUserInfo", (req, res) => { // Used for pages like "report an issue" that don't have any dynamic content.
    if (req.userPermissions > 1) {
      dataRes(res, req, true, {});

    } else {
      dataRes(res, req, false, null);
    }
  });
};
