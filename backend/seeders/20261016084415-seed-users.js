"use strict";
const bcrypt = require("bcrypt");

module.exports = {
    async up(queryInterface) {
        const users = [
            {
                name: "Admin User",
                email: "admin@gmail.com",
                password: "admin123",
                department: "Management",
                role: "admin",
                photo: null
            },
            {
                name: "Anu",
                email: "anu@gmail.com",
                password: "anu123",
                department: "IT",
                role: "employee",
                photo: null
            },
            {
                name: "Banu",
                email: "banu@gmail.com",
                password: "banu123",
                department: "IT",
                role: "employee",
                photo: null
            }
        ];

        const emails = users.map(user => user.email);

        const existingUsers = await queryInterface.sequelize.query(
            "SELECT email FROM users WHERE email IN (:emails)",
            {
                replacements: { emails },
                type: queryInterface.sequelize.QueryTypes.SELECT
            }
        );
        const existingEmails = new Set(
            existingUsers.map(user => user.email)
        );

        const newUsers = [];
        for (const user of users) {
            if (existingEmails.has(user.email)) continue;

            newUsers.push({
                ...user,
                password: await bcrypt.hash(user.password, 10)
            });
        }
        if (newUsers.length > 0) {
            await queryInterface.bulkInsert("users", newUsers);
        }
        console.log(`${newUsers.length} user(s) seeded.`);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("users", {
            email: [
                "admin@gmail.com",
                "anu@gmail.com",
                "banu@gmail.com"
            ]
        });
    }
};
