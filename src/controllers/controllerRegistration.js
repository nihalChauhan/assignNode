// Import required modules
const modelStudent = require('../models/modelStudent');

let controllerRegisterStudent = function (request, response) {
  modelStudent.registerForCompany (request, response);
};

let controllerUnRegisterStudent = function (request, response) {
  modelStudent.unRegisterForCompany (request, response);
};

module.exports = {
  controllerRegisterStudent,
  controllerUnRegisterStudent
};