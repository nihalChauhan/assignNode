// import related modules
let controllerCompany = require('../controllers/controllerCompany');
let router = require('express').Router();
let middlewareSuperAuthCheck = require('../middlewares/middlewareSuperAuthCheck');

router.post("/create", middlewareSuperAuthCheck,controllerCompany.controllerCreateCompany);
router.put("/update", middlewareSuperAuthCheck,controllerCompany.controllerUpdateCompany);
router.get("/list", middlewareSuperAuthCheck,controllerCompany.controllerListCompanies);
router.get("/:id", middlewareSuperAuthCheck,controllerCompany.controllerGetCompany);
router.delete("/", middlewareSuperAuthCheck, controllerCompany.controllerDeleteCompany);

// export related methods
module.exports = router;