################################################################################
Authors: Nihal Chauhan (nihalchauhan16@gmail.com)

Date: 1st May 2018

API POSTMAN collection : https://www.getpostman.com/collections/a5888344026ff9a6050e

################################################################################
Coding Convention:
  1. Use camelCase
  
  2. Every module name in package must start with package name. For example
      you have to write a module for User in package "models" then module file
      name must be "modelsStudent" and if the package name is "controller" then
      module file name must be "controllerStudent". @NOTE: here constants.js in
      controllers is exception.
 
  3. HTTP Status Code convention:-
    200: request is OK and fulfilled, Get and Put requests mostly.
    201: new record created, post request mostly.
    204: no content, delete calls mostly.
    401: Use auth header, to protect resources.
    
################################################################################
How To Setup:
  1. First create "logs" directory in parent directory.
  2. Then create .env file in parent directory.
  3. Run "npm install"  // This will install dependencies.
  4. Setup MongoDB server add uri to .env file and Run "node src". 

################################################################################
Tech Stack:
  We are using NodeJs with ExpressJs framework, MongoDB as primary database

################################################################################
API Structure:-
  Note: Return 401 in case invalid authToken.
  A) Below is the errors response structure.
    {
      error: "It could be string or list or object.",
      message: "It must be a string. Frontend will show this to user.",
      errorCode: "Unique codes. Depends on user input and db response. These must be set in controller/constants.js"
    }
  B) Success result, a list, we are using offset to paginate result
    {
      result: [
      {
        This will be object here
      },
      {
        ...
      }
      ],
      count: "This will be an integer",
      next: boolean # Will tell about whether to make next call or not?
      nextOffset: Integer # Will tell about next offset value.
    }
  C) Success result, Single object, a valid object
    {
      result: {
        Object will come here.
      }
    }
  D) Success result, no data to return
    {
      success: true
    }

################################################################################
Project Structure:
  This project contains almost all source files in src folder. For environment
  I am using "dotenv" package, https://github.com/motdotla/dotenv.
  
  In src folder you will get 5 main folders, named
    1. controllers: contains all functions related to business logic. All module
      name must start with "controller".
    2. models: contains all functions and related to DB and also the DB related
      methods. All module name must start with "model".
    3. routes: contains routes related modules and bind endpoints to
      controllers. All module name must start with "route".
    4. middleware: contains middleware modules. All module name must start with
      "middleware".
    5. utils: contains common utils modules. All module name must start with
      "util".
    
    Apart from that there is a main file called "index.js". It is the entry
    point of this project. Please first read that file.

################################################################################
Models Schema:
  Using MongoDB as primary database.

################################################################################