const bcrypt = require("bcrypt");
const employeeService = require("../services/employee.service");
const logger = require("../middleware/logger.middleware");

const sanitizeEmployee = (employee) => {
    return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        photo: employee.photo
    };
};

exports.getEmployees = (req, res) => {
    const employees = employeeService.getAllEmployees();
    res.status(200).json({
        count: employees.length,
        employees: employees.map(sanitizeEmployee)
    });
};

exports.getEmployee = (req, res) => {
    const employee = employeeService.getEmployeeById(
        req.params.id
    );
    if (!employee) {
        return res.status(404).json({
            message: "Employee not found"
        });
    }
    res.status(200).json(
        sanitizeEmployee(employee)
    );
};

exports.createEmployee = async (req, res, next) => {
    try {
        const existingEmployee =
            employeeService
                .getAllEmployees()
                .find(
                    employee =>
                        employee.email === req.body.email
                );
        if (existingEmployee) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(
            req.body.password,
            10
        );
        const employee =
            employeeService.createEmployee({
                ...req.body,
                password: hashedPassword
            });
        logger.info("Employee created", {
            employeeId: employee.id
        });
        res.status(201).json({
            message: "Employee created successfully",
            employee: sanitizeEmployee(employee)
        });

    } catch (error) {
        next(error);
    }
};

exports.updateEmployee = (req, res) => {
    const employee =
        employeeService.updateEmployee(
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
};

exports.deleteEmployee = (req, res) => {
    const employee =
        employeeService.getEmployeeById(
            req.params.id
        );

    if (!employee) {
        return res.status(404).json({
            message: "Employee not found"
        });
    }

    const deleted =
        employeeService.deleteEmployee(
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
};

exports.uploadPhoto = (req, res) => {
    const employee =
        employeeService.getEmployeeById(
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

    const updatedEmployee =
        employeeService.updateEmployeePhoto(
            req.params.id,
            req.file.path
        );

    logger.info("Profile photo uploaded", {
        employeeId: updatedEmployee.id,
        filename: req.file.filename
    });

    res.status(200).json({
        message: "Profile photo uploaded successfully",
        employee: sanitizeEmployee(updatedEmployee)
    });
};