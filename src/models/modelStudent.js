const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const utilDate = require('../utils/utilDate');
const winston = require('../utils/utilLogger');
const validator = require('validatorjs');
const async = require('async');
const constants = require('../controllers/constants');

//Student Schema, stores all information regarding the student of relevance.
let studentSchema = new Schema({
  //timestamp for object creation
  createdAt: {
    type: Number,
    default: utilDate.now,
    index: true
  },
  //First Name of the student
  firstName:  {
    type: String,
    default: "",
    required: true
  },
  //Middle Name of the student
  middleName: {
    type: String,
    default: ""
  },
  //Last Name of the student
  lastName: {
    type: String,
    default: ""
  },
  //Valid email address of student
  email: {
    type: String,
    index: true,
    lowercase: true
  },
  //contactNumber of student
  contactNumber: {
    type: String,
    index: true,
    required: true
  },
  //Date of birth of student (yyyy-mm-dd)
  dob: {
    type: String,
    required: true,
    default: null
  },
  //Gender of student (male, female, other)
  gender: {
    type: String,
    default: 'male',
    enum: constants.ENUM_GENDER
  },
  //Branch of student academics
  branch: {
    type: String,
    required: true,
    enum: constants.ENUM_BRANCH
  },
  //Aggregate score of the student in academics
  aggregate: {
    type: Number,
    required: true,
    min: [0, 'Aggregate score cannot be below 0'],
    max: [100, 'Aggregate score cannot be over 100']
  },
  //Number of companies a student has applied to
  appliedCount: {
    type: Number,
    default: 0
  }
}, {runSettersOnQuery: true});


// Enable Mongoose getter functions
studentSchema.set('toObject', {
  getters: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret.__v;
  }
});
studentSchema.set('toString', {
  getters: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret.__v;
  }
});
studentSchema.set('toJSON', {
  getters: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret.__v;
  }
});

studentSchema.statics.createStudent = function (request, response) {
  //Set of rules for data validation using validator module
  let rules = {
    firstName: 'required|string',
    lastName: 'string',
    middleName: 'string',
    email: 'required|email',
    dob: 'required|date',
    contactNumber: 'required|string|regex:/^[0-9]{10}$/',
    gender: 'string',
    aggregate: 'required|numeric|max:100|min:0',
    branch: 'required|string'
  };

  //validator instantiation with request body and set of rules to check against
  let validation = new validator(request.body, rules);
  //check if the validation fails
  if (validation.fails()) {
    winston.log('error', {
      error: 'Invalid input',
      action: 'student-Add'
    });
    return response.status(400).json({
      error: 'Invalid Attributes',
      message: 'Enter valid attribute values',
      errorCode: constants.ErrorCodes.INVALID_INPUT,
    });
  }

  //New student object to be initiated with received values
  let student = new this({
    firstName: request.body.firstName,
    middleName: request.body.middleName,
    lastName: request.body.lastName,
    dob: request.body.dob,
    email: request.body.email,
    contactNumber: request.body.contactNumber,
    gender: request.body.gender,
    branch: request.body.branch,
    aggregate: request.body.aggregate
  });

  //Save the company object instantiated earlier
  return student.save((error, student) => {
    if (error) {
      winston.log('error', {
        error: error,
        action: 'modeStudent-createStudent-save'
      });
      return response.status(400).json({
        error: error,
        message: 'Create Failed'
      });
    }
    student = student.toObject();
    delete student._id;
    return response.status(201).json({
      result: student
    });
  });
};


//Function to update the attributed of a student instance
studentSchema.statics.updateStudent = function (request, response) {
  //Set of rules for data validation using validator module
  let rules = {
    email: 'email',
    contactNumber: 'string|regex:/^[0-9]{10}$/',
    aggregate: 'required|numeric|max:100|min:0',
    branch: 'required|string',
    id: 'required|string'
  };

  //Validator instantiation
  let validation = new validator(request.body, rules);
  //Failure check on validator
  if (validation.fails()) {
    winston.log('error', {
      error: 'Invalid input',
      action: 'student-Add'
    });
    return response.status(400).json({
      error: 'Invalid Attributes',
      message: 'Enter valid attribute values',
      errorCode: constants.ErrorCodes.INVALID_INPUT,
    });
  }

  //Search for pre-existing student object to edit
  this.findOne({'_id': request.body.id}, (error, student) => {
    //check for error and send response if error
    if (error) {
      winston.log('error', {
        error: error,
        action: 'student-Edit-lookup'
      });
      return response.status(400).json({
        error: 'Internal Error',
        message: 'Unable to perform at this time',
        errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
      });
    }
    //check if student doesn't exist
    else if (!student) {
      winston.log('error', {
        error: 'Student Not Found',
        action: 'student-Edit-lookup',
        id: request.body.id
      });
      return response.status(400).json({
        error: 'Not found',
        message: 'No such student exists',
        errorCode: constants.ErrorCodes.INVALID_INPUT,
      });
    }

    //Optional reset on each editable attribute
    student.email = request.body.email ? request.body.email : student.email;
    student.contactNumber = request.body.contactNumber ? request.body.contactNumber : student.contactNumber;
    student.aggregate = request.body.aggregate ? request.body.aggregate : student.aggregate;
    student.branch = request.body.branch ? request.body.branch : student.branch;

    //update write in database
    this.update({'_id': request.body.id}, student, (error, result) => {
      if (error) {
        winston.log('error', {
          error: error,
          action: 'modeStudent-updateStudent-save'
        });
        return response.status(400).json({
          error: error,
          message: 'Update Failed'
        });
      }
      delete student._id;
      return response.status(201).json({
        result: student
      });
    });
  });
};


