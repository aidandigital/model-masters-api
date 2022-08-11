module.exports = {
  errorRes: (res, errType, message = "An error occurred") => {
    // For API/submission errors
    // For validation errors, "error" is an object of errors
    let response = {
      success: false,
      errType: errType,
      message: message, // * or messages object
    };
    // Valid errTypes (For handling on the front end): validation, authorization, general, notloggedin
    res.json(response);
  },
  // Because API success responses are so lightweight I have not included them here

  dataRes: (res, req, authorized, data, found = true) => {
    // For getting html/data
    if (authorized) {
      res.json({
        currentUser: {
          userPermissions: req.userPermissions,
          role: req.user.role,
          _id: req.user._id,
          fullName: req.user.fullName,
          firstName: req.user.firstName,
        },
        authorized: true,
        found: found,
        data: data,
      });
    } else if (req.userPermissions == 2) {
      // ^ In the case that the user is incomplete, they will need an _id to edit their account till completion
      res.json({
        currentUser: {
          userPermissions: req.userPermissions,
          _id: req.user._id,
        },
        authorized: false,
      });
    }
    else {
      res.json({
        currentUser: {
          userPermissions: req.userPermissions,
        },
        authorized: false,
      });
    }
  },
};
