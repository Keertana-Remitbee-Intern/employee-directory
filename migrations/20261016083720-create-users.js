"use strict";
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(70),
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING(30),
                allowNull: false
            },
            department: {
                type: Sequelize.STRING(30),
                allowNull: true
            },
            role: {
                type: Sequelize.ENUM("admin", "employee"),
                allowNull: false,
                defaultValue: "employee"
            },
            photo: {
                type: Sequelize.STRING(100),
                allowNull: true
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("users");
    }
};
