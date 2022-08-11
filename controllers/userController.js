const db = require("../models");
const mongoose = require("mongoose");

module.exports = userController = {
  getUsers: async (adminView = false) => {
    let users;
    if (adminView) {
      users = await db.User.find(
        { role: { $in: ["fan", "member", "master", "admin"] } },
        { fullName: 1, role: 1, _id: 1, pending: 1, email: 1 }
      );
    } else {
      users = await db.User.find(
        { role: { $in: ["fan", "member", "master", "admin"] }, pending: false },
        { firstName: 1, role: 1, _id: 1 }
      );
    }
    let returned = {
      admins: [],
      masters: [],
      members: [],
      fans: [],
    };
    users.forEach((user) => {
      if (adminView) {
        let { fullName, role, _id, pending, email } = user;
        returned[user.role + "s"].push({name: fullName, role, _id, pending, email})
      } else {
        let { firstName, role, _id } = user;
        returned[user.role + "s"].push({name: firstName, role, _id})
      }
    });
    return returned;
  },

  checkEmailAvailability: async (email) => {
    const existingUser = await db.User.findOne({ email: email });
    if (existingUser) {
      return false;
    } else {
      return true;
    }
  },

  getUserByEmail: (email) => db.User.findOne({ email: email }),

  getUserById: async (_id) => {
    try {
      let result = await db.User.findById(_id)
      return result;
    } catch {
      console.log("Could not find user in DB")
      return false;
    }
  },

  addUser: (newUser) => db.User.create(newUser),

  addUserIP: async (_id, ip) => {
    const user = await db.User.findById(_id);
    if (user.ips.includes(ip)) {
      return; // IP array already contains this IP, do nothing
    } else {
      user.ips.push(ip);
      user.save();
    }
  },

  changeUserRole: async (_id, type) => {
    let user = await db.User.findById(_id);
    if (!user) {
      return "Cannot find user";
    }
    let roles = ["fan", "member", "master", "admin"];
      if (type === "promote" && user.role !== "admin") {
        await db.User.findByIdAndUpdate(_id, {
          role: roles[roles.indexOf(user.role) + 1],
        });
        return "Successfully promoted";
      } else if (type === "promote" && user.role === "admin") {
        return "Cannot promote anymore";
      }
      if (type === "demote" && user.role !== "fan") {
        await db.User.findByIdAndUpdate(_id, {
          role: roles[roles.indexOf(user.role) - 1],
        });
        return "Successfully demoted";
      } else if (type === "demote" && user.role === "fan") {
        return "Cannot demote anymore";
      }
  },

  changeUserPending: async (_id) => {
    let user = await db.User.findById(_id);
    if (!user) {
      return null;
    }
    await db.User.findByIdAndUpdate(_id, {
      pending: !user.pending,
    });
    if (user.pending) {
      return "approved";
    } else {
      return "disapproved";
    }
  },

  updateUser: (_id, updatedFieldsObj) => db.User.findByIdAndUpdate(_id, updatedFieldsObj),

  getUserModelIds: async (user_id) => {
    let working_id = await mongoose.Types.ObjectId(user_id);
    let result = await db.User.aggregate(
      [ 
        { $match : { _id : working_id }},
        { $project: { models: 1 }},
      ]
    );
    return result[0].models;
  },

  removeModelIdFromUser: (user_id, model_id) => db.User.findByIdAndUpdate(user_id, { $pull: {models: model_id}}),

  getUserModels: async (_id) => {
    try {
      const user = await db.User.findOne({
        _id: _id,
        pending: false,
        role: {
          $ne: "fan"
        }
      })
      if (user) {
        const result = user.populate("models");
        let models = [];
        result.models.forEach((model) => {
          let { name, _id, images, type } = model;
          models.push({name, _id, thumbnail: images[0], type});
        });
        return models;
      }
    } catch {
      console.log("Could not find user's models in DB")
    }
    return null;
  },
};
