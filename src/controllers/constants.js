const ENUM_GENDER = ['male', 'female', 'other'];
const ENUM_BRANCH = ['CSE', 'IT', 'ECE', 'EEE', 'ICE'];
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