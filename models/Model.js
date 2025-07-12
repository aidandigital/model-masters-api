const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Model = new Schema({
  name: {
    type: String,
    required: true,
  },
  completionMonth: {
    type: String,
    required: true,
  },
  completionYear: {
    type: Number,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  facts: [
        {
          type: String,
        }
    ],
  type: {
    type: String,
    required: true,
  },
  imageFolderId: {
    type: String,
    required: true,
  },
  imageKeys: [
    {
      type: String,
    }
  ],
  thumbnailKey: {
    type: String,
    required: true,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Schema.Types.ObjectId, ref: 'User', required: true,
  }
});

const ModelModel = mongoose.model("Model", Model);
module.exports = ModelModel;