const db = require("../models");

module.exports = {
  addModel: async (model, user_id) => {
    let newModel = await db.Model.create(model);

    await db.User.findByIdAndUpdate(user_id, {
      $push: { models: newModel._id },
    });

    return newModel;
  },

  updateModel: (_id, updatedFieldsObj) => db.Model.findByIdAndUpdate(_id, updatedFieldsObj),

  getModelById: async (_id) => {
    try {
      return db.Model.findById(_id).populate("user");
    } catch (err) {
      return false; // Not found
    }
  },

  deleteModelById: (_id) => db.Model.findByIdAndDelete(_id),

  getModels: (limit) => db.Model.aggregate([
    { $sort: { creationDate: -1 } }, // Send newest models first
    (limit ? { $limit: limit } : { $limit: 100 }),
    {
        $project: {
            _id: { $toObjectId: "$_id" }, // Must convert to object id for comparison below
            name: 1,
            type: 1,
            thumbnailKey: 1
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
                            $in: ["$$model_id", "$models"] // See if the model _id is in the "models" array
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
            thumbnailKey: 1,
            user: {
              name: "$user.firstName",
              _id: 1,
            }
        }
    }
  ])
};
