// Import required modules
const modelCompany = require('../models/modelCompany');

let controllerCreateCompany = function (request, response) {
  modelCompany.createCompany (request, response);
};

let controllerUpdateCompany = function (request, response) {
  modelCompany.updateCompany (request, response);
};

let controllerListCompanies = function (request, response) {
  modelCompany.listCompanies (request, response);
};

let controllerGetCompany = function (request, response) {
  modelCompany.getCompany (request, response);
};

let controllerDeleteCompany = function (request, response) {
  modelCompany.deleteCompany (request, response);
};

module.exports = {
  controllerCreateCompany,
  controllerUpdateCompany,
  controllerListCompanies,
  controllerGetCompany,
  controllerDeleteCompany
};