const mongoose = require("mongoose");

// Validation:
const textRgx = /([^A-z0-9~"'!@#$%^&*()_+={}[\]|\\:;,.?/-\s])+/g;
const paragraphRgx = /([^A-z0-9~"'!@#$%^&*()_+={}[\]|\\:;,.?/-\s])+/g;

// Checkers: makes sure email is an email and password is strong
const emailCheck =
  /^(([^<>()\[\]\\.,;:@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordCheck = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{9,}$/;

// !!! Validation for both Sign up and Log in (Cannot change, or at least cannot take away characters, otherwise some users may not be able to log into accounts):
const emailRgx = /([^A-z0-9'!@$%&()[\]|\\:,.?/-]]|[\^])+/g;
const maxPasswordLength = 64; // bcrypt has a max length of 72 but we'll stop at 64: a common max password length 

module.exports = {
  // Input Validation with specific Error Messages:
  validateText: (text, name = "text" /* What the error should be called in the error object */, errors = {}, max = 80) => {
    if (!text) {
      errors[name] = "This field is required";
      // If field doesn't exist we can't do the following checks, so return here and be done
      return null;
    }

    let message;
    text = text.trim();

    if (text.match(textRgx) || text.match("<") || typeof text !== "string") {
      message = "Sorry, only words, numbers, and necessary puncuation is allowed here";
    }
    if (text.length > max) {
      message = "This field is too long";
    }
    if (text.length < 3) {
      message = "This field is too short";
    }

    if (message) {
      errors[name] = message;
      return null;
    } else {
      return text;
    }
  },

  validateParagraph: (text, name, errors = {}, required = true) => { /* Only validator with "optional" support right now because I needed it */
    // If no text, set to blank:
    // This way, if was undefined, won't cause an error now. And if blank, will still be blank.
    if (!text) {
      text = "";
    }

    let message;
    text = text.trim();

    if (text.match(paragraphRgx) || typeof text !== "string") {
      message = "Sorry, only words, numbers, and necessary puncuation is allowed here";
    }
    if (text.length > 1000) {
      message = "This field is too long";
    }
    if (text.length < 20 && required) {
      message = "Enter at least 20 characters";
    }
    if (!text && required) {
      message = "This field is required";
    }

    if (message) {
      errors[name] = message;
      return null;
    } else {
      return text;
    }
  },

  validateNumber: (number, min, max, name, errors = {}) => {
    if (!number) {
      errors[name] = "Please enter a valid number";
      return null;
    }

    number = parseInt(number, 10);

    if (number > max || number < min) {
      errors[name] = `Please select a number within ${min} and ${max}`
      return null
    } else {
      return number
    }
  },

  validateOptions: (selectedOption, optionsArr, name, errors = {}) => {
    if (!selectedOption) {
      errors[name] = "This field is required";
      return null;
    }

    if (optionsArr.includes(selectedOption)) {
      return selectedOption;
    } else {
      errors[name] = "Nice try, but that option isn't available to you";
      return null;
    }
  },

  validateTags: (selectedTags, optionsArr, name, errors = {}) => {
    if (!selectedTags) {
      errors[name] = "This field is required";
      return null;
    }

    let usedTags = [];
    let error = false;
    if (Array.isArray(selectedTags)) { // "typeof" won't be sufficient here
      selectedTags.forEach((tag) => {
        if (!optionsArr.includes(tag) || usedTags.includes(tag)) {
          error = true;
        }
        usedTags.push(tag);
      });
      if (error || selectedTags.length < 1) {
        errors[name] = "Please enter at least one of the available tags";
        return null;
      } else {
        return selectedTags;
      }
    } else {
      errors[name] = "Invalid data type";
      return null;
    }
  },

  validateEmail: (email, name, errors = {}) => {
    if (!email) {
      errors[name] = "This field is required";
      return null;
    }

    let message;
    email = email.trim();

    if (!email.match(emailCheck)) {
      message = "Please enter a valid email";
    }
    if (email.length > 300) {
      message = "This field is too long";
    }
    if (email.match(emailRgx)) {
      message =
        "This email contains disallowed special characters or whitespace";
    }

    if (message) {
      errors[name] = message;
      return null;
    } else {
      return email;
    }
  },

  validatePassword: (password, name, errors = {}) => {
    if (!password) {
      errors[name] = "This field is required";
      return null;
    }

    let message;
    if (password.length < 9 || !password.match(passwordCheck)) {
      message = "Passwords must be at least 9 characters long, contain an upper/lowercase letter, and a number";
    }
    if (password.length > maxPasswordLength) {
      message = "We admire your password length but you've hit the max of 64 characters";
    }

    if (message) {
      errors[name] = message;
      return null;
    } else {
      return password;
    }
  },

  validateId: (_id) => {
    if (mongoose.Types.ObjectId.isValid(_id)) {
      return _id;
    } else {
      return null;
    }
  },

  // Login "Silent" Validators:
  validatePasswordForLogin: (password) => {
    if (!password) {
      return null;
    } else if (password.length > maxPasswordLength || typeof password != "string") {
      return null;
    } else {
      return password;
    }
  },

  validateEmailForLogin: (email) => {
    if (!email) {
      return null;
    } else if (email.trim().match(emailRgx)) {
      return null;
    } else {
      return email.trim();
    }
  },
};
