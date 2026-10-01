const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const users = require("../data/users");
const logger = require("../middleware/logger.middleware");
const reportPath = path.join(__dirname,"..","logs","daily-report.log");

const generateDailyReport = () => {
    const employees = users.filter(
        user => user.role === "employee"
    );
    const admins = users.filter(
        user => user.role === "admin"
    );
    const employeesWithPhotos =
        employees.filter(
            employee => employee.photo
        );
    const report = `
Daily Employee Log Report
--
`;

    fs.appendFileSync(
        reportPath,
        report
    );
    logger.info(
        "Daily log report generated",
        {
            employeeCount:
                employees.length
        }
    );
};


module.exports = generateDailyReport;