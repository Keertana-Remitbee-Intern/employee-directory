const {
    Employee,
    LeaveRequest,
    Department
} = require("../models");

const leaveIncludes = [
    {
        model: Employee,
        as: "employee",
        attributes: [
            "employee_id",
            "employee_name",
            "email",
            "department_id"
        ],
        include: [
            {
                model: Department,
                as: "department",
                attributes: ["department_name"]
            }
        ]
    }
];

exports.getAllLeaves = async (req, res, next) => {
    try {
        const leaves = await LeaveRequest.findAll({
            include: leaveIncludes,
            order: [["leave_id", "DESC"]]
        });

        res.status(200).json({
            count: leaves.length,
            leaves
        });
    } catch (error) {
        next(error);
    }
};

exports.getMyLeaves = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({
            where: { user_id: req.user.id }
        });

        if (!employee) {
            return res.status(200).json({
                count: 0,
                leaves: []
            });
        }

        const leaves = await LeaveRequest.findAll({
            where: { employee_id: employee.employee_id },
            include: leaveIncludes,
            order: [["leave_id", "DESC"]]
        });

        res.status(200).json({
            count: leaves.length,
            leaves
        });
    } catch (error) {
        next(error);
    }
};

exports.createLeave = async (req, res, next) => {
    try {
        const { leave_type, start_date, end_date } = req.body;

        if (
            !leave_type ||
            !start_date ||
            !end_date
        ) {
            return res.status(400).json({
                message: "Leave type, start date and end date are required"
            });
        }

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(start_date) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(end_date) ||
            Number.isNaN(Date.parse(start_date)) ||
            Number.isNaN(Date.parse(end_date))
        ) {
            return res.status(400).json({
                message: "Dates must use YYYY-MM-DD format"
            });
        }

        if (end_date < start_date) {
            return res.status(400).json({
                message: "End date cannot be before start date"
            });
        }

        const employee = await Employee.findOne({
            where: { user_id: req.user.id }
        });

        if (!employee) {
            return res.status(400).json({
                message: "Your account is not linked to an employee record"
            });
        }

        const leave = await LeaveRequest.create({
            employee_id: employee.employee_id,
            leave_type: leave_type.trim(),
            start_date,
            end_date
        });

        const result = await LeaveRequest.findByPk(
            leave.leave_id,
            { include: leaveIncludes }
        );

        res.status(201).json({
            message: "Leave request submitted successfully",
            leave: result
        });
    } catch (error) {
        next(error);
    }
};

exports.updateLeaveStatus = async (req, res, next) => {
    try {
        const status = String(req.body.status || "").toUpperCase();

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                message: "Status must be APPROVED or REJECTED"
            });
        }

        const leave = await LeaveRequest.findByPk(req.params.id);

        if (!leave) {
            return res.status(404).json({
                message: "Leave request not found"
            });
        }

        await leave.update({ status });

        const updatedLeave = await LeaveRequest.findByPk(
            leave.leave_id,
            { include: leaveIncludes }
        );

        res.status(200).json({
            message: "Leave request status updated",
            leave: updatedLeave
        });
    } catch (error) {
        next(error);
    }
};
