const User = require("./User");
const Department = require("./Department");
const Employee = require("./Employee");
const LeaveRequest = require("./LeaveRequest");

Department.hasMany(Employee, {
    foreignKey: "department_id",
    as: "employees"
});
Employee.belongsTo(Department, {
    foreignKey: "department_id",
    as: "department"
});
Employee.hasMany(LeaveRequest, {
    foreignKey: "employee_id",
    as: "leaveRequests"
});
LeaveRequest.belongsTo(Employee, {
    foreignKey: "employee_id",
    as: "employee"
});

module.exports = {
    User,
    Department,
    Employee,
    LeaveRequest
};