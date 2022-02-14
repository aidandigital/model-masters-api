const db = require("../models");
const mongoose = require("mongoose")

module.exports = {
  addModel: async (model, user_id) => {
    try {
      let newModel = await db.Model.create(model);
      await db.User.findByIdAndUpdate(user_id, {
        $push: { models: newModel._id },
      });
      return newModel._id;
    } catch {
      return false;
    }
  },

  getModelById: async (_id) => {
    try {
      let model = await db.Model.findById(_id).populate("user");
      return model;
    } catch {
      console.log("Could not find model in DB");
      return false;
    }
  },

  deleteModelById: (_id) => db.Model.findByIdAndDelete(_id),

  getModels: () => db.Model.aggregate([
    {
        $project: {
            _id: { $toObjectId: "$_id" }, // Must convert to object id for comparison below
            name: 1,
            type: 1,
            thumbnail: {
                $arrayElemAt: ["$images", 0] // Get first element in images array, assign to "image" field in resultant
            },
        }
    },
    {
        $lookup: { // Must use lookup because we need to populate before we do other aggregations
            from: "users",
            let: { "model_id": "$_id" }, // Variable from this collection (models) to compare in custom pipeline below
            pipeline: [ // Use custom lookup pipeline because our foreignField is inside an array
                {
                    $match: {
                        $expr: { // Accesses fields of the collection in question (users), we are accessing the "models" field
                            $in: ["$$model_id", "$models"] // See if the model id is in the "models" array
                        }
                    }
                }
            ],
            as: "user" // Store as "user" in the resultant documents
        },
    },
    {
        $unwind: "$user" // Deconstruct items from resultant array of $lookup above
    },
    {
        $match: {
            $and: [
                {$expr: {
                    $eq: ["$user.pending", false]
                }},
                {$expr: {
                    $ne: ["$user.role", "fan"]
                }}
            ]
        }
    },
    {
        $project: { // Project everything as before and only the name of the owner (user field)
            _id: 1,
            name: 1,
            type: 1,
            thumbnail: 1,
            user: {
              name: "$user.firstName",
              _id: 1,
            }
        }
    }
  ])
};
