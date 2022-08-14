const { dataRes } = require("../formattedResponses");
const { userController, modelController } = require("../controllers/index.js");
const { validateId } = require("../validators");
const path = require("path")
const fs = require("fs");

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
    try {
      let queried_id = validateId(req.params._id);
      let authorized = req.userPermissions > 2 && !req.user.guest;
      if (!authorized) {
        return dataRes(res, req, false, null);
        // Stop if unauthorized
      } else if (queried_id) {
        const user = await userController.getUserById(queried_id);
        const models = await userController.getUserModels(queried_id);
        let { _id, fullName, firstName, role, email, types, bio } = user;
        if (!user) { // No user found
          dataRes(res, req, true, null, false);
        } else if (user.pending) { // User pending
          dataRes(res, req, true, null, false);
        } else {
          let data;
          if (req.userPermissions === 6 || String(req.user._id) === String(_id)) { // Must convert to string before comparison because object ID's can be wierd
            data = {
              _id,
              name: fullName,
              role,
              email,
              types,
              bio,
              models,
            };
          } else {
            data = {
              _id,
              name: firstName,
              role,
              types,
              bio,
              models,
            };
          }
          dataRes(res, req, true, data);
        }
      } else {
        dataRes(res, req, true, null, false);
      }
    } catch {
      console.log("Could not get individual user from DB")
      res.status(500).end();
    }
  });

  app.get("/html/editAccount", async (req, res) => {
    if (req.userPermissions > 1 && !req.user.guest) {
      try {
        let { fullName, bio, email, complete, types } = await userController.getUserById(req.user._id);
        dataRes(res, req, true, {name: fullName, bio, email, complete, types});
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
      dataRes(res, req, true, {})
    } else {
      dataRes(res, req, false, null)
    }
  });

  app.get("/html/model/:_id", async (req, res) => {
    let queried_id = validateId(req.params._id);

    if (req.userPermissions > 2) {
      if (!queried_id) {
        dataRes(res, req, true, null, false);
      } else {
        try {
          let model = await modelController.getModelById(queried_id);
          if (!model) {
            // If no model, return not found
            return dataRes(res, req, true, null, false);
          }
          let { name, about, type, _id, facts, user, completionMonth, completionYear, images, deletedAt } = model;

          let data = {
            name,
            about,
            type,
            _id,
            facts,
            user: {
              name: user.firstName,
              role: user.role,
              _id: user._id,
            },
            completionMonth,
            completionYear,
            images,
            deletedAt,
          }

          if (user.pending || user.role === "fan") { // Owner pending or demoted to fan: show not found
            dataRes(res, req, true, null, false)
          } else {
            dataRes(res, req, true, data)
          }
        } catch {
          console.log("Could not ge individual model from DB")
          res.status(500).end();
        }
      }
    } else {
      dataRes(res, req, false, null)
    }
  })

  app.get("/html/deleteModel/:model_id", (req, res) => {
    const model_id = req.params.model_id;

    if (req.userPermissions < 4) {
      dataRes(res, req, false, null)
    } else if (!validateId(model_id)) {
      res.status(500).end()
    } else {
      dataRes(res, req, true, {model_id: model_id})
    }
  });

  app.get("/html/models", async (req, res) => {
    if (req.userPermissions > 2) {
      try {
        const data = await modelController.getModels();
        dataRes(res, req, true, data);
      } catch {
        console.log("Could not get all models from DB")
        res.status(500).end();
      }
    } else {
      dataRes(res, req, false, null);
    }
  });

  app.get("/html/about", (req, res) => {
    if (req.userPermissions > 2) {
      fs.readFile(path.join(__dirname, "../history.txt"), 'utf8', function(err, data) {
        if (err) return res.status(500).end();
        dataRes(res, req, true, {about: data})
      });
    } else {
      dataRes(res, req, false, null);
    }
  });

  app.get("/html/reportIssue", (req, res) => {
    if (req.userPermissions > 1) {
      dataRes(res, req, true, {})
    } else {
      dataRes(res, req, false, null)
    }
  })
};
