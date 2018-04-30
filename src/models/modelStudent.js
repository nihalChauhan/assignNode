const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const utilDate = require('../utils/utilDate');
const winston = require('../utils/utilLogger');
const validator = require('validatorjs');
const constants = require('../controllers/constants');

let studentSchema = new Schema({
  createdAt: {
    type: Number,
    default: utilDate.now,
    index: true
  },
  firstName:  {
    type: String,
    default: "",
    required: true
  },
  middleName: {
    type: String,
    default: ""
  },
  lastName: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    index: true,
    lowercase: true
  },
  contactNumber: {
    type: String,
    index: true,
    required: true
  },
  dob: {
    type: String,
    required: true,
    default: null
  },
  gender: {
    type: String,
    default: 'male',
    enum: constants.ENUM_GENDER
  },
  branch: {
    type: String,
    required: true,
    enum: constants.ENUM_BRANCH
  },
  aggregate: {
    type: Number,
    required: true,
    min: [0, 'Aggregate score cannot be below 0'],
    max: [100, 'Aggregate score cannot be over 100']
  },
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

  let validation = new validator(request.body, rules);
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


studentSchema.statics.updateStudent = function (request, response) {
  let rules = {
    email: 'email',
    contactNumber: 'string|regex:/^[0-9]{10}$/',
    aggregate: 'required|numeric|max:100|min:0',
    branch: 'required|string',
    id: 'required|string'
  };

  let validation = new validator(request.body, rules);
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

  this.findOne({'_id': request.body.id}, (error, student) => {
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

    student.email = request.body.email ? request.body.email : student.email;
    student.contactNumber = request.body.contactNumber ? request.body.contactNumber : student.contactNumber;
    student.aggregate = request.body.aggregate ? request.body.aggregate : student.aggregate;
    student.branch = request.body.branch ? request.body.branch : student.branch;

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


studentSchema.statics.listStudents = function (request, response) {
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


studentSchema.statics.registerForCompany = function (request, response) {
  let rules = {
    studentId: 'required|string',
    companyId: 'required|string'
  };

  let validation = new validator(request.body, rules);
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
      if(!(company.allowedBranches.indexOf(student.branch)!==-1 && student.aggregate >= company.aggregateThreshold)) {
        return response.status(400).json({
          error: 'Ineligible',
          message: 'Student does not meet requirements'
        });
      }
      else {
        student = student.toObject();
        company = company.toObject();
        student.appliedCount++;
        company.applied.push(student.id);
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


studentSchema.statics.unRegisterForCompany = function (request, response) {
  let rules = {
    studentId: 'required|string',
    companyId: 'required|string'
  };

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
        student.appliedCount--;
        let index = company.applied.indexOf(student.id);
        company.applied.splice(index,1);
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


// Student model
let modelStudent = mongoose.model('Student', studentSchema);

module.exports = modelStudent;