//Function to list all the companies in database
studentSchema.statics.listStudents = function (request, response) {
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
        modelStudent.count(query, function (error, count) {
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


//Function to get the information regarding a specific student using id
studentSchema.statics.getStudent = function (request, response) {
  this.findOne({'_id': request.params.id}, (error, student) => {
    if (error) {
      winston.log('error', {
        error: error,
        action: 'student-Get-lookup'
      });
      return response.status(400).json({
        error: 'Internal Error',
        message: 'Unable to perform at this time',
        errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
      });
    }
    else if (!student) {
      winston.log('error', {
        error: 'Student Not Found',
        action: 'student-Edit-lookup',
        id: request.params.id
      });
      return response.status(400).json({
        error: 'Not found',
        message: 'No such student exists',
        errorCode: constants.ErrorCodes.INVALID_INPUT,
      });
    }
    student = student.toObject();
    delete student._id;
    return response.status(201).json({
      result: student
    });
  });
};


//Function to register a student for a company
studentSchema.statics.registerForCompany = function (request, response) {
  //Set of rules to validate api request
  let rules = {
    studentId: 'required|string',
    companyId: 'required|string'
  };

  //Validator instantiation for the data against set of rules
  let validation = new validator(request.body, rules);
  //Check for validation faliure
  if (validation.fails()) {
    winston.log('error', {
      error: 'Invalid input',
      action: 'student-Add'
    });
    return response.status(400).json({
      error: 'Invalid Attributes',
      message: 'Enter valid attribute values',
      errorCode: constants.ErrorCodes.INVALID_INPUT,
    });
  }

  //Lookup student
  return this.findOne({'_id': request.body.studentId}, (error, student) => {
    if (error) {
      winston.log('error', {
        error: error,
        action: 'student-register-lookup'
      });
      return response.status(400).json({
        error: 'Internal Error',
        message: 'Unable to perform at this time',
        errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
      });
    }
    else if (!student) {
      winston.log('error', {
        error: 'Student Not Found',
        action: 'student-register-lookup',
        id: request.body.studentId
      });
      return response.status(400).json({
        error: 'Not found',
        message: 'No such student exists',
        errorCode: constants.ErrorCodes.INVALID_INPUT,
      });
    }
    //Lookup company
    let modelCompany = require('./modelCompany');
    return modelCompany.findOne({'_id': request.body.companyId}, (error, company) => {
      if (error) {
        winston.log('error', {
          error: error,
          action: 'student-register-company-lookup'
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
          action: 'student-register-company-lookup',
          id: request.body.companyId
        });
        return response.status(400).json({
          error: 'Not found',
          message: 'No such company exists',
          errorCode: constants.ErrorCodes.INVALID_INPUT,
        });
      }
      //Check if the student belongs to allowed branches and has an aggregate over the threshold
      if(!(company.allowedBranches.indexOf(student.branch)!==-1 && student.aggregate >= company.aggregateThreshold)) {
        return response.status(400).json({
          error: 'Ineligible',
          message: 'Student does not meet requirements'
        });
      }
      else {
        student = student.toObject();
        company = company.toObject();
        //edit student and company objects
        student.appliedCount++;
        company.applied.push(student.id);
        //update on user object
        return this.update({'_id': student.id}, student, (error, result) => {
          if (error) {
            winston.log('error', {
              error: error,
              action: 'modeStudent-register-updateStudent-save'
            });
            return response.status(400).json({
              error: error,
              action: 'modeStudent-register-updateStudent-save',
              message: 'Registration Failed'
            });
          }
          //update on company object
          return modelCompany.update({'_id': company.id}, company, (error, result) => {
            if (error) {
              winston.log('error', {
                error: error,
                action: 'modeStudent-register-updateCompany-save'
              });
              return response.status(400).json({
                error: error,
                action: 'modeStudent-register-updateStudent-save',
                message: 'Registration Failed'
              });
            }
            return response.status(201).json({
              success: true
            });
          });
        });
      }
    });
  });
};


//Function to un register the student for the company
studentSchema.statics.unRegisterForCompany = function (request, response) {
  //Rules to validate the request made
  let rules = {
    studentId: 'required|string',
    companyId: 'required|string'
  };
  //instantiation of the validator with said rules against request.body
  let validation = new validator(request.body, rules);
  if (validation.fails()) {
    winston.log('error', {
      error: 'Invalid input',
      action: 'student-UnRegister'
    });
    return response.status(400).json({
      error: 'Invalid Attributes',
      message: 'Enter valid attribute values',
      errorCode: constants.ErrorCodes.INVALID_INPUT,
    });
  }
  //find Student
  return this.findOne({'_id': request.body.studentId}, (error, student) => {
    if (error) {
      winston.log('error', {
        error: error,
        action: 'student-unRegister-lookup'
      });
      return response.status(400).json({
        error: 'Internal Error',
        message: 'Unable to perform at this time',
        errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
      });
    }
    else if (!student) {
      winston.log('error', {
        error: 'Student Not Found',
        action: 'student-unRegister-lookup',
        id: request.body.studentId
      });
      return response.status(400).json({
        error: 'Not found',
        message: 'No such student exists',
        errorCode: constants.ErrorCodes.INVALID_INPUT,
      });
    }
    //find company
    let modelCompany = require('./modelCompany');
    return modelCompany.findOne({'_id': request.body.companyId}, (error, company) => {
      if (error) {
        winston.log('error', {
          error: error,
          action: 'student-register-company-lookup'
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
          action: 'student-register-company-lookup',
          id: request.body.companyId
        });
        return response.status(400).json({
          error: 'Not found',
          message: 'No such company exists',
          errorCode: constants.ErrorCodes.INVALID_INPUT,
        });
      }
      if(company.applied.indexOf(student.id)===-1) {
        return response.status(400).json({
          error: 'No Registration found',
          message: 'No registration exists',
          errorCode: constants.ErrorCodes.INVALID_INPUT,
        });
      }
      else {
        student = student.toObject();
        company = company.toObject();
        //Edit student and company object values
        student.appliedCount--;
        let index = company.applied.indexOf(student.id);
        company.applied.splice(index,1);
        //Save student object in db
        return this.update({'_id': student.id}, student, (error, result) => {
          if (error) {
            winston.log('error', {
              error: error,
              action: 'modeStudent-unRegister-updateStudent-save'
            });
            return response.status(400).json({
              error: error,
              action: 'modeStudent-unRegister-updateStudent-save',
              message: 'Un-Registration Failed'
            });
          }
          //Save company object in db
          return modelCompany.update({'_id': company.id}, company, (error, result) => {
            if (error) {
              winston.log('error', {
                error: error,
                action: 'modeStudent-unRegister-updateCompany-save'
              });
              return response.status(400).json({
                error: error,
                action: 'modeStudent-unRegister-updateStudent-save',
                message: 'Un-Registration Failed'
              });
            }
            return response.status(201).json({
              success: true
            });
          });
        });
      }
    });
  });
};


//Function to delete a student instance and hence un-register it from all companies it registered for
studentSchema.statics.deleteStudent = function (request, response) {
  //Lookup for the student object in database
  this.findOne({'_id': request.body.id}, (error, student) => {
    if (error) {
      winston.log('error', {
        error: error,
        action: 'student-delete-lookup'
      });
      return response.status(400).json({
        error: 'Internal Error',
        message: 'Unable to perform at this time',
        errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
      });
    }
    else if (!student) {
      winston.log('error', {
        error: 'Student Not Found',
        action: 'student-delete-lookup'
      });
      return response.status(400).json({
        error: 'Not found',
        message: 'No such student exists',
        errorCode: constants.ErrorCodes.INVALID_INPUT,
      });
    }
    //check if applications are 0
    if (student.appliedCount === 0) {
      return this.remove({'_id': request.body.id}, (error) => {
        if(error) {
          winston.log('error', {
            error: error,
            action: 'student-delete-remove'
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
            action: 'student-delete-remove'
          });
          return response.status(400).json({
            error: 'Internal Error',
            message: 'Unable to perform at this time',
            errorCode: constants.ErrorCodes.UNABLE_TO_PERFORM,
          });
        }
        //send back response without exiting the function so as to alter all company models where student registered
        response.sendStatus(204);
        let modelCompany = require('./modelCompany');
        //find all companies the student applied for
        modelCompany.find({'applied': {$elemMatch: {$eq: student.id}}}, (error, result) => {
          //asynchronous loop for iterating and updating through all the companies who need to be updated
          return async.each(result, (c, callback) => {
            let index = c.applied.indexOf(student.id);
            c.applied.splice(index,1);
            modelCompany.update({'_id': c.id}, c, (error, result) => {
              if (error) {
                callback(error);
              }
              callback(null);
            });
          }, (error) => {
            if(error) {
              winston.log('error', {
                error: error,
                action: 'student-delete-updateCompany'
              });
            }
            return;
          });
        });
      });
    }
  });
};


// Student model
let modelStudent = mongoose.model('Student', studentSchema);

module.exports = modelStudent;
