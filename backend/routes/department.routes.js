const express = require("express");
const departmentController = require("../controllers/department.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("admin"),
    departmentController.getDepartments
);
module.exports = router;
