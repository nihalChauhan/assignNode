// Import required modules
const modelStudent = require('../models/modelStudent');

let controllerCreateStudent = function (request, response) {
  modelStudent.createStudent (request, response);
};

let controllerUpdateStudent = function (request, response) {
  modelStudent.updateStudent (request, response);
};

let controllerListStudents = function (request, response) {
  modelStudent.listStudents (request, response);
};

let controllerGetStudent = function (request, response) {
  modelStudent.getStudent (request, response);
};

module.exports = {
  controllerCreateStudent,
  controllerUpdateStudent,
  controllerListStudents,
  controllerGetStudent
};