const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  bio: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  types: [
    {
      type: String,
    },
  ],
  pending: {
    type: Boolean,
    default: true,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  ips: [
    {
      type: String,
    },
  ],
  models: [
    {
      type: Schema.Types.ObjectId, ref: 'Model', required: true,
    }
  ]
});

const UserModel = mongoose.model("User", User);
module.exports = UserModel;
