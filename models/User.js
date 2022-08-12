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
    default: "fan",
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
    default: false,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  guest: {
    type: String,
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
