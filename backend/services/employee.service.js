const bcrypt = require("bcrypt");
const sequelize = require("../config/database");
const {
    User,
    Employee,
    Department
} = require("../models");

const employeeIncludes = [
    {
        model: Department,
        as: "department"
    },
    {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "role", "photo"]
    }
];

const formatEmployee = (employee) => {
    if (!employee) {
        return null;
    }
    const data = employee.toJSON();
    return {
        id: data.employee_id,
        employee_id: data.employee_id,
        name: data.employee_name,
        email: data.email,
        salary: data.salary,
        joining_date: data.joining_date,
        department_id: data.department_id,
        department: data.department?.department_name || null,
        user_id: data.user_id,
        role: data.user?.role || "employee",
        photo: data.user?.photo || null
    };
};

exports.getAllEmployees = async () => {
    const employees = await Employee.findAll({
        include: employeeIncludes,
        order: [["employee_id", "ASC"]]
    });

    return employees.map(formatEmployee);
};

exports.getEmployeeById = async (id) => {
    const employee = await Employee.findByPk(id, {
        include: employeeIncludes
    });
    return formatEmployee(employee);
};

exports.createEmployee = async (data) => {
    const email = data.email.trim().toLowerCase();
    const department = await Department.findByPk(
        data.department_id
    );

    if (!department) {
        const error = new Error("Department not found");
        error.statusCode = 400;
        throw error;
    }
    const existingUser = await User.findOne({
        where: { email }
    });

    if (existingUser && existingUser.role !== "employee") {
        const error = new Error(
            "This email belongs to a non-employee account"
        );
        error.statusCode = 409;
        throw error;
    }

    const existingEmployee = await Employee.findOne({
        where: { email }
    });
    if (existingEmployee) {
        const error = new Error(
            "An employee record with this email already exists"
        );
        error.statusCode = 409;
        throw error;
    }

    const transaction = await sequelize.transaction();
    try {
        let user = existingUser;
        if (!user) {
            const hashedPassword = await bcrypt.hash(
                data.password,
                10
            );
            user = await User.create(
                {
                    name: data.name.trim(),
                    email,
                    password: hashedPassword,
                    role: "employee",
                    photo: null
                },
                { transaction }
            );
        } else {
            await user.update(
                { name: data.name.trim() },
                { transaction }
            );
        }

        const employee = await Employee.create(
            {
                employee_name: data.name.trim(),
                email,
                salary: data.salary,
                joining_date: data.joining_date,
                department_id: data.department_id,
                user_id: user.id
            },
            { transaction }
        );

        await transaction.commit();

        return exports.getEmployeeById(employee.employee_id);
    } catch (error) {
        await transaction.rollback();

        if (error.name === "SequelizeUniqueConstraintError") {
            error.statusCode = 409;
            error.message = "Email already exists";
        }

        throw error;
    }
};

exports.updateEmployee = async (id, data) => {
    const employee = await Employee.findByPk(id, {
        include: employeeIncludes
    });

    if (!employee) {
        return null;
    }

    if (data.department_id !== undefined) {
        const department = await Department.findByPk(
            data.department_id
        );

        if (!department) {
            const error = new Error("Department not found");
            error.statusCode = 400;
            throw error;
        }
    }

    const transaction = await sequelize.transaction();
    try {
        const updates = {};

        if (data.name !== undefined) {
            updates.employee_name = data.name.trim();
        }

        if (data.email !== undefined) {
            updates.email = data.email.trim().toLowerCase();
        }

        if (data.salary !== undefined) {
            updates.salary = data.salary;
        }

        if (data.joining_date !== undefined) {
            updates.joining_date = data.joining_date;
        }

        if (data.department_id !== undefined) {
            updates.department_id = data.department_id;
        }

        await employee.update(updates, { transaction });

        if (employee.user_id) {
            const userUpdates = {};

            if (data.name !== undefined) {
                userUpdates.name = data.name.trim();
            }

            if (data.email !== undefined) {
                userUpdates.email = data.email.trim().toLowerCase();
            }

            if (Object.keys(userUpdates).length > 0) {
                await User.update(userUpdates, {
                    where: { id: employee.user_id },
                    transaction
                });
            }
        }

        await transaction.commit();

        return exports.getEmployeeById(id);
    } catch (error) {
        await transaction.rollback();

        if (error.name === "SequelizeUniqueConstraintError") {
            error.statusCode = 409;
            error.message = "Email already exists";
        }

        throw error;
    }
};

exports.deleteEmployee = async (id) => {
    const employee = await Employee.findByPk(id);

    if (!employee) {
        return false;
    }
    await employee.destroy();
    return true;
};

exports.updateEmployeePhoto = async (id, photoPath) => {
    const employee = await Employee.findByPk(id, {
        include: employeeIncludes
    });

    if (!employee) {
        return null;
    }

    if (!employee.user_id) {
        const error = new Error(
            "This employee has no linked login account"
        );
        error.statusCode = 400;
        throw error;
    }

    await User.update(
        { photo: photoPath },
        { where: { id: employee.user_id } }
    );

    return exports.getEmployeeById(id);
};
