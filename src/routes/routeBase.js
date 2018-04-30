//Import express and router
const express = require('express');
const route = express.Router();

//Import route files
const routeStudent = require('./routeStudent');
const routeCompany = require('./routeCompany');
const routeRegistration = require('./routeRegistration');

// Add routes
route.use('/student', routeStudent);
route.use('/company', routeCompany);
route.use('/register', routeRegistration)

// export related route
module.exports = route;
