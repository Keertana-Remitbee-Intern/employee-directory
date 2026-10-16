const bcrypt = require("bcrypt");
const { User } = require("../models");

exports.getAllEmployees = async () => {
    return User.findAll({
        where: { role: "employee" },
        attributes: { exclude: ["password"] },
        order: [["id", "ASC"]]
    });
};
exports.getEmployeeById = async (id) => {
    return User.findOne({
        where: {
            id,
            role: "employee"
        },
        attributes: { exclude: ["password"] }
    });
};
exports.createEmployee = async (data) => {
    const hashedPassword = await bcrypt.hash(
        data.password,
        10
    );
    try {
        return await User.create({
            name: data.name,
            email: data.email.trim().toLowerCase(),
            password: hashedPassword,
            department: data.department,
            role: "employee",
            photo: null
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            error.statusCode = 409;
            error.message = "Email already exists";
        }
        throw error;
    }
};
exports.updateEmployee = async (id, data) => {
    const employee = await User.findOne({
        where: { id, role: "employee" }
    });
    if (!employee) {
        return null;
    }
    const updates = {};
    if (data.name !== undefined) {
        updates.name = data.name;
    }
    if (data.email !== undefined) {
        updates.email = data.email.trim().toLowerCase();
    }
    if (data.department !== undefined) {
        updates.department = data.department;
    }
    try {
        await employee.update(updates);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            error.statusCode = 409;
            error.message = "Email already exists";
        }
        throw error;
    }
    return employee;
};

exports.deleteEmployee = async (id) => {
    const employee = await User.findOne({
        where: { id, role: "employee" }
    });
    if (!employee) {
        return false;
    }
    await employee.destroy();
    return true;
};

exports.updateEmployeePhoto = async (id, photoPath) => {
    const employee = await User.findOne({
        where: { id, role: "employee" }
    });
    if (!employee) {
        return null;
    }
    await employee.update({
        photo: photoPath
    });
    return employee;
};
