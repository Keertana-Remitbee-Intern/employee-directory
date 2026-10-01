const express = require("express");
const employeeController = require("../controllers/employee.controller");
const {createEmployeeValidator,updateEmployeeValidator} = require("../validators/employee.validator");
const validate = require("../middleware/validation.middleware");
const {authenticate,authorize} = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("admin", "employee"),
    employeeController.getEmployees
);
router.get(
    "/:id",
    authenticate,
    authorize("admin", "employee"),
    employeeController.getEmployee
);
router.post(
    "/",
    authenticate,
    authorize("admin"),
    createEmployeeValidator,
    validate,
    employeeController.createEmployee
);
router.patch(
    "/:id",
    authenticate,
    authorize("admin"),
    updateEmployeeValidator,
    validate,
    employeeController.updateEmployee
);
router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    employeeController.deleteEmployee
);
router.post(
    "/:id/photo",
    authenticate,
    authorize("admin"),
    upload.single("photo"),
    employeeController.uploadPhoto
);

module.exports = router;