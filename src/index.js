const fs = require('fs');
const dotenv = require('dotenv');
let envConfig;
envConfig = dotenv.parse(fs.readFileSync(__dirname + "/../.env"));
for (let k in envConfig) {
  process.env[k] = envConfig[k]
}

/*
 Import model connection just to establish model connection
 */
require("./connections/mongoConnection");

// import related modules
const path = require("path");
const express = require('express');
const app = express();
const winston = require("./utils/utilLogger");
const cors = require('cors');

app.use(cors());
app.disable('x-powered-by');

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/*
 - Define the base route.
 - Set the base routes to /api/ path
 */
let baseRoute = require('./routes/routeBase');
app.use(process.env.API_VERSION, baseRoute);
winston.log("info", "Base API is: " + process.env.API_VERSION);

app.listen(process.env.NODE_SERVER_PORT, function(){
  winston.log("info", "Server is running at port " + process.env.NODE_SERVER_PORT);
});