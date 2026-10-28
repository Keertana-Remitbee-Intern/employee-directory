const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(70),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM("admin", "employee"),
            allowNull: false,
            defaultValue: "employee"
        },
        photo: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    },
    {
        tableName: "users",
        timestamps: false
    }
);

module.exports = User;