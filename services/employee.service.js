const users = require("../data/users");
let nextEmployeeId = 4;

exports.getAllEmployees = () => {
    return users.filter(
        user => user.role === "employee"
    );
};

exports.getEmployeeById = (id) => {
    return users.find(
        user => user.id === Number(id) && user.role === "employee"
    );
};

exports.createEmployee = (data) => {
    const employee = {
        id: nextEmployeeId++,
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department,
        role: "employee",
        photo: null
    };
    users.push(employee);
    return employee;
};

exports.updateEmployee = (id, data) => {
    const employee = exports.getEmployeeById(id);
    if (!employee) {
        return null;
    }
    if (data.name !== undefined) {
        employee.name = data.name;
    }
    if (data.email !== undefined) {
        employee.email = data.email;
    }
    if (data.department !== undefined) {
        employee.department = data.department;
    }
    return employee;
};

exports.deleteEmployee = (id) => {
    const index = users.findIndex(
        user =>
            user.id === Number(id) &&
            user.role === "employee"
    );
    if (index === -1) {
        return false;
    }
    users.splice(index, 1);
    return true;
};

exports.updateEmployeePhoto = (id, photoPath) => {
    const employee = exports.getEmployeeById(id);
    if (!employee) {
        return null;
    }
    employee.photo = photoPath;
    return employee;
};