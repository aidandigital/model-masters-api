module.exports = {
  User: require("./User"),
  Model: require("./Model"),
};

// Schema is not to be used as a method of validation/sanitization.
// Validation/sanitization is to be done by my custom functions before being entered into the DB
