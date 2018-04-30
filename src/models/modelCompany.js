const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const utilDate = require('../utils/utilDate');
const winston = require('../utils/utilLogger');
const validator = require('validatorjs');
const async = require('async');
const constants = require('../controllers/constants');


//Company Schema, stores all information regarding the company of relevance and a list of registered students.
let companySchema = new Schema({
  //timestamp for creation
  createdAt: {
    type: Number,
    default: utilDate.now,
    index: true
  },
  //name of company
  name:  {
    type: String,
    default: "",
    required: true
  },
  //email contact for company
  email: {
    type: String,
    index: true,
    lowercase: true,
    required: true
  },
  //contact number for company
  contactNumber: {
    type: String,
    index: true,
    required: true
  },
  //Required aggregate score to register
  aggregateThreshold: {
    type: Number,
    required: true,
    min: [0, 'Aggregate score cannot be below 0'],
    max: [100, 'Aggregate score cannot be over 100']
  },
  //List of students who have applied to company
  applied: [{
    type: String,
    ref: 'Profile'
  }],
  //List of all branches students are allowed from
  allowedBranches: [{
    type: String,
    enum: constants.ENUM_BRANCH
  }]
}, {runSettersOnQuery: true});


// Enable Mongoose getter functions
companySchema.set('toObject', {
  getters: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret.__v;
  }
});
companySchema.set('toString', {
  getters: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret.__v;
  }
});
companySchema.set('toJSON', {
  getters: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret.__v;
  }
});


//Function to create new student
companySchema.statics.createCompany = function (request, response) {
  //Set of rules for data validation using validator module
  let rules = {
    name: 'required|string',
    email: 'required|email',
    contactNumber: 'required|string|regex:/^[0-9]{10}$/',
    aggregateThreshold: 'required|numeric|max:100|min:0'
  };

  //validator instantiation with request body and set of rules to check against
  let validation = new validator(request.body, rules);
  //check if the validation fails
  if (validation.fails()) {
    winston.log('error', {
      error: 'Invalid input',
      action: 'company-Add'
    });
    return response.status(400).json({
      error: 'Invalid Attributes',
      message: 'Enter valid attribute values',
      errorCode: constants.ErrorCodes.INVALID_INPUT,
    });
  }

  //New company object to be initiated with received values
  let company = new this({
    name: request.body.name,
    email: request.body.email,
    contactNumber: request.body.contactNumber,
    aggregateThreshold: request.body.aggregateThreshold,
    allowedBranches: request.body.allowedBranches ? request.body.allowedBranches : constants.ENUM_BRANCH
  });

  //Save the company object instantiated earlier
  return company.save((error, company) => {
    if (error) {
      winston.log('error', {
        error: error,
        action: 'modeCompany-createCompany-save'
      });
      return response.status(400).json({
        error: error,
        message: 'Create Failed'
      });
    }
    company = company.toObject();
    delete company._id;
    return response.status(201).json({
      result: company
    });
  });
};


//Function to update the attributed of a company instance
companySchema.statics.updateCompany = function (request, response) {
  //Set of rules for data validation using validator module
  let rules = {
    name: 'string',
    email: 'email',
    contactNumber: 'string|regex:/^[0-9]{10}$/',
    aggregateThreshold: 'numeric|max:100|min:0',
    id: 'required',
    allowedBranches
  };

  //Validator instantiation
  let validation = new validator(request.body, rules);
  //Failure check on validator
  if (validation.fails()) {
    winston.log('error', {
      error: 'Invalid input',
      action: 'company-Add'
    });
    return response.status(400).json({
      error: 'Invalid Attributes',
      message: 'Enter valid attribute values',
      errorCode: constants.ErrorCodes.INVALID_INPUT,
    });
  }

  //Search for pre-existing company object to edit
  this.findOne({'_id': request.body.id}, (error, company) => {
    //check for error and send response if error
    if (error) {
      winston.log('error', {
        error: error,
        action: 'company-Edit-lookup'
      });
      return response.status(400).json({
        error: 'Internal Error',
        message: 'Unable to perform at this time',
        errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
      });
    }
    //check if company doesn't exist
    else if (!company) {
      winston.log('error', {
        error: 'Company Not Found',
        action: 'company-Edit-lookup',
        id: request.body.id
      });
      return response.status(400).json({
        error: 'Not found',
        message: 'No such company exists',
        errorCode: constants.ErrorCodes.INVALID_INPUT,
      });
    }

    //Optional reset on each editable attribute
    company.name = request.body.name ? request.body.name : company.name;
    company.email = request.body.email ? request.body.email : company.email;
    company.contactNumber = request.body.contactNumber ? request.body.contactNumber : company.contactNumber;
    company.aggregateThreshold = request.body.aggregateThreshold ? request.body.aggregateThreshold : company.aggregateThreshold;
    company.branch = request.body.branch ? request.body.branch : company.branch;
    company.allowedBranches = request.body.allowedBranches ? request.body.allowedBranches : company.allowedBranches;

    //update write in database
    this.update({'_id': request.body.id}, company, (error, result) => {
      if (error) {
        winston.log('error', {
          error: error,
          action: 'modeCompany-updateCompany-save'
        });
        return response.status(400).json({
          error: error,
          message: 'Update Failed'
        });
      }
      delete company._id;
      return response.status(201).json({
        result: company
      });
    });
  });
};


