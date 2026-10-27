const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { User } = require("../models");
const logger = require("../middleware/logger.middleware");
const reportPath = path.join(
    __dirname,
    "..",
    "logs",
    "daily-report.log"
);

const generateDailyReport = async () => {
    try {
        const totalUsers = await User.count();
        const totalEmployees = await User.count({
            where: { role: "employee" }
        });
        const totalAdmins = await User.count({
            where: { role: "admin" }
        });
        fs.mkdirSync(path.dirname(reportPath), {
            recursive: true
        });
        const report = `
Daily Employee Log Report
-------------------------------
Date: ${new Date().toISOString()}

Total users: ${totalUsers}
Total employees: ${totalEmployees}
Total admins: ${totalAdmins}
`;

        await fs.promises.appendFile(reportPath, report);
        logger.info("Daily log report generated", {
            employeeCount: totalEmployees
        });
    } catch (error) {
        logger.error("Failed to generate daily log report", {
            error: error.message
        });
    }
};
cron.schedule("0 16 * * *", generateDailyReport);
module.exports = generateDailyReport;