// import related modules
let controllerRegistration = require('../controllers/controllerRegistration');
let router = require('express').Router();
let middlewareSuperAuthCheck = require('../middlewares/middlewareSuperAuthCheck');

//endpoint registrations for registrations and un-register
router.post("/", middlewareSuperAuthCheck,controllerRegistration.controllerRegisterStudent);
router.delete("/", middlewareSuperAuthCheck,controllerRegistration.controllerUnRegisterStudent);

// export related methods
module.exports = router;