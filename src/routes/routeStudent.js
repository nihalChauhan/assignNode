// import related modules
let controllerStudent = require('../controllers/controllerStudent');
let router = require('express').Router();
let middlewareSuperAuthCheck = require('../middlewares/middlewareSuperAuthCheck');

router.post("/create", middlewareSuperAuthCheck,controllerStudent.controllerCreateStudent);
router.put("/update", middlewareSuperAuthCheck,controllerStudent.controllerUpdateStudent);
router.get("/list", middlewareSuperAuthCheck,controllerStudent.controllerListStudents);
router.get("/:id", middlewareSuperAuthCheck,controllerStudent.controllerGetStudent);

// export related methods
module.exports = router;

