//Enumeration for Gender attribute
const ENUM_GENDER = ['male', 'female', 'other'];
//Enumeration for branch attribute
const ENUM_BRANCH = ['CSE', 'IT', 'ECE', 'EEE', 'ICE'];
//Unique Error codes for different types of errors
const ErrorCodes = {
  INVALID_INPUT: 1001,
  DUPLICATE: 1002,
  INVALID_CREDENTIALS: 1003,
  UNABLE_TO_PERFORM: 1004
};

module.exports = {
  ENUM_GENDER,
  ENUM_BRANCH,
  ErrorCodes
};