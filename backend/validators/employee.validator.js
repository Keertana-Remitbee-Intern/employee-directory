const { body } = require("express-validator");
exports.createEmployeeValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Enter a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("department_id")
        .notEmpty()
        .withMessage("Department is required")
        .isInt({ min: 1 })
        .withMessage("Department ID must be a positive integer"),

    body("salary")
        .notEmpty()
        .withMessage("Salary is required")
        .isFloat({ min: 0 })
        .withMessage("Salary must be a non-negative number"),

    body("joining_date")
        .notEmpty()
        .withMessage("Joining date is required")
        .isISO8601({ strict: true })
        .withMessage("Joining date must be a valid date")
];

exports.updateEmployeeValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters"),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Enter a valid email"),

    body("department_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Department ID must be a positive integer"),

    body("salary")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Salary must be a non-negative number"),

    body("joining_date")
        .optional()
        .isISO8601({ strict: true })
        .withMessage("Joining date must be a valid date")
];