//Function to list all the companies in database
companySchema.statics.listCompanies = function (request, response) {
  //Set query, offset and import pagination module from utils
  let query = {};
  let modelUtils = require('./modelUtils');
  let offset = Number(request.query.offset ? request.query.offset : 0);
  return modelUtils.getPaginatedList(this,
      offset, query, -1,
      function (error, result) {
        if (error) {
          response.status(400).json({
            error: error,
            message: 'Unable to get list this time',
            errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM
          });
          return;
        }
        //Calculate count for query to manage paginated responses
        modelCompany.count(query, function (error, count) {
          let next = (count > (offset * process.env.DEFAULT_PAGE_SIZE + result.length)) ? true : false;
          return response.status(200).json({
            count: !error ? count : 100,
            result: result,
            next: next,
            offset: offset
          });
        });
      }
  );
};


//Function to get the information regarding a specific company using id
companySchema.statics.getCompany = function (request, response) {
  this.findOne({'_id': request.params.id}, (error, company) => {
    if (error) {
      winston.log('error', {
        error: error,
        action: 'company-Get-lookup'
      });
      return response.status(400).json({
        error: 'Internal Error',
        message: 'Unable to perform at this time',
        errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
      });
    }
    else if (!company) {
      winston.log('error', {
        error: 'Company Not Found',
        action: 'company-Edit-lookup',
        id: request.params.id
      });
      return response.status(400).json({
        error: 'Not found',
        message: 'No such company exists',
        errorCode: constants.ErrorCodes.INVALID_INPUT,
      });
    }
    company = company.toObject();
    delete company._id;
    return response.status(201).json({
      result: company
    });
  });
};


//Function to delete a company instance and hence un-register it from the placement program
companySchema.statics.deleteCompany = function (request, response) {
  //Lookup for the company object in database
  this.findOne({'_id': request.body.id}, (error, company) => {
    if (error) {
      winston.log('error', {
        error: error,
        action: 'company-delete-lookup'
      });
      return response.status(400).json({
        error: 'Internal Error',
        message: 'Unable to perform at this time',
        errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
      });
    }
    else if (!company) {
      winston.log('error', {
        error: 'Company Not Found',
        action: 'company-delete-lookup',
        id: request.body.studentId
      });
      return response.status(400).json({
        error: 'Not found',
        message: 'No such student exists',
        errorCode: constants.ErrorCodes.INVALID_INPUT,
      });
    }
    //check if applications are empty
    if (company.applied === []) {
      return this.remove({'_id': request.body.id}, (error) => {
        if(error) {
          winston.log('error', {
            error: error,
            action: 'company-delete-remove'
          });
          return response.status(400).json({
            error: 'Internal Error',
            message: 'Unable to perform at this time',
            errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
          });
        }
        return response.sendStatus(204);
      });
    }
    else {
      return this.remove({'_id': request.body.id}, (error) => {
        if(error) {
          winston.log('error', {
            error: error,
            action: 'company-delete-remove'
          });
          return response.status(400).json({
            error: 'Internal Error',
            message: 'Unable to perform at this time',
            errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
          });
        }
        //send back response without exiting the function so as to alter all applied counts on students
        response.sendStatus(204);
        let modelStudent = require('./modelStudent');
        //find all students who had registered to this company
        modelStudent.find({'_id': {$in: company.applied}}, (error, result) => {
          //asynchronous loop for iterating and updating through all the students who need to be updated
          return async.each(result, (s, callback) => {
            s.appliedCount--;
            modelStudent.update({'_id': s.id}, s, (error, result) => {
              if (error) {
                callback(error);
              }
              callback(null);
            });
          }, (error) => {
            if(error) {
              winston.log('error', {
                error: error,
                action: 'company-delete-updateStudent'
              });
            }
            return;
          });
        });
      });
    }
  });
};


// Company model
let modelCompany = mongoose.model('Company', companySchema);

module.exports = modelCompany;