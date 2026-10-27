const express = require("express");
const employeeController = require("../controllers/employee.controller");
const {createEmployeeValidator,updateEmployeeValidator} = require("../validators/employee.validator");
const validate = require("../middleware/validation.middleware");
const {authenticate,authorize} = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management endpoints
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *       401:
 *         description: Access token required
 *       403:
 *         description: Access denied
 */

router.get(
    "/",
    authenticate,
    authorize("admin", "employee"),
    employeeController.getEmployees
);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Access token required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Employee not found
 */
router.get(
    "/:id",
    authenticate,
    authorize("admin", "employee"),
    employeeController.getEmployee
);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create a new employee
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeRequest'
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       401:
 *         description: Access token required
 *       403:
 *         description: Only administrators can create employees
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation failed
 */
router.post(
    "/",
    authenticate,
    authorize("admin"),
    createEmployeeValidator,
    validate,
    employeeController.createEmployee
);

/**
 * @swagger
 * /api/employees/{id}:
 *   patch:
 *     summary: Update an employee
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *         example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeUpdateRequest'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       401:
 *         description: Access token required
 *       403:
 *         description: Only administrators can update employees
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation failed
 */
router.patch(
    "/:id",
    authenticate,
    authorize("admin"),
    updateEmployeeValidator,
    validate,
    employeeController.updateEmployee
);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       204:
 *         description: Employee deleted successfully
 *       401:
 *         description: Access token required
 *       403:
 *         description: Only administrators can delete employees
 *       404:
 *         description: Employee not found
 */
router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    employeeController.deleteEmployee
);

/**
 * @swagger
 * /api/employees/{id}/photo:
 *   post:
 *     summary: Upload employee profile photo
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *         example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *       400:
 *         description: Invalid file or photo missing
 *       401:
 *         description: Access token required
 *       403:
 *         description: Only administrators can upload photos
 *       404:
 *         description: Employee not found
 */
router.post(
    "/:id/photo",
    authenticate,
    authorize("admin"),
    upload.single("photo"),
    employeeController.uploadPhoto
);

module.exports = router;