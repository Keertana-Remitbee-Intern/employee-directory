const employeeService = require("../services/employee.service");
const logger = require("../middleware/logger.middleware");
  
const sanitizeEmployee = (employee) => ({
    id: employee.id,
    employee_id: employee.employee_id,
    name: employee.name,
    email: employee.email,
    department: employee.department,
    department_id: employee.department_id,
    salary: employee.salary,
    joining_date: employee.joining_date,
    role: employee.role,
    photo: employee.photo
});

exports.getEmployees = async (req, res, next) => {
    try {
        const employees = await employeeService.getAllEmployees();

        res.status(200).json({
            count: employees.length,
            employees: employees.map(sanitizeEmployee)
        });
    } catch (error) {
        next(error);
    }
};

exports.getEmployee = async (req, res, next) => {
    try {
        const employee = await employeeService.getEmployeeById(
            req.params.id
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json(sanitizeEmployee(employee));
    } catch (error) {
        next(error);
    }
};

exports.createEmployee = async (req, res, next) => {
    try {
        const employee = await employeeService.createEmployee(
            req.body
        );

        logger.info("Employee created", {
            employeeId: employee.id
        });

        res.status(201).json({
            message: "Employee created successfully",
            employee: sanitizeEmployee(employee)
        });
    } catch (error) {
        if (error.statusCode === 409) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        next(error);
    }
};

exports.updateEmployee = async (req, res, next) => {
    try {
        const employee = await employeeService.updateEmployee(
            req.params.id,
            req.body
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        logger.info("Employee updated", {
            employeeId: employee.id
        });

        res.status(200).json({
            message: "Employee updated successfully",
            employee: sanitizeEmployee(employee)
        });
    } catch (error) {
        if (error.statusCode === 409) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }
        next(error);
    }
};

exports.deleteEmployee = async (req, res, next) => {
    try {
        const deleted = await employeeService.deleteEmployee(
            req.params.id
        );

        if (!deleted) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        logger.info("Employee deleted", {
            employeeId: req.params.id
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.uploadPhoto = async (req, res, next) => {
    try {
        const employee = await employeeService.getEmployeeById(
            req.params.id
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Profile photo is required"
            });
        }

        const photoPath = `/uploads/${req.file.filename}`;

        const updatedEmployee =
            await employeeService.updateEmployeePhoto(
                req.params.id,
                photoPath
            );

        logger.info("Profile photo uploaded", {
            employeeId: updatedEmployee.id,
            filename: req.file.filename
        });

        res.status(200).json({
            message: "Profile photo uploaded successfully",
            employee: sanitizeEmployee(updatedEmployee)
        });
    } catch (error) {
        next(error);
    }
};