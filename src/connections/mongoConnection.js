// Import logger library
const winston = require('../utils/utilLogger');

// Import mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, function(error){
  // Connection error established.
  if (error){
    winston.log('error', {
      error: 'Connection error at: ' + process.env.MONGO_URI,
      action: 'mongoConnection-connect-mongoose'
    });
    throw(error);
  }
});


// Create connection object.
const db = mongoose.connection;

db.on('error', function(error) {
  winston.log('error', {
    error: 'connection error on: ' + process.env.MONGO_URI + ' \nerror is: ' + error.message,
    action: 'mongoConnection-errorOn-db'
  });
});

db.on('disconnected', function(error) {
  winston.log('error', {
    error: 'disconnected on: ' + process.env.MONGO_URI,
    action: 'mongoConnection-disconnectedOn-db'
  });
});

db.on('connected', function() {
  winston.log('info', 'connected on: ' + process.env.MONGO_URI);
});

db.on('open', function(message) {
  winston.log('info', 'connection established on: ' + process.env.MONGO_URI);
});

db.on('index', function(error, message) {
  if (error) {
    winston.log("error", 'ensure index raised error: ' + error + " \n on db: " + process.env.MONGO_URI);
  } else {
    winston.log('info', 'index ensured, message: ' + message + ' on db: ' + process.env.MONGO_URI);
  }
});

// Set debug level
mongoose.set('debug', (process.env.MONGOOSE_DEBUG === 'true')? true: false);

// Export on module level.
module.exports = db;