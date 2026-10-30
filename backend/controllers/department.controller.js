const { Department } = require("../models");

exports.getDepartments = async (req, res, next) => {
    try {
        const departments = await Department.findAll({
            attributes: ["department_id", "department_name"],
            order: [["department_name", "ASC"]]
        });

        res.status(200).json({
            count: departments.length,
            departments
        });
    } catch (error) {
        next(error);
    }
};
