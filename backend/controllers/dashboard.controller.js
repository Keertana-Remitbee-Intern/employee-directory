const { Op } = require("sequelize");
const { Employee, Department, LeaveRequest } = require("../models");

exports.getSummary = async (req, res, next) => {
    try {
        const isAdmin = req.user.role === "admin";
        let employee = null;
        let employeeId = null;

        if (!isAdmin) {
            employee = await Employee.findOne({
                where: { user_id: req.user.id },
                include: [
                    {
                        model: Department,
                        as: "department",
                        attributes: ["department_name"]
                    }
                ]
            });
            employeeId = employee?.employee_id || null;
        }

        const employeeWhere = isAdmin
            ? {}
            : employeeId
                ? { employee_id: employeeId }
                : { employee_id: -1 };
        const now = new Date();
        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );
        const startOfNextMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };
        const monthStart = formatDate(startOfMonth);
        const nextMonthStart = formatDate(startOfNextMonth);
        const [
            totalEmployees,
            totalDepartments,
            leaves,
            recentLeaves
        ] = await Promise.all([
            isAdmin ? Employee.count() : Promise.resolve(0),
            isAdmin ? Department.count() : Promise.resolve(0),

            LeaveRequest.findAll({
                where: employeeWhere
            }),

            // Five latest requests whose leave starts this month.
            LeaveRequest.findAll({
                where: {
                    ...employeeWhere,
                    start_date: {
                        [Op.gte]: monthStart,
                        [Op.lt]: nextMonthStart
                    }
                },
                include: [
                    {
                        model: Employee,
                        as: "employee",
                        attributes: [
                            "employee_id",
                            "employee_name",
                            "email"
                        ],
                        include: [
                            {
                                model: Department,
                                as: "department",
                                attributes: ["department_name"]
                            }
                        ]
                    }
                ],
                order: [["leave_id", "DESC"]],
                limit: 5
            })
        ]);

        const pendingLeaves = leaves.filter(
            (leave) =>
                String(leave.status).toUpperCase() === "PENDING"
        ).length;
        const approvedLeaves = leaves.filter(
            (leave) =>
                String(leave.status).toUpperCase() === "APPROVED"
        ).length;
        res.status(200).json({
            summary: {
                totalEmployees,
                totalDepartments,
                pendingLeaves,
                approvedLeaves,
                myLeaveRequests: isAdmin ? 0 : leaves.length,
                myPendingLeaves: isAdmin ? 0 : pendingLeaves
            },
            employeeProfile: employee
                ? {
                    employee_id: employee.employee_id,
                    department:
                        employee.department?.department_name || null,
                    joining_date: employee.joining_date
                }
                : null,
            recentLeaves
        });
    } catch (error) {
        next(error);
    }
};
