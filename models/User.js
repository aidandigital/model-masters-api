const mongoose = require("mongoose");
const Schema = mongoose.Schema;

function requireForNonGuests() {
  return !this.guest;
}

const User = new Schema({
  fullName: {
    type: String,
    required: requireForNonGuests,
  },
  firstName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: requireForNonGuests,
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
    required: requireForNonGuests,
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
      _id: false,
      ip: {
        type: String,
      },
      loginDates: [
        {type: Date}
      ],
    },
  ],
  hideIP: {
    type: Boolean,
  },
  models: [
    {
      type: Schema.Types.ObjectId, ref: 'Model', required: true,
    }
  ]
});

const UserModel = mongoose.model("User", User);
module.exports = UserModel;
