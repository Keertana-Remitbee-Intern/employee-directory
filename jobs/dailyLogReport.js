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
    const report = `
Daily Employee Log Report
-------------------------------
Date: ${new Date().toISOString()}

Total users: ${users.length}
Total employees: ${employees.length}
Total admins: ${admins.length}
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
cron.schedule("0 16 * * *", generateDailyReport);
module.exports = generateDailyReport;