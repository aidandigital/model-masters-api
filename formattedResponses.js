module.exports = {
  // For API route errors:
  errorRes: (res, errType, message = "An error occurred, please try again later") => {
    // For validation errors, "error" is an object of errors.
    let response = {
      success: false,
      errType: errType,
      message: message, // or messages object.
    };
    // Valid errTypes (For handling on the front end): validation, authorization, general, notloggedin.
    res.json(response);
  },

  // For API route success responses:
  successRes: (res, data = null) => {
    res.json({
      success: true,
      // API route success responses are very lightweight since they usually don't include data.
      data: data,
    });
  },

  // Because API route success responses are so lightweight (they usually don't include data) I have not included them here.
  // They just look like: res.json({ success: true });

  // For HTML route responses:
  dataRes: (res, req, authorized, data, found = true) => {
    if (authorized) {
      res.json({
        currentUser: {
          userPermissions: req.userPermissions,
          role: req.user.role,
          _id: req.user._id,
          fullName: req.user.fullName,
          firstName: req.user.firstName,
          guest: req.user.guest ? req.user.guest : false,
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
